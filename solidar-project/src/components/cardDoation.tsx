import CardStars from './cardStars'
import { useNavigate } from "react-router-dom";
import type { Categoria } from '../lib/categorias';

interface CardDoationProps {
    infoCard: {
        id_local: string;
        titulo: string;
        categorias: Categoria[];
        url: string;
        numeroEstrelas: number;
    }
    id_usuario: string;
    distancia: string | null;
}

const MAX_ICONES = 3

export default function CardDoation({ infoCard, id_usuario, distancia }: CardDoationProps) {
    const navigate = useNavigate();
    const categoriasVisiveis = infoCard.categorias.slice(0, MAX_ICONES)
    const restantes = infoCard.categorias.length - categoriasVisiveis.length

    return (
        <div className=" relative max-w-xs m-10 rounded-2xl">
            <CardStars numeroEstrelas={infoCard.numeroEstrelas} />
            <span className="material-icons absolute right-0 top-0 p-3 m-2 rounded-lg bg-[#f1f1f1] text-gray-400">
                favorite
            </span>
            {infoCard.url ? (
                <img src={infoCard.url} alt="foto da casa de doacao" className="rounded-2xl h-65 w-250 object-cover" />
            ) : (
                <div className="rounded-2xl h-55 w-full bg-gray-300" />
            )}
            <div className="p-2 absolute h-fit bg-primary-color bottom-0 w-full flex flex-col rounded-b-2xl">
                <h2 className="text-[#f1f1f1] text-2xl font-bold">{infoCard.titulo}</h2>
                <h5 className="text-gray-300/80">Aceitamos</h5>
                <div className="flex items-center justify-between  ">
                    <div className='flex items-center gap-1'>
                        {categoriasVisiveis.map((categoria) => (
                            <span
                                key={categoria.id_categoria}
                                title={categoria.nome}
                                className="material-icons mb-1 text-gray-300  py-2"
                            >
                                {categoria.icone}
                            </span>
                        ))}
                        {restantes > 0 && (
                            <span className="mb-1 text-sm text-gray-300">+{restantes}</span>
                        )}
                    </div>
                    {distancia && <h3 className='text-secondary-color'>{distancia}</h3>}
                </div>
                <button onClick={() => navigate("/home/pagina-doacao", { state: { id_local: infoCard.id_local, id_usuario } })} className="bg-white  rounded-xl py-2 text-primary-color">Conhecer o local</button>
            </div>
        </div>
    );
}
