import DoationSection from './components/doationSection'
import Footer from './components/footer'
import Header from './components/header'
import HomeSection from './components/homeSection'
import Parallax from './components/parallax'
import PillarsSection from './components/pillarsSection'
import { Routes, Route, Link } from "react-router-dom";
import PaginaDoacao from './components/paginaDoacao'


export default function App() {
  return (
    <>
      <Routes>
        {/* Rota da Home, com todo o conteúdo da página inicial */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <HomeSection />
              <Parallax tituloParallax={"PILARES"} />
              <PillarsSection />
              <Parallax tituloParallax={"DOACAO"} />
              <DoationSection />
              <Footer />
            </>
          }
        />

        {/* Rota da página de doação */}
        <Route path="/pagina-doacao" element={<PaginaDoacao />} />
      </Routes>
    </>
  );
}