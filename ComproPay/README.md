# ComproPay

Protótipo navegável de um app de pagamento no celular. 21 telas em HTML
estático, com CSS próprio e tokens em `css/tokens.css`. Sem framework, sem
build, sem dependência.

Nada conversa com servidor: saldo, transações, favoritos e ofertas são fixos
no HTML, e os botões navegam entre telas em vez de executar ação. Existe para
percorrer os estados da interface e comparar as variações lado a lado.

## As peças

| Peça | O que é |
|---|---|
| [`detalhes/`](detalhes/index.html) | A capa do projeto, que é o que o índice do works abre |
| [`app.html`](app.html) | As telas numa moldura de celular, com a lista ao lado para trocar sem sair da página |
| [`index.html`](index.html) | As 21 telas em lista, para abrir uma isolada |

## As telas

| Área | Telas | O que varia |
|---|---|---|
| Início | 6 | Zero, um ou dois cartões, cada um com saldo visível e oculto |
| Pagar | 6 | Destinatário, QR, próximos de mim, busca, valor e valor recorrente |
| Extrato | 3 | Lista, detalhe da transação, detalhe com menu aberto |
| Vantagens | 3 | Até três, mais de três, e o detalhe de uma |
| Ajuda | 2 | Central de ajuda e a conversa com a assistente |
| Cartões | 1 | Meus cartões |

## Como está organizado

Cada tela é um arquivo HTML inteiro, sem include e sem montagem. O cabeçalho
e a barra de navegação se repetem de propósito: trocar uma tela nunca quebra
as outras, e abrir o arquivo mostra tudo o que aquela tela é.

- `css/tokens.css` — cor, espaçamento e tipografia
- `css/base.css` — o resto
- `assets/icons/` — SVG soltos
- `assets/img/` — imagens das telas
- `js/embed.js` — a troca de tela dentro da moldura do `app.html`

As telas abrem direto do arquivo, sem servidor. Só o `app.html` precisa de um,
porque usa iframe.

Urlan Dipre
