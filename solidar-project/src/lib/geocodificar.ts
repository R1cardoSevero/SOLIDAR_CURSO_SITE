export interface Coordenadas {
    latitude: number | null
    longitude: number | null
}

export interface EnderecoCompleto {
    rua: string
    numero: string
    cidade: string
    estado: string
    cep: string
}

const SEM_COORDENADAS: Coordenadas = { latitude: null, longitude: null }

const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/search'

// Resposta do Nominatim: lat e lon vêm como texto
interface RespostaNominatim {
    lat?: string
    lon?: string
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

function paraCoordenadas(latitude?: string, longitude?: string): Coordenadas {
    const lat = Number(latitude)
    const lon = Number(longitude)

    if (!latitude || !longitude || Number.isNaN(lat) || Number.isNaN(lon)) {
        return SEM_COORDENADAS
    }

    return { latitude: lat, longitude: lon }
}

function esperar(milissegundos: number) {
    return new Promise((resolve) => setTimeout(resolve, milissegundos))
}

// A BrasilAPI só sabe o CEP, e quando quem responde é o serviço "open-cep" ela
// devolve o centro do município: dois CEPs distantes na mesma cidade voltam com
// o mesmo ponto. Serve como último recurso, não como resposta boa.
export async function coordenadasDoCep(cep: string): Promise<Coordenadas> {
    try {
        const resposta = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`)

        if (!resposta.ok) return SEM_COORDENADAS

        const dados: RespostaBrasilApi = await resposta.json()

        return paraCoordenadas(
            dados.location?.coordinates?.latitude,
            dados.location?.coordinates?.longitude
        )
    } catch (erro) {
        console.error('Erro ao buscar as coordenadas do CEP:', erro)
        return SEM_COORDENADAS
    }
}

// O Nominatim (OpenStreetMap) é aberto e não pede chave, mas a política de uso
// permite no máximo uma consulta por segundo. Como só chamamos no cadastro de um
// local, isso sobra. O User-Agent não pode ser definido pelo navegador, então
// quem identifica a aplicação é o Referer que ele já envia sozinho.
async function buscarNoNominatim(rua: string, cidade: string, estado: string): Promise<Coordenadas> {
    // O CEP fica de fora de propósito: quando ele diverge do que está no
    // OpenStreetMap, a busca não devolve nada em vez de devolver o endereço
    const parametros = new URLSearchParams({
        street: rua,
        city: cidade,
        state: estado,
        country: 'Brasil',
        format: 'json',
        limit: '1'
    })

    try {
        const resposta = await fetch(`${URL_NOMINATIM}?${parametros}`)

        if (!resposta.ok) return SEM_COORDENADAS

        const dados: RespostaNominatim[] = await resposta.json()

        if (dados.length === 0) return SEM_COORDENADAS

        return paraCoordenadas(dados[0].lat, dados[0].lon)
    } catch (erro) {
        console.error('Erro ao geocodificar o endereço:', erro)
        return SEM_COORDENADAS
    }
}

// Tenta do mais preciso para o menos preciso: o número da casa, depois só a rua
// e, se nada for encontrado, o centro da cidade pelo CEP. Nunca falha: um local
// sem coordenada só deixa de mostrar a distância.
export async function coordenadasDoEndereco(endereco: EnderecoCompleto): Promise<Coordenadas> {
    const { rua, numero, cidade, estado, cep } = endereco

    if (rua && cidade) {
        // O Nominatim espera o número antes do nome da rua
        const comNumero = numero ? `${numero} ${rua}` : rua
        const coordenadas = await buscarNoNominatim(comNumero, cidade, estado)

        if (coordenadas.latitude !== null) return coordenadas

        // Sem o número ainda cai na rua certa, que é bem melhor que o centro da
        // cidade. A espera é para respeitar o limite de uma consulta por segundo.
        if (numero) {
            await esperar(1100)
            const semNumero = await buscarNoNominatim(rua, cidade, estado)

            if (semNumero.latitude !== null) return semNumero
        }
    }

    return coordenadasDoCep(cep)
}
