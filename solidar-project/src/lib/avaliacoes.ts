// A nota mostrada nas estrelas é a média das avaliações, arredondada
export function mediaDeEstrelas(estrelas: number[]) {
    if (estrelas.length === 0) return 0

    const soma = estrelas.reduce((total, nota) => total + nota, 0)
    return Math.round(soma / estrelas.length)
}
