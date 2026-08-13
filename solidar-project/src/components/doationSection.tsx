import { useState } from "react";
import CardDoation from "./cardDoation";
import SideBarFilters from "./sideBarFilters";

const doadores = [
    {
        id: 1,
        titulo: "Dona Maria",
        icones: ["book", "local_dining"],
        favorito: false,
        url: "https://forbes.com.br/wp-content/uploads/2024/07/Life_casa-mais-cara-do-Brasil-900x600.jpg",
        numeroEstrelas:3,
    },
    {
        id: 2,
        titulo: "Seu João",
        icones: ["book"],
        favorito: true,
        url: "https://forbes.com.br/wp-content/uploads/2024/07/Life_casa-mais-cara-do-Brasil-900x600.jpg",
        numeroEstrelas:3,
    },
    {
        id: 3,
        titulo: "Dona Maria",
        icones: ["local_dining"],
        favorito: false,
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        numeroEstrelas:3,
    },
    {
        id: 4,
        titulo: "Dona Maria",
        icones: ["book", "local_dining"],
        favorito: true,
        url: "https://forbes.com.br/wp-content/uploads/2024/07/Life_casa-mais-cara-do-Brasil-900x600.jpg",
        numeroEstrelas:3,
    },
    {
        id: 5,
        titulo: "Dona Maria",
        icones: ["book", "local_dining"],
        favorito: false,
        url: "https://forbes.com.br/wp-content/uploads/2024/07/Life_casa-mais-cara-do-Brasil-900x600.jpg",
        numeroEstrelas:3,
    },
    {
        id: 6,
        titulo: "Dona Maria",
        icones: ["book", "local_dining"],
        favorito: false,
        url: "https://forbes.com.br/wp-content/uploads/2024/07/Life_casa-mais-cara-do-Brasil-900x600.jpg",
        numeroEstrelas:1,
    }
];

// "key" liga cada filtro ao campo correspondente no objeto doador/ícone
const filtros = [
    {
        id: 1,
        titulo: "Nome:",
        placeholder: "nome do lugar...",
        type: "text",
        key: "nome"
    },
    {
        id: 2,
        titulo: "Favoritos",
        type: "checkbox",
        key: "favoritos"
    },
    {
        id: 3,
        titulo: "Alimentos",
        type: "checkbox",
        key: "local_dining"
    },
    {
        id: 4,
        titulo: "Roupas",
        type: "checkbox",
        key: "checkroom"
    },
];

interface FiltrosSelecionados {
    nome: string;
    favoritos: boolean;
    [icone: string]: string | boolean; // permite chaves dinâmicas dos checkboxes de ícone
}

export default function DoationSection() {
    const [filtrosSelecionados, setFiltrosSelecionados] = useState<FiltrosSelecionados>({
        nome: "",
        favoritos: false,
    });

    function escolhendoFiltro(key: string, valor: string | boolean) {
        setFiltrosSelecionados((prev) => ({
            ...prev,
            [key]: valor,
        }));
    }

    const doadoresFiltrados = doadores.filter((doador) => {
        if (
            filtrosSelecionados.nome &&
            !doador.titulo.toLowerCase().includes(String(filtrosSelecionados.nome).toLowerCase())
        ) {
            return false;
        }

        if (filtrosSelecionados.favoritos && !doador.favorito) {
            return false;
        }

        const filtrosDeIcone = Object.entries(filtrosSelecionados).filter(
            ([key, valor]) => key !== "nome" && key !== "favoritos" && valor === true
        );

        for (const [icone] of filtrosDeIcone) {
            if (!doador.icones.includes(icone)) return false;
        }

        return true;
    });

    return (
        <section id="doation-section" className="min-h-screen py-30 flex">
            <SideBarFilters filtros={filtros} onEscolhendoFiltro={escolhendoFiltro} />
            <article className="grid grid-cols-3 gap-2 items-start auto-rows-60">
                {doadoresFiltrados.map((doador) => (
                    <CardDoation key={doador.id} infoCard={doador} />
                ))}
            </article>
        </section>
    );
}