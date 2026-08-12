import DoationSection from './components/doationSection'
import Footer from './components/footer'
import Header from './components/header'
import HomeSection from './components/homeSection'
import Parallax from './components/parallax'
import PillarsSection from './components/pillarsSection'

export default function App(){
  return <>
    <Header/>
    <HomeSection/>
    <Parallax tituloParallax={'PILARES'}/>
    <PillarsSection/>
    <Parallax tituloParallax={'DOACAO'}/>
    <DoationSection/>
    <Footer/>
  </>
}