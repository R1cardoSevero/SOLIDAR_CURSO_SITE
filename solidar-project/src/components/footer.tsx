const footerLinks=[
    {
        id:1,
        titulo:'Contatos',
        links:[
            {
                id:1,
                titulo:'Whatssap',
                url:'https://www.whatsapp.com/',
            },
            {
                id:2,
                titulo:'Facebook',
                url:'https://www.facebook.com/',
            },
            {
                id:3,
                titulo:'Instagram',
                url:'https://www.instagram.com/',
            }
        ]
    },
    {
        id:1,
        titulo:'Links Rápidos',
        links:[
            {
                id:1,
                titulo:'Quero Doar',
                url:'#doation-section',
            },
            {
                id:2,
                titulo:'Pilares',
                url:'#pillars-section',
            },
            {
                id:3,
                titulo:'Topo',
                url:'#home-section',
            }
        ]
    }
]

export default function Footer(){
    return <footer id="contact-section" className="bg-primary-color flex m-1 relative">
        {footerLinks.map((secaoLink)=>(
            <div className="p-10 text-secondary-color">
                <h3 className="py-4 font-bold">{secaoLink.titulo}</h3>
                <ul>
                    {secaoLink.links.map((link)=>(
                        <li className="pb-2 font-light"><a href={link.url}>{link.titulo}</a></li>
                    ))}
                </ul>
            </div>
        ))}
        <h5 className="text-gray-300 absolute bottom-0 p-2 left-1/2 -translate-x-1/2">Desenvolvido por Ricardo Müller Severo</h5>
    </footer>
}