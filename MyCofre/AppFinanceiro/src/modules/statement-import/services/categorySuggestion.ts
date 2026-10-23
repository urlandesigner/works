const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Alimentacao: ['ifood', 'restaurante', 'lanchonete', 'mercado', 'supermercado'],
  Transporte: ['uber', '99', 'combustivel', 'posto', 'estacionamento'],
  Moradia: ['aluguel', 'condominio', 'energia', 'agua', 'internet', 'gas'],
  Lazer: ['cinema', 'netflix', 'spotify', 'teatro', 'show'],
  Saude: ['farmacia', 'hospital', 'clinica', 'laboratorio'],
  Salario: ['salario', 'pagamento', 'provento', 'folha'],
}

export function suggestCategoryByDescription(description: string): string | null {
  const normalized = description.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category
    }
  }
  return null
}
