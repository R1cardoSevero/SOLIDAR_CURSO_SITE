import CardStars from './cardStars'

interface CardDoationProps {
    infoCard: {
        titulo: string;
        icones: string[];
        url: string;
        numeroEstrelas:number;
    }
}

export default function CardDoation({ infoCard }: CardDoationProps) {
    return (
        <div className=" relative max-w-xs m-10 rounded-2xl">
            <CardStars numeroEstrelas={infoCard.numeroEstrelas}/>
            <span className="material-icons absolute right-0 top-0 p-3 m-2 rounded-lg bg-[#f1f1f1] text-gray-400">
                favorite
            </span>
            <img src={infoCard.url} alt="foto da casa de doacao" className="rounded-2xl h-55 w-full" />
            <div className="p-2 absolute h-fit bg-primary-color bottom-0 w-full flex flex-col rounded-b-2xl">
                <h2 className="text-[#f1f1f1] text-2xl">{infoCard.titulo}</h2>
                <h5 className="text-[#f1f1f1]">Aceitamos</h5>
                <div className="flex">
                    {infoCard.icones.map((nomeIcone) => (
                        <span key={nomeIcone} className="material-icons mb-1 text-gray-300">
                            {nomeIcone}
                        </span>
                    ))}
                </div>
                <button className="bg-white  rounded-xl py-2 text-primary-color">Conhecer o local</button>
            </div>
        </div>
    );
}