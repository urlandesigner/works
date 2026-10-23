# Backlog Atual

## Entregue
- [x] App React + TypeScript + Tailwind iniciado e compilando
- [x] Estrutura em camadas: `integration → repositories → services → hooks → features`
- [x] Login protegido com Supabase Auth
- [x] Home operacional com atenção, resumo, tendência e listas por prioridade
- [x] Lista de Sites com busca, filtros e status de sync
- [x] Cadastro de site com sync inicial automático
- [x] Edição de site com retry manual de sync e arquivamento
- [x] Dashboard do Site com cards 7v7, tendência, canais, páginas e estado de frescor
- [x] Configurações com visão operacional de integrações, fila técnica e logout
- [x] Schema inicial do Supabase com tabelas, trigger, RLS e RPCs
- [x] Edge Function `sync-ga4` pronta para uso no Supabase
- [x] Modo mock/local para desenvolvimento offline
- [x] Projeto Supabase real conectado ao frontend

## Em aberto agora
- [ ] Ativar o cron diário no projeto Supabase real para o sync incremental de 3 dias
- [ ] Validar a rotina com múltiplos sites reais e confirmar execução recorrente
- [ ] Melhorar responsividade/mobile das telas principais
- [ ] Revisar performance do bundle e aplicar code-splitting onde fizer sentido
- [ ] Atualizar e consolidar a documentação operacional do projeto
- [ ] Adicionar testes mínimos para fluxos críticos

## Próximas evoluções
- [ ] Checklist de onboarding para novos sites
- [ ] Logs e mensagens de erro mais guiadas para falhas de GA4
- [ ] "Ver mais" em Principais Páginas
- [ ] Refinos de UX na tela de Configurações e no fluxo de retry

## Pós-MVP
- [ ] Conversões detalhadas / funil
- [ ] SEO
- [ ] Monitoramento técnico
- [ ] IA
