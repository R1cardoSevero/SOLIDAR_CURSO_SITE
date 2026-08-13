import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { supabase } from '../bd/supabase'
import { useNavigate } from 'react-router-dom'

interface Usuario {
    id_usuario: string
    user_email: string
}

const opcoes = [
    {
        nomeLink: 'Pilares',
        url: '#pillars-section'
    },
    {
        nomeLink: 'Quero Doar',
        url: '#doation-section'
    },
    {
        nomeLink: 'Contato',
        url: '#contact-section'
    }
]

export default function Header({ id_usuario }: { id_usuario: string }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const navigate = useNavigate()

    async function buscarUsuario(id: string) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id_usuario, user_email')
            .eq('id_usuario', id)
            .single<Usuario>() // .single() retorna um objeto direto, não um array

        if (error) {
            console.error('Erro ao buscar usuário:', error)
            return null
        }
        return data
    }

    useEffect(() => {
        if (!id_usuario) return

        let ativo = true
        buscarUsuario(id_usuario).then((dados) => {
            if (ativo) setUsuario(dados)
        })

        return () => { ativo = false }
    }, [id_usuario])

    return <header className="fixed top-0 left-0 w-full z-100">
        <div className="absolute left-2 top-3 flex items-center gap-3
            p-2
            px-3
            rounded-lg
            text-gray-900
            backdrop-blur-xs">
            <button
                title="Meu perfil"
                disabled={!usuario}
                onClick={() => navigate('/pagina-usuario', { state: { id: id_usuario } })}
                className="cursor-pointer hover:scale-105 duration-300 disabled:cursor-default disabled:hover:scale-100"
            >
                <User className="w-10 h-10 shrink-0 rounded-full bg-secondary-color p-2" strokeWidth={1.5} />
            </button>
            <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">
                    {usuario?.user_email ??<button onClick={()=>(navigate('/'))}>Fazer Login</button>}
                </span>
            </div>
        </div>

        <nav className="flex justify-between mt-2 w-fit mx-auto [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg">
            {opcoes.map((opcao) => (
                <a className="p-5
                py-3
                relative
                text-gray-900
                bg-secondary-color/50
                overflow-hidden
                border border-gray-400 
                m-1
                hover:bg-primary-color
                hover:scale-105
                hover:text-secondary-color duration-300
                after:content-[''] after:absolute after:inset-0
                after:backdrop-blur-xs
                after:-z-10
              " key={opcao.url} href={opcao.url}>{opcao.nomeLink}</a>
            ))}
        </nav>
    </header>
}