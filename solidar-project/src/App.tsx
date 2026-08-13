import { Routes, Route } from "react-router-dom";
import PaginaDoacao from './components/paginaDoacao'
import LoginPage from './components/loginPage'
import HomePage from './components/homePage'
import PaginaUsuario from './components/paginaUsuario'


export default function App() {
  return (
    <>
      <Routes>
        {/* Rota da tela de login*/}
        <Route
          path="/"
          element={
            <>
              <LoginPage />
            </>
          }
        />

        {/* Rota da Home, com todo o conteúdo da página inicial */}
        <Route
          path="/home"
          element={
            <>
              <HomePage />
            </>
          }
        />

        {/* Rota da página de doação */}
        <Route path="/home/pagina-doacao" element={<PaginaDoacao />} />

        {/* Rota da página do usuário, com os locais de doação dele */}
        <Route path="/pagina-usuario" element={<PaginaUsuario />} />
      </Routes>
    </>
  );
}