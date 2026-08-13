import { useCallback, useEffect, useState } from 'react'
import { MapPin, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../bd/supabase'
import FormNovoLocal from './formNovoLocal'

interface LocalDoacao {
    id_local: string
    nome: string
    descricao: string | null
    fotos: string[] | null
}

export default function PaginaUsuario() {
    const location = useLocation()
    const navigate = useNavigate()
    const id_usuario = location.state?.id ?? ""
    const [locais, setLocais] = useState<LocalDoacao[]>([])
    const [cadastrando, setCadastrando] = useState<boolean>(false)

    const buscarLocais = useCallback(async (id: string) => {
        const { data, error } = await supabase
            .from('local_doacao')
            .select('id_local, nome, descricao, fotos')
            .eq('id_usuario', id)

        if (error) {
            console.error('Erro ao buscar locais de doação:', error)
            return []
        }

        return data ?? []
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
            <button
                className="ml-auto p-3 py-2 rounded-lg bg-primary-color text-secondary-color hover:scale-105 duration-300"
                onClick={() => navigate('/home', { state: { id: id_usuario } })}
            >
                Voltar
            </button>
        </div>

        {locais.length > 0 && (
            <section id="locais-section" className="py-10">
                <h2 className="font-bold text-2xl pb-4">Seus Locais</h2>
                <div className="grid grid-cols-3 gap-4">
                    {locais.map((local) => (
                        <div
                            key={local.id_local}
                            className="p-5 rounded-lg bg-secondary-color/50 border border-gray-400"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-6 h-6 shrink-0" strokeWidth={1.5} />
                                <h3 className="font-bold">{local.nome}</h3>
                            </div>
                            {local.descricao && (
                                <p className="font-light pt-2">{local.descricao}</p>
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

        <section id="novo-local-section" className="py-10">
            <h2 className="font-bold text-2xl pb-4">Cadastrar novo local</h2>

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
        </section>
    </main>
}
