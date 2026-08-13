import { useEffect, useState } from "react";
import CardDoation from "./cardDoation";
import SideBarFilters from "./sideBarFilters";
import { supabase } from "../bd/supabase";
import { CATEGORIAS, categoriasDoLocal } from "../lib/categorias";
import type { Categoria } from "../lib/categorias";
import { mediaDeEstrelas } from "../lib/avaliacoes";
import { distanciaAte, usePosicaoUsuario } from "../lib/distancia";

interface LocalDb {
    id_local: string;
    nome: string;
    fotos: string[] | null;
    id_categoria: number[] | null;
    id_endereco: string | null;
}

interface EnderecoDb {
    id_endereco: string;
    latitude: number | null;
    longitude: number | null;
}

interface AvaliacaoDb {
    id_local: string | null;
    estrelas: number;
}

interface Doador {
    id_local: string;
    titulo: string;
    categorias: Categoria[];
    favorito: boolean;
    url: string;
    numeroEstrelas: number;
    coordenadas: { latitude: number | null, longitude: number | null } | null;
}

// Prefixo que marca os checkboxes de categoria: a key fica "categoria-3"
const PREFIXO_CATEGORIA = "categoria-";

// "key" liga cada filtro ao campo correspondente no objeto doador
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
    // Um filtro para cada tipo de doação, direto da lista de categorias
    ...CATEGORIAS.map((categoria) => ({
        id: 100 + categoria.id_categoria,
        titulo: categoria.nome,
        type: "checkbox",
        key: `${PREFIXO_CATEGORIA}${categoria.id_categoria}`,
        icone: categoria.icone
    }))
];

interface FiltrosSelecionados {
    nome: string;
    favoritos: boolean;
    [categoria: string]: string | boolean; // permite as chaves dinâmicas "categoria-N"
}

// Pega só as estrelas das avaliações daquele local
function estrelasDoLocal(avaliacoes: AvaliacaoDb[], id_local: string) {
    return avaliacoes
        .filter((avaliacao) => avaliacao.id_local === id_local)
        .map((avaliacao) => avaliacao.estrelas);
}

async function buscarDoadores(): Promise<Doador[]> {
    const [resultadoLocais, resultadoAvaliacoes, resultadoEnderecos] = await Promise.all([
        supabase.from('local_doacao').select('id_local, nome, fotos, id_categoria, id_endereco'),
        supabase.from('avaliacao').select('id_local, estrelas'),
        supabase.from('endereco').select('id_endereco, latitude, longitude')
    ]);

    if (resultadoLocais.error) {
        console.error('Erro ao buscar locais de doação:', resultadoLocais.error);
        return [];
    }

    if (resultadoAvaliacoes.error) {
        console.error('Erro ao buscar avaliações:', resultadoAvaliacoes.error);
    }

    if (resultadoEnderecos.error) {
        console.error('Erro ao buscar endereços:', resultadoEnderecos.error);
    }

    const locais: LocalDb[] = resultadoLocais.data ?? [];
    const avaliacoes: AvaliacaoDb[] = resultadoAvaliacoes.data ?? [];
    const enderecos: EnderecoDb[] = resultadoEnderecos.data ?? [];

    return locais.map((local) => {
        const categorias = categoriasDoLocal(local.id_categoria);
        const endereco = enderecos.find((item) => item.id_endereco === local.id_endereco);

        return {
            id_local: local.id_local,
            titulo: local.nome,
            categorias,
            favorito: false,
            url: local.fotos?.[0] ?? "",
            numeroEstrelas: mediaDeEstrelas(estrelasDoLocal(avaliacoes, local.id_local)),
            coordenadas: endereco ?? null
        };
    });
}

export default function DoationSection({ id_usuario }: { id_usuario: string }) {
    const minhaPosicao = usePosicaoUsuario();
    const [doadores, setDoadores] = useState<Doador[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [filtrosSelecionados, setFiltrosSelecionados] = useState<FiltrosSelecionados>({
        nome: "",
        favoritos: false,
    });

    useEffect(() => {
        let ativo = true;
        buscarDoadores().then((dados) => {
            if (!ativo) return;
            setDoadores(dados);
            setCarregando(false);
        });

        return () => { ativo = false };
    }, []);

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

        // Cada categoria marcada precisa estar no local (quem aceita as duas
        // coisas que eu quero doar, não uma ou outra)
        const categoriasMarcadas = Object.entries(filtrosSelecionados)
            .filter(([key, valor]) => key.startsWith(PREFIXO_CATEGORIA) && valor === true)
            .map(([key]) => Number(key.replace(PREFIXO_CATEGORIA, "")));

        for (const id_categoria of categoriasMarcadas) {
            const aceita = doador.categorias.some((categoria) => categoria.id_categoria === id_categoria);
            if (!aceita) return false;
        }

        return true;
    });

    return (
        <section id="doation-section" className="min-h-screen py-30 flex">
            <SideBarFilters filtros={filtros} onEscolhendoFiltro={escolhendoFiltro} />
            <article className="grid grid-cols-3 gap-2 items-start auto-rows-60">
                {doadoresFiltrados.map((doador) => (
                    <CardDoation
                        key={doador.id_local}
                        infoCard={doador}
                        id_usuario={id_usuario}
                        distancia={distanciaAte(minhaPosicao, doador.coordenadas)}
                    />
                ))}
            </article>

            {!carregando && doadoresFiltrados.length === 0 && (
                <p className="m-10 font-light">Nenhum local de doação encontrado.</p>
            )}
        </section>
    );
}
