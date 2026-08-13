import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../bd/supabase"
import { categoriasDoLocal } from "../lib/categorias"
import { mediaDeEstrelas } from "../lib/avaliacoes"
import { distanciaAte, usePosicaoUsuario } from "../lib/distancia"
import { linkDoMapa } from "../lib/maps"
import FormAvaliacao from "./formAvaliacao"

interface LocalDb {
    nome: string
    descricao: string | null
    fotos: string[] | null
    id_categoria: number[] | null
    id_endereco: string | null
}

interface EnderecoDb {
    rua: string
    numero: string | null
    bairro: string | null
    cidade: string | null
    estado: string | null
    cep: string | null
    latitude: number | null
    longitude: number | null
}

interface AvaliacaoDb {
    id_avaliacao: number
    id_usuario: string | null
    texto: string | null
    estrelas: number
}

// A avaliação guarda só o id do usuário, então o e-mail vem da tabela usuarios
interface Avaliacao extends AvaliacaoDb {
    email: string
}

interface DadosLocal {
    local: LocalDb
    endereco: EnderecoDb | null
    avaliacoes: Avaliacao[]
}

// Busca o e-mail de quem avaliou, numa consulta só para todos os ids
async function buscarEmails(avaliacoes: AvaliacaoDb[]): Promise<Avaliacao[]> {
    const ids = [...new Set(avaliacoes
        .map((avaliacao) => avaliacao.id_usuario)
        .filter((id): id is string => Boolean(id))
    )]

    if (ids.length === 0) {
        return avaliacoes.map((avaliacao) => ({ ...avaliacao, email: "Usuário" }))
    }

    const { data, error } = await supabase
        .from('usuarios')
        .select('id_usuario, user_email')
        .in('id_usuario', ids)

    if (error) {
        console.error('Erro ao buscar os usuários das avaliações:', error)
    }

    const usuarios: { id_usuario: string, user_email: string }[] = data ?? []

    return avaliacoes.map((avaliacao) => ({
        ...avaliacao,
        email: usuarios.find((usuario) => usuario.id_usuario === avaliacao.id_usuario)?.user_email ?? "Usuário"
    }))
}

async function buscarDadosDoLocal(id_local: string): Promise<DadosLocal | null> {
    const { data: local, error } = await supabase
        .from('local_doacao')
        .select('nome, descricao, fotos, id_categoria, id_endereco')
        .eq('id_local', id_local)
        .single<LocalDb>()

    if (error || !local) {
        console.error('Erro ao buscar o local de doação:', error)
        return null
    }

    // O endereço fica em outra tabela, ligado pelo id_endereco do local
    const [resultadoEndereco, resultadoAvaliacoes] = await Promise.all([
        local.id_endereco
            ? supabase
                .from('endereco')
                .select('rua, numero, bairro, cidade, estado, cep, latitude, longitude')
                .eq('id_endereco', local.id_endereco)
                .single<EnderecoDb>()
            : Promise.resolve({ data: null, error: null }),
        supabase
            .from('avaliacao')
            .select('id_avaliacao, id_usuario, texto, estrelas')
            .eq('id_local', id_local)
            .order('id_avaliacao', { ascending: false })
    ])

    if (resultadoEndereco.error) {
        console.error('Erro ao buscar o endereço:', resultadoEndereco.error)
    }

    if (resultadoAvaliacoes.error) {
        console.error('Erro ao buscar as avaliações:', resultadoAvaliacoes.error)
    }

    return {
        local,
        endereco: resultadoEndereco.data,
        avaliacoes: await buscarEmails(resultadoAvaliacoes.data ?? [])
    }
}

