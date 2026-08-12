const opcoes = [
    {
        nomeLink: 'Pilares',
        url: '#pillars-section'
    },
    {
        nomeLink: 'Quero Doar',
        url: '#doation-section'
    },
    {
        nomeLink: 'Contato',
        url: '#contact-section'
    }
]

export default function Header() {
    return <header className="fixed left-1/2 z-100 transform -translate-x-1/2">
        <nav className="flex justify-between  mt-2 [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg">
            {opcoes.map((opcao) => (
                <a className="p-5
                py-3
                relative
                text-gray-900
                bg-secondary-color/50
                overflow-hidden
                border border-gray-400 
                m-1
                hover:bg-primary-color
                hover:scale-105
                hover:text-secondary-color duration-300
                after:content-[''] after:absolute after:inset-0
                after:backdrop-blur-xs
                after:-z-10
              " href={opcao.url}>{opcao.nomeLink}</a>
            ))}
        </nav>
    </header>
}