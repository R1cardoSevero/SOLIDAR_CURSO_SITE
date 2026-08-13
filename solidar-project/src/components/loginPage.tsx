import { useState } from "react"
import type { FormEvent } from "react"
import '../styles/PaginaLogin.css'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../bd/supabase' // ajuste o caminho conforme a localização do seu client

type Modo = "modo-login" | "modo-cadastro"

interface UsuarioDb {
  id_usuario: string
  user_password: string
}

// Valida apenas a estrutura do e-mail (algo@dominio.ext), não a existência dele
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

function emailValido(valor: string): boolean {
  return REGEX_EMAIL.test(valor.trim())
}

export default function PaginaLogin() {
  const navigate = useNavigate()
  const [modo, setModo] = useState<Modo>("modo-login")
  const [email, setEmail] = useState<string>("")
  const [senha, setSenha] = useState<string>("")
  const [emailConfirmacao, setEmailConfirmacao] = useState<string>("")
  const [idUsuario, setIdUsuario] = useState<string>("")
  const [infoErro, setInfoErro] = useState<string>("")
  const [logado, setLogado] = useState<boolean>(false)

  async function Logar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInfoErro("")
    if (email && senha) {
      await buscarUsuario(email, senha)
    } else {
      setInfoErro("Preencha e-mail e senha para continuar.")
    }
  }

  async function buscarUsuario(email: string, senha: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, user_password')
      .eq('user_email', email.trim())
      .single<UsuarioDb>()

    setInfoErro("")

    if (error) {
      if (error.code === 'PGRST116') {
        setInfoErro("Nenhuma conta encontrada com esse e-mail.")
      }
      return
    }

    if (!data) {
      setInfoErro("Nenhuma conta encontrada com esse e-mail.")
      return
    }

    if (senha === data.user_password) {
      setIdUsuario(data.id_usuario)
      navigate('/home', { state: { id: data.id_usuario } })  // ← substitui o setLogado(true)
    } else {
      setInfoErro("Senha incorreta. Tente novamente.")
    }
  }

  async function inserir() {
    const { error } = await supabase
      .from('usuarios')
      .insert({ user_email: email.trim(), user_password: senha })

    if (error) {
      if (error.code === '23505') {
        setInfoErro("Esse e-mail já está cadastrado.")
      } else {
        setInfoErro("Erro ao cadastrar. Tente novamente.")
      }
    } else {
      alert("Cadastrado com sucesso")
      setModo("modo-login")
    }
  }

  async function Cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInfoErro("")

    if (!email || !senha || !emailConfirmacao) {
      setInfoErro("Preencha todos os campos para continuar.")
      return
    }

    if (!emailValido(email)) {
      setInfoErro("Informe um e-mail válido (exemplo: nome@dominio.com).")
      return
    }

    if (!emailValido(emailConfirmacao)) {
      setInfoErro("A confirmação precisa ser um e-mail válido (exemplo: nome@dominio.com).")
      return
    }

    if (email.trim().toLowerCase() !== emailConfirmacao.trim().toLowerCase()) {
      setInfoErro("Os e-mails informados não coincidem.")
      return
    }

    await inserir()
  }

  return (
    <section id="pagina-login">
    <div className="login-wrapper">
      <div className="login-card flex flex-col justify-center items-center py-10! m-30!">

        <div className="login-logo">
          <span className="font-minhafonte text-6xl">SOLIDAR</span>
        </div>

        {modo === "modo-login" ? (
          <form onSubmit={Logar} noValidate>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
            />

            <p className="msg-erro">{infoErro}</p>

            <button type="submit" className="bg-primary-color text-secondary-color rounded-lg h-12">
              Entrar
            </button>

            <div className="links-rodape">
              <a
                className="text-primary-color!"
                onClick={() => { setModo("modo-cadastro"); setSenha("") }}
              >
                Não tenho conta
              </a>
            </div>
          </form>

        ) : (
          <form onSubmit={Cadastrar} noValidate>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label htmlFor="email-confirmacao">Confirmar e-mail</label>
            <input
              type="email"
              id="email-confirmacao"
              name="email-confirmacao"
              placeholder="confirme seu@email.com"
              value={emailConfirmacao}
              onChange={e => setEmailConfirmacao(e.target.value)}
              autoComplete="email"
            />

            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              placeholder="crie uma senha forte"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="new-password"
            />

            <p className="msg-erro">{infoErro}</p>

            <button type="submit" className="bg-primary-color text-secondary-color h-13 rounded-lg">
              Criar conta
            </button>

            <div className="links-rodape">
              <a
                className="text-primary-color!"
                onClick={() => { setModo("modo-login"); setSenha("") }}
              >
                Já tenho conta
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
    </section>
  )
}