export default function PaginaDoacao() {
    const location = useLocation()
    const navigate = useNavigate()
    const id_local = location.state?.id_local ?? ""
    const id_usuario = location.state?.id_usuario ?? ""
    const minhaPosicao = usePosicaoUsuario()
    const [dados, setDados] = useState<DadosLocal | null>(null)
    // Sem id no navigate não há o que carregar
    const [carregando, setCarregando] = useState<boolean>(Boolean(id_local))

    useEffect(() => {
        if (!id_local) return

        let ativo = true
        buscarDadosDoLocal(id_local).then((resultado) => {
            if (!ativo) return
            setDados(resultado)
            setCarregando(false)
        })

        return () => { ativo = false }
    }, [id_local])

    // Depois de avaliar, recarrega para a nova avaliação entrar na média e na lista
    function avaliacaoEnviada() {
        buscarDadosDoLocal(id_local).then(setDados)
    }

    if (carregando) {
        return <section id="pagina-doacao" className="min-h-screen p-30">
            <p className="font-light">Carregando o local...</p>
        </section>
    }

    if (!dados) {
        return <section id="pagina-doacao" className="min-h-screen p-30">
            <p className="font-light">Local de doação não encontrado.</p>
            <button
                onClick={() => navigate(-1)}
                className="bg-primary-color text-secondary-color py-3 px-10 my-10 rounded-lg"
            >
                Voltar
            </button>
        </section>
    }

    const { local, endereco, avaliacoes } = dados
    const categorias = categoriasDoLocal(local.id_categoria)
    const numeroEstrelas = mediaDeEstrelas(avaliacoes.map((avaliacao) => avaliacao.estrelas))
    const cidadeEstado = [endereco?.cidade, endereco?.estado].filter(Boolean).join(' - ')
    const distancia = distanciaAte(minhaPosicao, endereco)
    const rotaNoMapa = endereco ? linkDoMapa(endereco) : null

    return <section id="pagina-doacao" className="min-h-screen flex p-30">
        <section className="w-[30vw] ">
            {local.fotos?.[0] ? (
                <img src={local.fotos[0]} alt="local-doacao" className="rounded-lg w-full aspect-square object-cover bg-gray-100" />
            ) : (
                <div className="rounded-lg w-100 h-100 aspect-square bg-gray-300" />
            )}

            {local.fotos && local.fotos.length > 1 && (
                <div className="flex gap-2 mt-3">
                    {local.fotos.slice(1).map((foto) => (
                        <img key={foto} src={foto} alt="local-doacao" className="rounded-lg w-10 h-10 object-cover" />
                    ))}
                </div>
            )}

            <div className="flex justify-evenly items-center py-4 bg-primary-color/20 my-3 rounded-lg">
                <div>
                    <h2 className="font-bold text-center text-3xl">{avaliacoes.length}</h2>
                    <h3>Avaliações</h3>
                </div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <span
                        key={index}
                        className={`material-icons scale-200 ${index < numeroEstrelas ? 'text-yellow-600' : 'text-gray-400'}`}
                    >
                        star
                    </span>
                ))}
            </div>

            <h2 className="font-bold text-2xl">Aceitamos</h2>
            <div className="flex flex-wrap gap-3 py-3">
                {categorias.map((categoria) => (
                    <div key={categoria.id_categoria} className="flex items-center gap-1">
                        <span className="material-icons text-primary-color">{categoria.icone}</span>
                        <span className="font-light">{categoria.nome}</span>
                    </div>
                ))}
            </div>
        </section>

        <section className="w-[40vw] p-15">
            <h3 className="text-yellow-600">
                {[cidadeEstado, distancia].filter(Boolean).join(' | ')}
            </h3>
            <h2 className="text-3xl font-bold">{local.nome}</h2>

            {endereco && (
                <p className="font-light py-2">
                    {endereco.rua}{endereco.numero ? `, ${endereco.numero}` : ""}
                    {endereco.bairro ? ` — ${endereco.bairro}` : ""}
                    {endereco.cep ? ` — CEP ${endereco.cep}` : ""}
                </p>
            )}

            <h4 className="font-bold">Sobre o local</h4>
            <p className="text-justify">{local.descricao}</p>

            <button
                disabled={!rotaNoMapa}
                title={rotaNoMapa ? "Abre a rota até o local no Google Maps" : "Esse local não tem endereço cadastrado"}
                onClick={() => rotaNoMapa && window.open(rotaNoMapa, '_blank', 'noopener,noreferrer')}
                className="bg-primary-color text-secondary-color py-3 px-10 w-full my-10 rounded-lg disabled:opacity-60"
            >
                Quero Doar
            </button>

            {id_usuario ? (
                <FormAvaliacao
                    id_local={id_local}
                    id_usuario={id_usuario}
                    onEnviada={avaliacaoEnviada}
                />
            ) : (
                <p className="font-light py-4">Entre na sua conta para avaliar este local.</p>
            )}

            {avaliacoes.length > 0 && (
                <>
                    <h4 className="font-bold">O que dizem do local</h4>
                    {avaliacoes.map((avaliacao) => (
                        <div key={avaliacao.id_avaliacao} className="py-3 border-t border-gray-300">
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <span
                                            key={index}
                                            className={`material-icons ${index < avaliacao.estrelas ? 'text-yellow-600' : 'text-gray-400'}`}
                                        >
                                            star
                                        </span>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-700">{avaliacao.email}</span>
                            </div>
                            {avaliacao.texto && <p className="font-light text-justify">{avaliacao.texto}</p>}
                        </div>
                    ))}
                </>
            )}
        </section>
    </section>
}
