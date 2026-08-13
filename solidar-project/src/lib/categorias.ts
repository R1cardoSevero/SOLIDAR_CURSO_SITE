// Cada categoria da tabela categoria tem um ícone do Google Material Icons
// (a fonte clássica que o index.html carrega e a classe .material-icons usa)
export interface Categoria {
    id_categoria: number
    nome: string
    icone: string
}

export const CATEGORIAS: Categoria[] = [
    { id_categoria: 1, nome: 'Roupas', icone: 'checkroom' },
    { id_categoria: 2, nome: 'Calçados', icone: 'directions_walk' },
    { id_categoria: 3, nome: 'Alimentos', icone: 'local_dining' },
    { id_categoria: 4, nome: 'Móveis', icone: 'chair' },
    { id_categoria: 5, nome: 'Eletrodomésticos', icone: 'kitchen' },
    { id_categoria: 6, nome: 'Brinquedos', icone: 'toys' },
    { id_categoria: 7, nome: 'Livros', icone: 'menu_book' },
    { id_categoria: 8, nome: 'Material Escolar', icone: 'school' },
    { id_categoria: 9, nome: 'Produtos de Higiene', icone: 'soap' },
    { id_categoria: 10, nome: 'Produtos de Limpeza', icone: 'cleaning_services' },
    { id_categoria: 11, nome: 'Cobertores e Roupas de Cama', icone: 'bed' },
    { id_categoria: 12, nome: 'Eletrônicos', icone: 'devices' },
    { id_categoria: 13, nome: 'Utensílios Domésticos', icone: 'restaurant' },
    { id_categoria: 14, nome: 'Medicamentos', icone: 'medication' },
    { id_categoria: 15, nome: 'Ração para Animais', icone: 'pets' },
    { id_categoria: 16, nome: 'Fraldas', icone: 'child_care' },
    { id_categoria: 17, nome: 'Acessórios (bolsas, cintos, etc)', icone: 'shopping_bag' },
    { id_categoria: 18, nome: 'Instrumentos Musicais', icone: 'music_note' },
    { id_categoria: 19, nome: 'Material de Construção', icone: 'construction' },
    { id_categoria: 20, nome: 'Outros', icone: 'category' }
]

export function categoriaPorId(id: number) {
    return CATEGORIAS.find((categoria) => categoria.id_categoria === id)
}

// Transforma a coluna id_categoria (lista de números) nas categorias completas
export function categoriasDoLocal(ids: number[] | null) {
    return (ids ?? [])
        .map(categoriaPorId)
        .filter((categoria): categoria is Categoria => categoria !== undefined)
}
