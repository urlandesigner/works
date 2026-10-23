# Fontes de Dados

## Fonte principal do MVP
Google Analytics 4 (Data API). Única fonte. A UI lê do Supabase; o GA4 é sincronizado em background.

Este arquivo é um catálogo da fonte, não o escopo do produto. O escopo está em `product-requirements.md`.

## Dados usados no MVP
- usuários (activeUsers)
- sessões (sessions)
- visualizações (screenPageViews)
- conversões (eventos-chave)
- páginas mais acessadas (pagePath)
- canal / origem (sessionDefaultChannelGroup)

## Disponível na fonte, fora do MVP (uso futuro)
- dispositivo
- país/cidade
- lista de eventos
- atribuição avançada, campanhas, UTMs detalhadas
