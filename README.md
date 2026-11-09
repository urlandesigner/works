# Works — Urlan Dipre

Vitrine dos projetos, estudos e protótipos publicados fora do trabalho do dia
a dia. **Este repositório não guarda projeto nenhum**: cada um vive no próprio
repositório e tem o próprio endereço em produção. Aqui só há uma página que
lista e abre esses endereços.

**Link público:** <https://urlandesigner.github.io/works/>

## Projetos

| Projeto | O que é | Código |
|---|---|---|
| [Analytics](https://analytics-seven-smoky.vercel.app/) | Status board de analytics do portfólio, sincroniza GA4 e mostra tráfego de cada site | [`urlandesigner/Analytics`](https://github.com/urlandesigner/Analytics) |
| [Atlas-pessoal](https://propostas.udlabs.com.br/) | Ferramenta pessoal de freelance: CRM de leads, propostas, projetos e indicadores de receita | [`urlandesigner/Atlas-Pessoal`](https://github.com/urlandesigner/Atlas-Pessoal) |
| [ComproPay](https://urlandesigner.github.io/compropay/) | Índice próprio com os projetos de design da ComproPay | [`urlandesigner/compropay`](https://github.com/urlandesigner/compropay) |
| [Dr.Geraldo](https://drgeraldo.vercel.app/) | Proposta de site para consultório de endocrinologia, página única pronta para aprovação do cliente | [`urlandesigner/drgeraldo`](https://github.com/urlandesigner/drgeraldo) |
| [LP Urlan](https://lp-urlan-dipre.vercel.app/) | Landing page pessoal da UD Labs, com briefing de projeto e diagnóstico de site para captar leads | [`urlandesigner/LP-UrlanDipre`](https://github.com/urlandesigner/LP-UrlanDipre) |
| [LP afiliados](https://lp-afiliados-gilt.vercel.app/) | Landing page de afiliado para suplemento, com análise de ingredientes, prova social e teste de headline | [`urlandesigner/LP-afiliados`](https://github.com/urlandesigner/LP-afiliados) |
| [mensageiro-do-bem](https://mensageirodobem.vercel.app/) | Microproduto de validação: paga um Pix simbólico e recebe uma mensagem inspiradora | [`urlandesigner/Mensageirodobem`](https://github.com/urlandesigner/Mensageirodobem) |
| [Portfólio](https://urlandipre.vercel.app/) | Portfólio de Urlan Dipré, product designer e UX/UI: cases, experiência profissional e contato para novos projetos | [`urlandesigner/urlandipre`](https://github.com/urlandesigner/urlandipre) |
| [MyCofre](https://app-financeiro-sand.vercel.app/) | App de controle financeiro pessoal, com conta própria para acompanhar o dinheiro em um só lugar | [`urlandesigner/AppFinanceiro`](https://github.com/urlandesigner/AppFinanceiro) |
| [Hub 1](https://hub1-drab.vercel.app/) | Estudo de design de card de oferta de marketplace, com preço, prazo de entrega, frete e botão de compra | [`urlandesigner/hub1`](https://github.com/urlandesigner/hub1) |
| [Portal de Design](https://designportal-v1.vercel.app/) | Hub do time de design da Ybera: cases, processo e cultura do time num lugar só, para dar visibilidade ao trabalho e manter a identidade coerente | [`urlandesigner/designportal`](https://github.com/urlandesigner/designportal) |
| [Dra.BeatrizMartins](https://dra-beatriz-martins.vercel.app/) | Site de uma pneumologista de Vitória/ES, página única com especialidades, credenciais, depoimentos, perguntas frequentes e agendamento pelo WhatsApp | [`urlandesigner/Dra.BeatrizMartins`](https://github.com/urlandesigner/Dra.BeatrizMartins) |

## Como funciona

- `projetos.json` — **a fonte única**: nome, descrição, `url` em produção, `repo`
  de origem e, quando existia pasta aqui, `pasta_antiga`.
- `index.html` — lê o `projetos.json` e desenha os cartões. Cada cartão abre a
  `url` em outra aba.
- `404.html` — o Pages só usa o da raiz. Se o endereço errado for de uma pasta
  antiga (`/works/Atlas-pessoal/…`), leva para a `url` do projeto, então link
  antigo compartilhado continua valendo. Senão, mostra uma 404 geral.
- `scripts/vitrine.py` — adiciona projeto e confere se as urls respondem.

## Regra de ouro

**O projeto sobe para o repositório dele, não para cá.** Aqui entra só o link.

## Adicionar um projeto

Primeiro o projeto precisa estar no ar, com repositório próprio. Depois:

```bash
python3 scripts/vitrine.py adicionar \
  --nome "Nome" \
  --desc "o que é, para quem e o que dá para fazer" \
  --url https://meu-projeto.vercel.app/ \
  --repo urlandesigner/meu-projeto
```

O comando recusa url que não responde 200 e atualiza o `projetos.json` e a
tabela deste README juntos. Dá para editar os dois à mão. Para conferir tudo:

```bash
python3 scripts/vitrine.py verificar
```

Para ver local, sirva a pasta (o `index.html` lê o JSON por `fetch`, então
abrir o arquivo direto não funciona): `python3 -m http.server 8000`.

### Texto de apresentação não envelhece

A `desc` diz o que o projeto é, para quem e o que dá para fazer nele. Não leva
**quantidade** (26 perguntas, 22 telas), **lista de itens** nem **histórico do
trabalho**. Teste: se amanhã entrar uma tela nova, o texto continua certo?

## Removido da vitrine

- **Condominio** — saiu até ter repositório e endereço próprios. O código
  antigo continua no histórico do git deste repositório. (O MyCofre voltou,
  agora com repositório próprio.)
