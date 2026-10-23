// Pós-export: com images.unoptimized=true, next/image serve o `src` como
// está, sem prefixar com o basePath. Este script prefixa, em todo arquivo de
// texto do export, qualquer caminho "/arquivo" que aponte para algo que
// realmente existe em public/.
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, extname } from "path";

const basePath = process.argv[2];
if (!basePath) {
  console.error("uso: node fix-export-paths.mjs /base/path");
  process.exit(1);
}

const publicRoots = ["oral-microbiome.svg", "tablet-breakdown.svg"];

const outDir = join(import.meta.dirname, "..", "out");
const textExt = new Set([".html", ".js", ".css", ".txt", ".xml", ".json"]);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (textExt.has(extname(name))) fixFile(full);
  }
}

function fixFile(file) {
  let text = readFileSync(file, "utf8");
  let changed = false;
  for (const root of publicRoots) {
    const re = new RegExp(`(["'(])/${root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
    const next = text.replace(re, `$1${basePath}/${root}`);
    if (next !== text) changed = true;
    text = next;
  }
  if (changed) writeFileSync(file, text);
}

walk(outDir);
console.log("caminhos de imagem prefixados com", basePath);
