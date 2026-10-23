// Ajuda objetiva: onde achar o Property ID e como não confundir com o Measurement ID.
export function PropertyIdHelp() {
  return (
    <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
      <p className="font-medium text-zinc-600">Onde encontrar</p>
      <p className="mt-0.5">
        No GA4: Administrador → Configurações da propriedade → ID da propriedade. É um número (ex.:
        123456789). Não use o Measurement ID (G-XXXXXXX).
      </p>
    </div>
  );
}
