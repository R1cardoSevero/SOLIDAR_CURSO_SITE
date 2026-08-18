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
                <div className="grid grid-cols-3 gap-4">
                    {locais.map((local) => (
                        <div
                            key={local.id_local}
                            className="p-5 rounded-lg bg-secondary-color/50 border border-gray-400"
                        >
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
