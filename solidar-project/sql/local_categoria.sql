-- Um local pode ter várias categorias, então id_categoria deixa de guardar
-- um número só e passa a guardar uma lista deles.
-- Rode isso no SQL Editor do Supabase antes de usar o formulário de novo local.

alter table local_doacao
    alter column id_categoria type integer[]
    using case
        when id_categoria is null then null
        else array[id_categoria]
    end;

-- Os nomes das categorias continuam saindo da tabela categoria: cada número
-- guardado aqui é um categoria.id_categoria.
