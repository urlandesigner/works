#!/usr/bin/env python3
"""
Manutencao da vitrine: a lista em projetos.json.

Este repositorio nao guarda projeto nenhum. Cada projeto vive no repositorio
dele e tem endereco proprio em producao; aqui so ha uma lista de links.

  adicionar  Acrescenta um projeto ao projetos.json (e ao README, que repete a
             tabela). Os dois andam juntos ou nenhum anda.
  verificar  Abre cada url com HTTP e acusa as que nao respondem 200.

Uso:
    python3 scripts/vitrine.py adicionar --nome "Atlas" --desc "..." \
        --url https://exemplo.vercel.app/ --repo urlandesigner/Atlas
    python3 scripts/vitrine.py verificar
"""

import argparse
import json
import pathlib
import sys
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parent.parent
JSON = RAIZ / "projetos.json"
README = RAIZ / "README.md"

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
    dados = json.loads(JSON.read_text("utf8"))
    if any(p["nome"] == args.nome or p["url"] == args.url for p in dados["projetos"]):
        aviso(f'"{args.nome}" (ou essa url) ja esta na vitrine — nada a fazer')
        return 0
    codigo = status(args.url)
    if codigo != 200:
        erro(f"{args.url} respondeu {codigo} — so entra na vitrine o que esta no ar")
        return 1

    entrada = {"nome": args.nome, "desc": args.desc, "url": args.url, "repo": args.repo}
    dados["projetos"].append(entrada)
    JSON.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", "utf8")
    ok(f"projetos.json — {args.nome} (posicao {len(dados['projetos'])})")

    linhas = README.read_text("utf8").split("\n")
    fim = max(i for i, l in enumerate(linhas) if l.startswith("| ["))
    linhas.insert(fim + 1, f"| [{args.nome}]({args.url}) | {args.desc} | [`{args.repo}`](https://github.com/{args.repo}) |")
    README.write_text("\n".join(linhas), "utf8")
    ok("README.md — linha na tabela")
    return 0


def verificar(_):
    dados = json.loads(JSON.read_text("utf8"))
    fora = 0
    for p in dados["projetos"]:
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
    a.add_argument("--nome", required=True)
    a.add_argument("--desc", required=True, help="o que e, para quem e o que da para fazer; sem numeros nem historico")
    a.add_argument("--url", required=True, help="endereco em producao")
    a.add_argument("--repo", required=True, help="owner/nome do repositorio de origem")
    a.set_defaults(func=adicionar)
    v = sub.add_parser("verificar", help="confere se cada url responde 200")
    v.set_defaults(func=verificar)
    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
