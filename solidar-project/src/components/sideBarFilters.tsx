interface Filtro {
    id: number;
    titulo?: string;
    placeholder?: string;
    type: string;
    key: string;
}

interface SideBarFiltersProps {
    filtros: Filtro[];
    onEscolhendoFiltro: (key: string, valor: string | boolean) => void;
}

export default function SideBarFilters({ filtros, onEscolhendoFiltro }: SideBarFiltersProps) {
    return (
        <div className="bg-secondary h-fit w-80 m-4 rounded-3xl p-5">
            <h3 className="font-bold text-center text-lg">Filtros</h3>
            {filtros.map((filtro) => (
                <div key={filtro.id}>
                    {filtro.type !== "checkbox" ? (
                        <div className="flex flex-col py-2">
                            <label>
                                <h3 className="font-semibold py-1 text-primary-color">{filtro.titulo}</h3>
                                <input
                                    type={filtro.type}
                                    placeholder={filtro.placeholder}
                                    className="bg-[#f1f1f1] rounded-lg py-1 px-3 w-full"
                                    onChange={(e) => onEscolhendoFiltro(filtro.key, e.target.value)}
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="py-2 justify-end">
                            <label className="flex flex-row-reverse justify-end bg-[#f1f1f1] p-1 rounded-lg">
                                <h3 className="font-semibold text-primary-color">{filtro.titulo}</h3>
                                <input
                                    type={filtro.type}
                                    className="bg-secondary rounded-lg p-1 block w-5 mx-4"
                                    onChange={(e) => onEscolhendoFiltro(filtro.key, e.target.checked)}
                                />
                            </label>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}