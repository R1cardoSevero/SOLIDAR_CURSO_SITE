import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../bd/supabase'

interface FormAvaliacaoProps {
    id_local: string
    id_usuario: string
    onEnviada: () => void
}

export default function FormAvaliacao({ id_local, id_usuario, onEnviada }: FormAvaliacaoProps) {
    const [estrelas, setEstrelas] = useState<number>(0)
    const [texto, setTexto] = useState<string>("")
    const [enviando, setEnviando] = useState<boolean>(false)
    const [infoErro, setInfoErro] = useState<string>("")

    async function Avaliar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setInfoErro("")

        if (estrelas === 0) {
            setInfoErro("Escolha de 1 a 5 estrelas.")
            return
        }

        if (!texto.trim()) {
            setInfoErro("Escreva o que você achou do local.")
            return
        }

        setEnviando(true)

        const { error } = await supabase
            .from('avaliacao')
            .insert({ id_local, id_usuario, texto: texto.trim(), estrelas })

        setEnviando(false)

        if (error) {
            console.error('Erro ao enviar a avaliação:', error)
            setInfoErro("Não foi possível enviar sua avaliação. Tente novamente.")
            return
        }

        setEstrelas(0)
        setTexto("")
        onEnviada()
    }

    return (
        <form onSubmit={Avaliar} noValidate className="flex flex-col gap-2 py-4">
            <h4 className="font-bold">Avaliar este local</h4>

            <div className="flex">
                {Array.from({ length: 5 }).map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        title={`${index + 1} estrela(s)`}
                        onClick={() => { setEstrelas(index + 1); setInfoErro("") }}
                        className="cursor-pointer"
                    >
                        <span className={`material-icons ${index < estrelas ? 'text-yellow-600' : 'text-gray-400'}`}>
                            star
                        </span>
                    </button>
                ))}
            </div>

            <textarea
                rows={3}
                placeholder="Conte como foi sua experiência com esse local"
                value={texto}
                onChange={e => setTexto(e.target.value)}
                className="p-2 rounded-lg bg-secondary-color/50 border border-gray-400"
            />

            {infoErro && <p className="msg-erro text-red-700">{infoErro}</p>}

            <button
                type="submit"
                disabled={enviando}
                className="bg-primary-color text-secondary-color w-full py-3! px-6 rounded-lg disabled:opacity-60"
            >
                {enviando ? "Enviando..." : "Enviar avaliação"}
            </button>
        </form>
    )
}
