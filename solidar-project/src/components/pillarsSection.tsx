const pillars=[
    {
        titulo:"CONFIANCA",
        texto:"A base de tudo. As pessoas só doam quando confiam que a doação vai realmente chegar a quem precisa. Isso envolve transparência, verificação de quem recebe as doações e talvez até um jeito de acompanhar o destino da doação.",
        invertido:false
    },
    {
        titulo:"FACILIDADE",
        texto:"Acreditamos que ajudar não deveria ser complicado. Criamos uma experiência simples e rápida, para que você consiga doar em poucos passos, do jeito que for mais conveniente pra você  sem burocracia, sem complicação, sem perda de tempo.",
        invertido:true
    },
    {
        titulo:"TRANSPARÊNCIA",
        texto:"Você tem o direito de saber para onde vai a sua contribuição. Por isso, mostramos de forma clara como cada doação é utilizada e qual o impacto gerado, para que você acompanhe de perto a diferença que está fazendo.",
        invertido:false
    },
]

export default function PillarsSection(){
    return <section id="pillars-section" className="py-50 flex flex-wrap justify-between">
        <h2></h2>
        {pillars.map((pillar)=>(
            <div className={`p-10 bg-secondary relative flex flex-col justify-evenly w-[30vw] flex-1 h-[40vh] m-10 rounded-lg`}>
                <h2 className={`text-center font-bold text-7xl text-primary-color font-minhafonte absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>{pillar.titulo}</h2>
                <p className="font-light leading-relaxed">{pillar.texto}</p>
            </div>
        ))}
    </section>
}