-- A distância até o usuário é calculada no navegador, então cada endereço
-- precisa guardar suas coordenadas. Elas são preenchidas no cadastro do local,
-- a partir do CEP (BrasilAPI).
-- Rode isso no SQL Editor do Supabase.

alter table endereco
    add column if not exists latitude double precision,
    add column if not exists longitude double precision;

-- Endereços cadastrados antes disso ficam sem coordenadas e simplesmente não
-- mostram a distância. Para preencher um deles na mão:
-- update endereco set latitude = -30.0331, longitude = -51.2300 where id_endereco = '...';
