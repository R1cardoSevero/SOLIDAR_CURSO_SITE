export default function PaginaDoacao(){
    const numeroEstrelas = 3;

    return <section id="pagina-doacao" className="min-h-screen flex p-30">
        <section className="w-fit ">
            <img src="https://proex.ufpa.br/images/galeria_em_artigos/image04_grd.png" alt="local-doacao" className="rounded-lg w-100 h-100 aspect-square bg-gray-100"/>
            <div className="flex justify-evenly items-center py-4 bg-primary-color/20 my-3 rounded-lg">
                <div>
                    <h2 className="font-bold text-center text-3xl">45</h2>
                    <h3>Avaliações</h3>
                </div>
                {Array.from({ length: 5 }).map((_, index) => (
                <span
                    key={index}
                    className={`material-icons scale-200 ${index < numeroEstrelas?'text-yellow-600':'text-gray-400'}`}
                >
                    star
                </span>
            ))}
            </div>
            <h2 className="font-bold text-2xl">Aceitamos</h2>

        </section>
        <section className="w-[30vw] p-15">
            <h3 className="text-yellow-600">Porto Alegre - RS | 45km</h3>
            <h2 className="text-3xl font-bold">Dona Maria</h2>
            <h4 className="font-bold">Sobre o local</h4>
            <p className="text-justify">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos illum quas harum ipsam, reprehenderit optio sapiente itaque minus! Laboriosam voluptatum, quasi eos a tenetur sequi reprehenderit ipsam qui possimus totam. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi officia dolorem illo ratione consequatur beatae inventore corrupti optio explicabo. Ut molestiae voluptatem nostrum vitae sequi perferendis eveniet enim error. Vero!</p>
            <button className="bg-primary-color text-secondary-color py-3 px-10 my-10 rounded-lg">Quero Doar</button>
        </section>
    </section>
}