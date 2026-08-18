import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { supabase } from '../bd/supabase'

interface Coordenadas {
    latitude: number | null
    longitude: number | null
}

interface Categoria {
    id_categoria: number
    nome: string
}

interface EnderecoCep {
    rua: string
    bairro: string
    cidade: string
    estado: string
    latitude: number | null
    longitude: number | null
}

// Resposta da BrasilAPI, usada só pelas coordenadas do cep
interface RespostaBrasilApi {
    location?: {
        coordinates?: {
            latitude?: string
            longitude?: string
        }
    }
}

// Resposta da ViaCEP (api aberta, sem chave): https://viacep.com.br/
interface RespostaViaCep {
    logradouro?: string
    bairro?: string
    localidade?: string
    uf?: string
    erro?: boolean | string
}



// Enquanto a tabela categoria não responde, usa os números de 1 a 20
const CATEGORIAS_PADRAO: Categoria[] = Array.from({ length: 20 }, (_, indice) => ({
    id_categoria: indice + 1,
    nome: `Categoria ${indice + 1}`
}))

// O bucket não aceita espaços e acentos no caminho do arquivo
function limparNomeArquivo(nome: string) {
    return nome.normalize('NFD').replace(/[^a-zA-Z0-9.]/g, '-')
}

export default function FormNovoLocal({ id_usuario, onCriado }: { id_usuario: string, onCriado: () => void }) {
    const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_PADRAO)
    const [nome, setNome] = useState<string>("")
    const [descricao, setDescricao] = useState<string>("")
    const [idsCategorias, setIdsCategorias] = useState<number[]>([])
    const [cep, setCep] = useState<string>("")
    const [numero, setNumero] = useState<string>("")
    const [endereco, setEndereco] = useState<EnderecoCep | null>(null)
    const [buscandoCep, setBuscandoCep] = useState<boolean>(false)
    const [fotos, setFotos] = useState<File[]>([])
    const [enviando, setEnviando] = useState<boolean>(false)
    const [infoErro, setInfoErro] = useState<string>("")

    async function buscarCategorias() {
        const { data, error } = await supabase
            .from('categoria')
            .select('id_categoria, nome')
            .order('id_categoria')

        if (error) {
            console.error('Erro ao buscar categorias:', error)
            return []
        }

        return data ?? []
    }

    useEffect(() => {
        let ativo = true
        buscarCategorias().then((dados) => {
            if (ativo && dados.length > 0) setCategorias(dados)
        })

        return () => { ativo = false }
    }, [])

    // A ViaCEP não devolve coordenadas, então elas vêm da BrasilAPI.
    // É só o que dá a distância até o usuário depois, e falhar aqui não impede
    // o cadastro: o local fica sem distância.
    async function buscarCoordenadas(cepLimpo: string): Promise<Coordenadas> {
        try {
            const resposta = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`)

            if (!resposta.ok) return { latitude: null, longitude: null }

            const dados: RespostaBrasilApi = await resposta.json()
            const coordenadas = dados.location?.coordinates

            if (!coordenadas?.latitude || !coordenadas?.longitude) {
                return { latitude: null, longitude: null }
            }

            return {
                latitude: Number(coordenadas.latitude),
                longitude: Number(coordenadas.longitude)
            }
        } catch (erro) {
            console.error('Erro ao buscar as coordenadas do CEP:', erro)
            return { latitude: null, longitude: null }
        }
    }

    // Preenche rua, bairro, cidade e estado a partir do cep digitado
    async function buscarCep(cepLimpo: string) {
        setBuscandoCep(true)
        setInfoErro("")

        try {
            const [resposta, coordenadas] = await Promise.all([
                fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`),
                buscarCoordenadas(cepLimpo)
            ])

            if (!resposta.ok) {
                throw new Error('Não foi possível consultar o CEP agora. Tente novamente.')
            }

            const dados: RespostaViaCep = await resposta.json()

            if (dados.erro) {
                setEndereco(null)
                setInfoErro("CEP não encontrado. Confira o número digitado.")
                return
            }

            setEndereco({
                rua: dados.logradouro ?? "",
                bairro: dados.bairro ?? "",
                cidade: dados.localidade ?? "",
                estado: dados.uf ?? "",
                latitude: coordenadas.latitude,
                longitude: coordenadas.longitude
            })
        } catch (erro) {
            setEndereco(null)
            setInfoErro(erro instanceof Error ? erro.message : "Erro ao consultar o CEP.")
        } finally {
            setBuscandoCep(false)
        }
    }

    function digitarCep(e: ChangeEvent<HTMLInputElement>) {
        const cepLimpo = e.target.value.replace(/\D/g, '').slice(0, 8)
        setCep(cepLimpo)
        setEndereco(null)
        setInfoErro("")

        if (cepLimpo.length === 8) {
            buscarCep(cepLimpo)
        }
    }

    function marcarCategoria(id: number) {
        setInfoErro("")
        setIdsCategorias((atuais) => (
            atuais.includes(id)
                ? atuais.filter((idAtual) => idAtual !== id)
                : [...atuais, id]
        ))
    }

    function escolherFotos(e: ChangeEvent<HTMLInputElement>) {
        const arquivos = Array.from(e.target.files ?? [])
        setInfoErro("")

        if (arquivos.length > MAX_FOTOS) {
            setInfoErro(`Escolha no máximo ${MAX_FOTOS} fotos.`)
            e.target.value = ""
            setFotos([])
            return
        }

        setFotos(arquivos)
    }

    // Sobe cada foto no bucket e devolve os links públicos que vão para a tabela
    async function enviarFotos(arquivos: File[]) {
        const links: string[] = []

        for (const [indice, arquivo] of arquivos.entries()) {
            const caminho = `${id_usuario}/${Date.now()}-${indice}-${limparNomeArquivo(arquivo.name)}`

            const { error } = await supabase.storage
                .from('fotos')
                .upload(caminho, arquivo)

            if (error) {
                console.error('Erro ao enviar foto:', error)
                throw new Error('Não foi possível enviar as fotos. Tente novamente.')
            }

            const { data } = supabase.storage.from('fotos').getPublicUrl(caminho)
            links.push(data.publicUrl)
        }

        return links
    }

    // O endereço entra primeiro porque o local guarda o id_endereco dele
    async function inserirEndereco(dados: EnderecoCep) {
        const { data, error } = await supabase
            .from('endereco')
            .insert({
                rua: dados.rua,
                numero: numero.trim(),
                bairro: dados.bairro,
                cidade: dados.cidade,
                estado: dados.estado,
                cep,
                latitude: dados.latitude,
                longitude: dados.longitude
            })
            .select('id_endereco')
            .single<{ id_endereco: string }>()

        if (error || !data) {
            console.error('Erro ao cadastrar endereço:', error)
            throw new Error('Não foi possível cadastrar o endereço. Tente novamente.')
        }

        return data.id_endereco
    }

    async function inserirLocal(id_endereco: string, links: string[]) {
        const { error } = await supabase
            .from('local_doacao')
            .insert({
                id_usuario,
                id_endereco,
                nome: nome.trim(),
                descricao: descricao.trim(),
                fotos: links,
                id_categoria: idsCategorias // a coluna guarda a lista de categorias
            })

        if (error) {
            console.error('Erro ao cadastrar local:', error)
            throw new Error('Não foi possível cadastrar o local. Tente novamente.')
        }
    }

    function limparFormulario() {
        setNome("")
        setDescricao("")
        setIdsCategorias([])
        setCep("")
        setNumero("")
        setEndereco(null)
        setFotos([])
    }

    async function Cadastrar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setInfoErro("")

        if (!nome.trim()) {
            setInfoErro("Informe o nome do local.")
            return
        }

        if (!descricao.trim()) {
            setInfoErro("Informe a descrição do local.")
            return
        }

        if (idsCategorias.length === 0) {
            setInfoErro("Escolha pelo menos uma categoria.")
            return
        }

        if (cep.length !== 8) {
            setInfoErro("Informe um CEP com 8 números.")
            return
        }

        if (!endereco) {
            setInfoErro("Aguarde a busca do CEP terminar para conferir o endereço.")
            return
        }

        if (!numero.trim()) {
            setInfoErro("Informe o número do endereço.")
            return
        }

        if (fotos.length === 0) {
            setInfoErro("Escolha pelo menos uma foto do local.")
            return
        }

        if (fotos.length > MAX_FOTOS) {
            setInfoErro(`Escolha no máximo ${MAX_FOTOS} fotos.`)
            return
        }

        setEnviando(true)

        try {
            const links = await enviarFotos(fotos)
            const id_endereco = await inserirEndereco(endereco)
            await inserirLocal(id_endereco, links)

            limparFormulario()
            onCriado()
        } catch (erro) {
            setInfoErro(erro instanceof Error ? erro.message : "Erro ao cadastrar o local.")
        } finally {
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={Cadastrar} noValidate className="flex flex-col gap-3 max-w-2xl">
            <label className="flex flex-col gap-1">
                Nome do local
                <input
                    type="text"
                    placeholder="Ex: Ponto de coleta Centro"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="p-2 rounded-lg bg-secondary-color/50 border border-gray-400"
                />
            </label>

            <label className="flex flex-col gap-1">
                Descrição
                <textarea
                    rows={3}
                    placeholder="Conte o que esse local recebe de doação"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    className="p-2 rounded-lg bg-secondary-color/50 border border-gray-400"
                />
            </label>

            <fieldset className="flex flex-col gap-2">
                <legend className="pb-1">Categorias</legend>
                <div className="grid grid-cols-3 gap-2">
                    {categorias.map((categoria) => (
                        <label key={categoria.id_categoria} className="flex items-center gap-2 font-light">
                            <input
                                type="checkbox"
                                checked={idsCategorias.includes(categoria.id_categoria)}
                                onChange={() => marcarCategoria(categoria.id_categoria)}
                            />
                            {categoria.nome}
                        </label>
                    ))}
                </div>
            </fieldset>

            <h3 className="font-bold pt-2">Endereço</h3>

            <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                    CEP
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="somente números"
                        value={cep}
                        onChange={digitarCep}
                        className="p-2 rounded-lg bg-secondary-color/50 border border-gray-400"
                    />
                </label>

                <label className="flex flex-col gap-1">
                    Número
                    <input
                        type="text"
                        value={numero}
                        onChange={e => setNumero(e.target.value)}
                        className="p-2 rounded-lg bg-secondary-color/50 border border-gray-400"
                    />
                </label>
            </div>

            {buscandoCep && <span className="text-sm text-gray-700">Buscando endereço...</span>}

            {endereco && (
                <div className="p-3 rounded-lg bg-secondary-color/50 border border-gray-400 font-light">
                    <p>{endereco.rua}, {numero.trim() || "s/n"}</p>
                    <p>{endereco.bairro} — {endereco.cidade}/{endereco.estado}</p>
                </div>
            )}

            <label className="flex flex-col gap-1 pt-2">
                Fotos (Escolha uma foto bonita para seu anúncio)
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={escolherFotos}
                    className="p-2 rounded-lg bg-secondary-color/50 border border-gray-400"
                />
            </label>

            {fotos.length > 0 && (
                <span className="text-sm text-gray-700">
                    {fotos.length} de {MAX_FOTOS} foto(s) selecionada(s)
                </span>
            )}

            <p className="msg-erro text-red-700">{infoErro}</p>

            <button
                type="submit"
                disabled={enviando || buscandoCep}
                className="p-3 rounded-lg bg-primary-color text-secondary-color hover:scale-105 duration-300 disabled:opacity-60 disabled:hover:scale-100"
            >
                {enviando ? "Cadastrando..." : "Cadastrar local"}
            </button>
        </form>
    )
}
