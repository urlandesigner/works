# Site Dr. Geraldo Andrade do Norte

Peça de apresentação (v1) para aprovação do projeto pelo cliente.
Página única, HTML e CSS puros, **zero JavaScript próprio**, sem build e sem
dependências. As fontes são servidas de `fonts/`; o mapa do consultório é a única
incorporação externa, carregada do Google Maps.

## Rodar local

    python3 -m http.server 8770 --bind 127.0.0.1

Abrir <http://127.0.0.1:8770>. O navegador guarda HTML e CSS em cache — ao conferir
alterações, use um parâmetro novo na URL (`?v=2`) ou force a recarga.

## Verificar

    ./verify.sh

Checa ausência de JavaScript, palavras proibidas, presença do CRM, seções obrigatórias,
`alt` nas imagens, metadados, marcadores de pendência e `<h1>` único.

Lighthouse medido em 2026-09-24: **100 / 100 / 100 / 100**
(performance, acessibilidade, boas práticas, SEO). O Lighthouse exige URL servida,
não caminho de arquivo:

    npx --yes lighthouse http://127.0.0.1:8770/index.html --chrome-flags="--headless=new"

## Pendências antes de publicar

1. ~~Foto da abertura~~ — feito: `img/banner.png` é o fundo da seção.
   `img/drgeraldo.png` e `img/drgeraldooff.png` ficaram sem uso; mantidos no
   repositório como originais, fora do deploy pelo `.vercelignore`.
   Falta: autorização de uso da imagem, e o logo do IMI aparece no bolso do
   jaleco (ver item de autorização das cores do IMI). Se houver uma segunda
   foto, ela cabe na seção "Sobre".
2. Bio e formação (faculdade, ano, residência, sociedades)
3. Confirmação de RQE — sem ele, o site não pode chamá-lo de endocrinologista.
   Dois pontos dependem disso: a linha "Atuação em endocrinologia e metabologia"
   nas credenciais, e o campo `medicalSpecialty` do JSON-LD (removido por ora —
   os dados estruturados afirmavam a especialidade que o texto visível evita).
4. Número de WhatsApp correto
5. ~~Endereço~~ — Rua Humberto Serrano, 995 · Itapoã, Vila Velha — ES · 29101-463.
   Três fontes batem na rua: as coordenadas do link do Maps (−20.3512209,
   −40.2880954), a ficha do próprio IMI no Doctoralia e os Correios. O número
   995 vem do Doctoralia e do Waze — não foi confirmado pelo cliente.
   Dois detalhes menores em aberto:
   - **Falta a sala.** É clínica de várias especialidades; sem a sala o paciente
     chega no prédio e não na porta. Única pendência que sobrou do endereço.
   - CEP: a ficha do IMI diz 29101-463; as coordenadas caem no trecho 29101-460.
     Mesma rua, segmentos vizinhos. Ninguém navega por CEP, mas vale conferir.
   - Bairro: os Correios registram a rua como "Praia da Costa"; o Maps e o
     Doctoralia dizem Itapuã/Itapoã. Mantive Itapoã, que é como a clínica se
     chama e como o paciente vai se referir ao lugar.
6. ~~Horário de atendimento~~ — confirmado: segunda a sexta, das 8h às 18h
7. Confirmar se há atendimento por telemedicina
8. Autorização para usar as cores do IMI
9. Validar com o CRM-ES a reprodução de depoimentos de pacientes
10. Consentimento do paciente nomeado no quarto depoimento
11. Trocar `og:image` para URL absoluta quando o domínio existir

## Privacidade

Sem formulário, banco ou analytics próprio. O site não recebe nem armazena dados do
visitante. O mapa incorporado carrega conteúdo de terceiros; o Google pode processar
dados técnicos e usar cookies conforme as políticas do Google Maps.

12. As "13 avaliações" estão escritas à mão em três lugares (abertura,
    seção de pacientes e o link do Doctoralia). Se o número mudar, atualizar os três.

13. `img/og-cover.png` ainda é a arte gerada como provisória. Com a foto real
    disponível, vale refazer a imagem de compartilhamento a partir dela.

14. A avaliação que aparece na abertura ("Você sai do consultório sem nenhuma
    dúvida", paciente anônimo, janeiro de 2017) é a mesma já publicada na seção
    de pacientes. Ela deixa o depoimento muito mais visível, o que aumenta o peso
    do item 9 — validar com o CRM-ES a reprodução de depoimentos.

Autor: Urlan Dipre.
