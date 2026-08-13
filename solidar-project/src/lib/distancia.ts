import { useEffect, useState } from 'react'

export interface Coordenadas {
    latitude: number
    longitude: number
}

const RAIO_DA_TERRA_KM = 6371

function grausParaRadianos(graus: number) {
    return graus * Math.PI / 180
}

// Fórmula de Haversine: distância em linha reta entre dois pontos do globo
export function distanciaEmKm(de: Coordenadas, para: Coordenadas) {
    const deltaLatitude = grausParaRadianos(para.latitude - de.latitude)
    const deltaLongitude = grausParaRadianos(para.longitude - de.longitude)

    const a = Math.sin(deltaLatitude / 2) ** 2
        + Math.cos(grausParaRadianos(de.latitude))
        * Math.cos(grausParaRadianos(para.latitude))
        * Math.sin(deltaLongitude / 2) ** 2

    return RAIO_DA_TERRA_KM * 2 * Math.asin(Math.sqrt(a))
}

// Abaixo de 1 km fica estranho mostrar "0 km", então vira metros
export function formatarDistancia(km: number) {
    if (km < 1) return `${Math.round(km * 1000)} m`
    return `${km.toFixed(1).replace('.', ',')} km`
}

// O endereço pode não ter coordenadas, e o usuário pode ter negado a localização:
// nesses casos não há distância para mostrar
export function distanciaAte(
    minhaPosicao: Coordenadas | null,
    local: { latitude: number | null, longitude: number | null } | null
) {
    if (!minhaPosicao || local?.latitude == null || local?.longitude == null) return null

    return formatarDistancia(distanciaEmKm(minhaPosicao, {
        latitude: local.latitude,
        longitude: local.longitude
    }))
}

// Pede a localização do navegador uma vez; se o usuário negar, fica null
export function usePosicaoUsuario() {
    const [posicao, setPosicao] = useState<Coordenadas | null>(null)

    useEffect(() => {
        if (!navigator.geolocation) return

        let ativo = true
        navigator.geolocation.getCurrentPosition(
            (resultado) => {
                if (!ativo) return
                setPosicao({
                    latitude: resultado.coords.latitude,
                    longitude: resultado.coords.longitude
                })
            },
            (erro) => {
                console.error('Erro ao obter a localização:', erro.message)
            }
        )

        return () => { ativo = false }
    }, [])

    return posicao
}
