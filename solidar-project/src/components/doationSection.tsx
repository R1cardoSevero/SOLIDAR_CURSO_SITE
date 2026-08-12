import CardDoation from "./card";

const doadores = [
    {
        id:1,
        titulo: "Dona Maria",
        icones: ["2k"],
        url:"https://forbes.com.br/wp-content/uploads/2024/07/Life_casa-mais-cara-do-Brasil-900x600.jpg"
    }
];

export default function DoationSection() {
    return (
        <section id="doation-section" className="min-h-screen">
            <article>
                {doadores.map((doador) => (
                    <CardDoation
                        key={doador.id}
                        infoCard={doador}
                    />
                ))}
            </article>
        </section>
    );
}