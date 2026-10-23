# Analytics Dashboard

Ferramenta interna e pessoal da UD Labs para acompanhar todos os sites desenvolvidos, centralizando a visão de Analytics em um único lugar.

Natureza do produto:
- Sistema interno, de uso pessoal.
- Usuário único (o administrador/dono da UD Labs).
- Sem acesso de clientes, sem multiusuário, sem permissões ou roles.
- Login existe apenas para proteger o acesso.

Objetivo:
Acompanhar tráfego, comportamento e conversões de todos os sites da UD Labs em um único local, respondendo rapidamente: "Onde preciso olhar agora?".

Papéis das telas:
- Home (Visão Geral): central operacional do portfólio. Orientada a estado, variação e exceção. Compara e sinaliza; não aprofunda nenhum site.
- Dashboard do Site: visão analítica detalhada de um único site. Concentra todo o detalhe.

Prioridades:
1. Simplicidade
2. Performance
3. Visualização clara dos dados
4. Fácil inclusão de novos sites
5. Escalabilidade

Fonte de dados do MVP:
- Google Analytics 4 é a única fonte de dados.
- Não implementar outras integrações nesta versão (sem SEO, Search Console, uptime ou IA).
- Cada site é vinculado a um GA4 Property ID.
- A UI lê do Supabase; o GA4 é sincronizado em background.

Lente temporal padrão:
- Comparação padrão: últimos 7 dias vs 7 dias anteriores.

Critérios de atenção da Home (em ordem de prioridade):
1. Problemas técnicos (sem sync, erro de integração GA4, ausência de dados)
2. Quedas relevantes (> 30%)
3. Crescimentos relevantes (> 50%)

Stack inicial:
- React
- TypeScript
- Tailwind
- Supabase

Desenvolvimento local:
- Rodar sempre o projeto na porta 5174 (`npm run dev`). A porta está fixada em vite.config.ts (strictPort) e no .claude/launch.json.
