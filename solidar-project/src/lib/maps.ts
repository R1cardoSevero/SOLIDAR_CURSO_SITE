interface EnderecoMaps {
    rua: string
    numero: string | null
    bairro: string | null
    cidade: string | null
    estado: string | null
    cep: string | null
    latitude: number | null
    longitude: number | null
}

// Monta o endereço em uma linha, do jeito que o Maps entende
function enderecoEmTexto(endereco: EnderecoMaps) {
    return [
        [endereco.rua, endereco.numero].filter(Boolean).join(', '),
        endereco.bairro,
        [endereco.cidade, endereco.estado].filter(Boolean).join(' - '),
        endereco.cep
    ].filter(Boolean).join(', ')
}

// Abre a rota até o local. O texto vem antes das coordenadas porque tem o
// número da casa: as coordenadas do CEP apontam só para a região da rua.
export function linkDoMapa(endereco: EnderecoMaps) {
    const texto = enderecoEmTexto(endereco)

    const destino = texto || (
        endereco.latitude != null && endereco.longitude != null
            ? `${endereco.latitude},${endereco.longitude}`
            : ""
    )

    if (!destino) return null

    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`
}
