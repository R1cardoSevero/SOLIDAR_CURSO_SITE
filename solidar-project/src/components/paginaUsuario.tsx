import { useCallback, useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../bd/supabase'
import FormNovoLocal from './formNovoLocal'

interface LocalDb {
    id_local: string
    nome: string
    descricao: string | null
    fotos: string[] | null
    id_endereco: string | null
}

// A latitude e a longitude não entram: o card só mostra o endereço escrito
interface EnderecoDb {
    id_endereco: string
    rua: string
    numero: string | null
    bairro: string | null
    cidade: string | null
    estado: string | null
    cep: string | null
}

// O endereço fica em outra tabela, ligado pelo id_endereco do local
interface LocalDoacao extends LocalDb {
    endereco: EnderecoDb | null
}

// As fotos ficam no bucket "fotos" e a tabela guarda só o link público delas.
// Para apagar o arquivo é preciso o caminho de volta, que é o que vem depois
// desse trecho da URL.
const MARCADOR_BUCKET = '/object/public/fotos/'

function caminhoNoBucket(url: string) {
    const partes = url.split(MARCADOR_BUCKET)
    return partes.length === 2 ? decodeURIComponent(partes[1]) : null
}

// Sobra de arquivo no bucket não quebra nada para o usuário, então uma falha
// aqui só é registrada: o local já saiu das tabelas nesse ponto.
async function removerFotos(fotos: string[] | null) {
    const caminhos = (fotos ?? [])
        .map(caminhoNoBucket)
        .filter((caminho): caminho is string => Boolean(caminho))

    if (caminhos.length === 0) return

    const { error } = await supabase.storage.from('fotos').remove(caminhos)

    if (error) {
        console.error('Erro ao apagar as fotos do local:', error)
    }
}

// Busca os endereços de todos os locais numa consulta só
async function buscarEnderecos(locais: LocalDb[]): Promise<EnderecoDb[]> {
    const ids = [...new Set(locais
        .map((local) => local.id_endereco)
        .filter((id): id is string => Boolean(id))
    )]

    if (ids.length === 0) return []

    const { data, error } = await supabase
        .from('endereco')
        .select('id_endereco, rua, numero, bairro, cidade, estado, cep')
        .in('id_endereco', ids)

    if (error) {
        console.error('Erro ao buscar os endereços:', error)
        return []
    }

    return data ?? []
}

export default function PaginaUsuario() {
    const location = useLocation()
    const navigate = useNavigate()
    const id_usuario = location.state?.id ?? ""
    const [locais, setLocais] = useState<LocalDoacao[]>([])
    const [cadastrando, setCadastrando] = useState<boolean>(false)
    // Guarda o id do local que está sendo excluído, para travar só o botão dele
    const [excluindo, setExcluindo] = useState<string>("")
    const [infoErro, setInfoErro] = useState<string>("")

    const buscarLocais = useCallback(async (id: string): Promise<LocalDoacao[]> => {
        const { data, error } = await supabase
            .from('local_doacao')
            .select('id_local, nome, descricao, fotos, id_endereco')
            .eq('id_usuario', id)

        if (error) {
            console.error('Erro ao buscar locais de doação:', error)
            return []
        }

        const dados: LocalDb[] = data ?? []
        const enderecos = await buscarEnderecos(dados)

        return dados.map((local) => ({
            ...local,
            endereco: enderecos.find((endereco) => endereco.id_endereco === local.id_endereco) ?? null
        }))
    }, [])

    useEffect(() => {
        if (!id_usuario) return

        let ativo = true
        buscarLocais(id_usuario).then((dados) => {
            if (ativo) setLocais(dados)
        })

        return () => { ativo = false }
    }, [id_usuario, buscarLocais])

    // Depois de cadastrar, fecha o formulário e recarrega a lista
    function localCriado() {
        setCadastrando(false)
        buscarLocais(id_usuario).then(setLocais)
    }

    // As avaliações e o endereço apontam para o local, então a ordem importa:
    // primeiro o que depende dele, depois ele, e por último o endereço, que é
    // só desse local. As fotos ficam para o fim porque, se algo falhar antes,
    // o local continua inteiro em vez de ficar sem imagem.
    async function excluirLocal(local: LocalDoacao) {
        const confirmado = window.confirm(
            `Excluir "${local.nome}"? As avaliações e as fotos do local também são apagadas, e isso não pode ser desfeito.`
        )

        if (!confirmado) return

        setExcluindo(local.id_local)
        setInfoErro("")

        try {
            const { error: erroAvaliacoes } = await supabase
                .from('avaliacao')
                .delete()
                .eq('id_local', local.id_local)

            if (erroAvaliacoes) throw erroAvaliacoes

            const { error: erroLocal } = await supabase
                .from('local_doacao')
                .delete()
                .eq('id_local', local.id_local)

            if (erroLocal) throw erroLocal

            if (local.id_endereco) {
                const { error: erroEndereco } = await supabase
                    .from('endereco')
                    .delete()
                    .eq('id_endereco', local.id_endereco)

                if (erroEndereco) {
                    console.error('Erro ao apagar o endereço do local:', erroEndereco)
                }
            }

            await removerFotos(local.fotos)

            setLocais((atuais) => atuais.filter((item) => item.id_local !== local.id_local))
        } catch (erro) {
            console.error('Erro ao excluir o local:', erro)
            setInfoErro(`Não foi possível excluir "${local.nome}". Tente novamente.`)
        } finally {
            setExcluindo("")
        }
    }

    return <main className="min-h-screen p-10">
        <div className="flex items-center gap-3">
            <User className="w-10 h-10 shrink-0 rounded-full bg-secondary-color p-2" strokeWidth={1.5} />
            <h1 className="font-minhafonte text-4xl">MEU PERFIL</h1>
            <span className="ml-auto hover:scale-150 duration-300 material-icons text-primary-color" onClick={() => navigate('/home', { state: { id: id_usuario } })}>close</span>
        </div>

        {locais.length > 0 && (
            <section id="locais-section" className="py-10">
                <div className='flex gap-3 flex-col justify-center p-3'>
                    <h2 className="font-light text-2xl pb-4">Seus Locais</h2>
                    {cadastrando ? (
                        <>
                            <FormNovoLocal id_usuario={id_usuario} onCriado={localCriado} />
                            <button
                                className="mt-3 p-3 py-2 rounded-lg border border-gray-400"
                                onClick={() => setCadastrando(false)}
                            >
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <button
                            className="p-3 rounded-lg bg-primary-color text-secondary-color hover:scale-105 duration-300"
                            onClick={() => setCadastrando(true)}
                        >
                            Novo local
                        </button>
                    )}
                </div>
                {infoErro && <p className="msg-erro text-red-700 px-3 pb-3">{infoErro}</p>}
                <div className="grid grid-cols-3 gap-4">
                    {locais.map((local) => (
                        <div
                            key={local.id_local}
                            className="relative p-5 pr-14 rounded-lg bg-secondary-color/50 border border-gray-400"
                        >
                            <button
                                type="button"
                                title="Excluir local"
                                disabled={excluindo === local.id_local}
                                onClick={() => excluirLocal(local)}
                                className="material-icons absolute right-3 top-3 p-2 rounded-lg text-gray-500 hover:text-red-600 hover:scale-110 duration-300 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {excluindo === local.id_local ? "hourglass_empty" : "delete"}
                            </button>
                            <div className="items-center gap-2">
                                <h3 className='font-semibold'>Título</h3>
                                <p className="font-light">{local.nome}</p>
                            </div>
                            {local.descricao && (
                                <div className='py-3'>
                                    <h3 className='font-semibold'>Descrição</h3>
                                    <p className="font-light">{local.descricao}</p>
                                </div>
                            )}
                            {local.endereco && (
                                <div className='py-3'>
                                    <h3 className='font-semibold'>Endereço</h3>
                                    <p className="font-light">
                                        {local.endereco.rua}{local.endereco.numero ? `, ${local.endereco.numero}` : ""}
                                    </p>
                                    <p className="font-light">
                                        {[local.endereco.bairro, [local.endereco.cidade, local.endereco.estado].filter(Boolean).join(' - ')]
                                            .filter(Boolean)
                                            .join(' — ')}
                                    </p>
                                    {local.endereco.cep && <p className="font-light">CEP {local.endereco.cep}</p>}
                                </div>
                            )}
                            {local.fotos && local.fotos.length > 0 && (
                                <img
                                    src={local.fotos[0]}
                                    alt={local.nome}
                                    className="w-full h-40 object-cover rounded-lg mt-3"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}

    </main>
}
