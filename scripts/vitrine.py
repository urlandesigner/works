#!/usr/bin/env python3
"""
Manutencao da vitrine: a lista em projetos.json.

Este repositorio nao guarda projeto nenhum. Cada projeto vive no repositorio
dele e tem endereco proprio em producao; aqui so ha uma lista de links.

  adicionar  Acrescenta um projeto ao projetos.json (e ao README, que repete a
             tabela). Os dois andam juntos ou nenhum anda.
  verificar  Abre cada url com HTTP e acusa as que nao respondem 200.

  --lista propostas  troca a vitrine da raiz pela pagina /propostas/
                     (propostas/propostas.json). Essa lista nao tem tabela
                     no README.

Uso:
    python3 scripts/vitrine.py adicionar --nome "Atlas" --desc "..." \
        --url https://exemplo.vercel.app/ --repo urlandesigner/Atlas
    python3 scripts/vitrine.py verificar
    python3 scripts/vitrine.py adicionar --lista propostas --nome "Dra. X" \
        --desc "..." --url https://x.vercel.app/ --repo urlandesigner/propostas-sites
"""

import argparse
import json
import pathlib
import sys
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parent.parent
README = RAIZ / "README.md"
# lista -> (arquivo, chave da lista dentro dele)
LISTAS = {
    "projetos": (RAIZ / "projetos.json", "projetos"),
    "propostas": (RAIZ / "propostas" / "propostas.json", "propostas"),
}

VERDE, VERM, AMAR, FIM = "\033[32m", "\033[31m", "\033[33m", "\033[0m"


def ok(m):    print(f"{VERDE}ok{FIM}    {m}")
def erro(m):  print(f"{VERM}erro{FIM}  {m}")
def aviso(m): print(f"{AMAR}aviso{FIM} {m}")


def status(url):
    # Alguns hosts recusam HEAD; tenta GET se vier erro.
    for metodo in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, method=metodo, headers={"User-Agent": "works-vitrine"})
            return urllib.request.urlopen(req, timeout=15).status
        except Exception as e:
            codigo = getattr(e, "code", 0)
    return codigo


def adicionar(args):
    if not args.url.startswith("https://"):
        erro("a url precisa comecar com https://")
        return 1
    arquivo, chave = LISTAS[args.lista]
    dados = json.loads(arquivo.read_text("utf8"))
    if any(p["nome"] == args.nome or p["url"] == args.url for p in dados[chave]):
        aviso(f'"{args.nome}" (ou essa url) ja esta na vitrine — nada a fazer')
        return 0
    codigo = status(args.url)
    if codigo != 200:
        erro(f"{args.url} respondeu {codigo} — so entra na vitrine o que esta no ar")
        return 1

    entrada = {"nome": args.nome, "desc": args.desc, "url": args.url, "repo": args.repo}
    dados[chave].append(entrada)
    arquivo.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", "utf8")
    ok(f"{arquivo.relative_to(RAIZ)} — {args.nome} (posicao {len(dados[chave])})")
    if args.lista != "projetos":
        return 0

    linhas = README.read_text("utf8").split("\n")
    fim = max(i for i, l in enumerate(linhas) if l.startswith("| ["))
    linhas.insert(fim + 1, f"| [{args.nome}]({args.url}) | {args.desc} | [`{args.repo}`](https://github.com/{args.repo}) |")
    README.write_text("\n".join(linhas), "utf8")
    ok("README.md — linha na tabela")
    return 0


def verificar(args):
    fora = 0
    for p in [p for arq, chave in LISTAS.values()
              for p in json.loads(arq.read_text("utf8"))[chave]]:
        codigo = status(p["url"])
        if codigo == 200:
            ok(f'{p["nome"]}  {p["url"]}')
        else:
            fora += 1
            erro(f'HTTP {codigo}  {p["nome"]}  {p["url"]}')
    return 1 if fora else 0


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("adicionar", help="acrescenta um projeto a vitrine")
    a.add_argument("--lista", choices=LISTAS, default="projetos", help="projetos (raiz) ou propostas (/propostas/)")
    a.add_argument("--nome", required=True)
    a.add_argument("--desc", required=True, help="o que e, para quem e o que da para fazer; sem numeros nem historico")
    a.add_argument("--url", required=True, help="endereco em producao")
    a.add_argument("--repo", required=True, help="owner/nome do repositorio de origem")
    a.set_defaults(func=adicionar)
    v = sub.add_parser("verificar", help="confere se cada url (das duas listas) responde 200")
    v.set_defaults(func=verificar)
    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
