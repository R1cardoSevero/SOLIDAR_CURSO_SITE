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


-- ATENÇÃO aos endereços cadastrados até aqui: as coordenadas vinham da BrasilAPI
-- pelo CEP, e quando quem respondia era o serviço "open-cep" ela devolvia o
-- centro do município. Ou seja, todos os locais de uma mesma cidade ficaram com
-- o mesmo ponto, e a distância mostrada no card era até o centro da cidade.
-- O cadastro agora geocodifica o endereço completo (Nominatim), mas o que já
-- está salvo continua errado.
--
-- Para conferir quantos endereços repetem a mesma coordenada:
-- select latitude, longitude, count(*)
--     from endereco
--     where latitude is not null
--     group by latitude, longitude
--     having count(*) > 1;
--
-- Para limpar as coordenadas antigas e deixar que os locais apareçam sem
-- distância em vez de com uma distância errada (isso apaga dados, confira o
-- resultado da consulta acima antes de rodar):
-- update endereco set latitude = null, longitude = null;
