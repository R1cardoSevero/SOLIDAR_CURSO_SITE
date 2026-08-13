import { useLocation } from "react-router-dom";
import DoationSection from "./doationSection";
import Footer from "./footer";
import Header from "./header";
import HomeSection from "./homeSection";
import Parallax from "./parallax";
import PillarsSection from "./pillarsSection";

export default function HomePage() {
    const location = useLocation()
    const id = location.state?.id ?? ""

    return <>
        <Header id_usuario={id} />
        <HomeSection />
        <Parallax tituloParallax={"PILARES"} />
        <PillarsSection />
        <Parallax tituloParallax={"DOACAO"} />
        <DoationSection id_usuario={id} />
        <Footer />
    </>
}