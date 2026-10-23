interface Props {
  status: 'submitting' | 'error';
  message?: string;
}

// Status inline do envio: nunca deixa a tela parecer travada durante o sync.
export function SubmitFeedback({ status, message }: Props) {
  if (status === 'submitting') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
        <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
        Conectando ao GA4 e buscando os primeiros 30 dias de dados…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
      {message ?? 'Não foi possível cadastrar o site.'} Tente novamente.
    </div>
  );
}
