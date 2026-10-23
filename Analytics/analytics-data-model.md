# Modelo de Dados

Sistema de usuário único: não há tabela de usuários, roles ou multi-tenant. `Site` não possui `owner_id`.

## Site
- id
- nome             (obrigatório)
- url              (obrigatório)
- ga4_property_id  (obrigatório)
- cliente          (opcional — rótulo/metadado, não dá acesso)
- segmento         (opcional)
- status           (opcional)

## Métrica
Total diário por site (agregado, sem dimensões).
- id
- site_id
- data
- usuarios     (activeUsers)
- sessoes      (sessions)
- pageviews    (screenPageViews)
- conversoes   (eventos-chave)

## PaginaMetrica
Suporta a seção "Principais Páginas" (dimensão de página).
- id
- site_id
- data
- page_path
- page_title   (opcional)
- pageviews

Índice: (site_id, data, page_path)

## CanalMetrica
Suporta a seção "Origem de Tráfego" (dimensão de canal/origem).
- id
- site_id
- data
- canal        (sessionDefaultChannelGroup)
- usuarios     (activeUsers)
- sessoes      (sessions)
- conversoes   (eventos-chave)

Índice: (site_id, data, canal)

## Notas
- A variação (últimos 7 dias vs 7 anteriores) e o "crescimento" são calculados a partir de `Métrica`, `PaginaMetrica` e `CanalMetrica` por data; não são armazenados.
- Dimensões fora do MVP (dispositivo, geo, lista de eventos, atribuição/campanhas/UTMs) não possuem tabela nesta versão — intencional.
