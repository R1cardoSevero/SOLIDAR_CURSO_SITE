interface CardDoationProps {
    infoCard: {
        titulo: string;
        icones: string[];
        url: string;
    }
}

export default function CardDoation({ infoCard }: CardDoationProps) {
    return (
        <div className=" relative max-w-xs h-fit m-10 rounded-2xl ">
            <img src={infoCard.url} alt="" />
            <div className="p-2 absolute bg-background-card h-1/2 bottom-0 w-full flex flex-col">
                <h2 className="text-[#f1f1f1] text-2xl">{infoCard.titulo}</h2>
                <h5>Aceitamos</h5>
                {infoCard.icones.map((nomeIcone) => (
                    <span key={nomeIcone} className="material-icons">
                        {nomeIcone}
                    </span>
                ))}
                <button className="bg-white text-black rounded-xl py-2">Conhecer o local</button>
            </div>
        </div>
    );
}