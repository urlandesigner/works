import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Só roda no runtime Node (API routes / servidor). Não importar em arquivos Edge.
 */
export function runNodeEnvCheck(): void {
  const cwd = process.cwd();
  const envLocalPath = join(cwd, ".env.local");
  const envLocalExists = existsSync(envLocalPath);

  const hasApiKey = Boolean(process.env.ASAAS_API_KEY?.trim());
  const apiUrl = process.env.ASAAS_API_URL;

  console.log("[env] process.cwd() (raiz esperada do Next) =", cwd);
  console.log(
    "[env] arquivo .env.local",
    envLocalExists ? "encontrado:" : "NÃO encontrado em:",
    envLocalPath,
  );
  console.log("[env] ASAAS_API_KEY definida =", hasApiKey);
  console.log(
    "[env] ASAAS_API_URL =",
    apiUrl !== undefined && apiUrl !== "" ? apiUrl : "(não definido)",
  );

  if (!envLocalExists) {
    console.error(
      "[env] ERRO: coloque `.env.local` na raiz do app (mesmo diretório que `package.json`), por exemplo:",
      envLocalPath,
    );
  }

  if (!hasApiKey) {
    console.error(
      "[env] ERRO: ASAAS_API_KEY não está definida no processo. As rotas em `/api/*` não conseguirão chamar o Asaas.",
      "Confira: arquivo na raiz, nome exato `.env.local`, reinicie `npm run dev` após salvar, linha no formato ASAAS_API_KEY=... (sem espaços antes do nome).",
    );
  }

  if (apiUrl === undefined || apiUrl.trim() === "") {
    console.warn(
      "[env] AVISO: ASAAS_API_URL não definida; o código usará o host padrão do sandbox.",
    );
  }
}
