/**
 * Executado ao subir o servidor.
 *
 * Instrumentação com `instrumentation.node.ts` (node:fs) desativada temporariamente
 * para não quebrar o dev server. Para reativar o check de `.env.local`/Asaas:
 *   const { runNodeEnvCheck } = await import("./instrumentation.node");
 *   runNodeEnvCheck();
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  // noop — ver comentário acima
}
