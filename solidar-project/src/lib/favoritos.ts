import { useCallback, useEffect, useState } from 'react'

// Os favoritos ficam só no navegador, separados por usuário: duas pessoas que
// usam o mesmo computador não misturam as listas
const PREFIXO_CHAVE = 'solidar:favoritos'

function chaveDoUsuario(id_usuario: string) {
    return id_usuario ? `${PREFIXO_CHAVE}:${id_usuario}` : PREFIXO_CHAVE
}

// O localStorage pode estar bloqueado (aba privada) ou com conteúdo estragado
// de uma versão antiga: nesses casos a lista volta vazia em vez de quebrar
export function lerFavoritos(id_usuario: string): string[] {
    try {
        const salvo = localStorage.getItem(chaveDoUsuario(id_usuario))
        if (!salvo) return []

        const ids: unknown = JSON.parse(salvo)
        if (!Array.isArray(ids)) return []

        return ids.filter((id): id is string => typeof id === 'string')
    } catch (erro) {
        console.error('Erro ao ler os favoritos:', erro)
        return []
    }
}

export function salvarFavoritos(id_usuario: string, ids: string[]) {
    try {
        localStorage.setItem(chaveDoUsuario(id_usuario), JSON.stringify(ids))
    } catch (erro) {
        console.error('Erro ao salvar os favoritos:', erro)
    }
}

export function useFavoritos(id_usuario: string) {
    const [favoritos, setFavoritos] = useState<string[]>([])

    // Recarrega quando troca de usuário (o login acontece sem recarregar a página)
    useEffect(() => {
        setFavoritos(lerFavoritos(id_usuario))
    }, [id_usuario])

    const ehFavorito = useCallback(
        (id_local: string) => favoritos.includes(id_local),
        [favoritos]
    )

    const alternarFavorito = useCallback((id_local: string) => {
        setFavoritos((atuais) => {
            const novos = atuais.includes(id_local)
                ? atuais.filter((id) => id !== id_local)
                : [...atuais, id_local]

            salvarFavoritos(id_usuario, novos)
            return novos
        })
    }, [id_usuario])

    return { favoritos, ehFavorito, alternarFavorito }
}
