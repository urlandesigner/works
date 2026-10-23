import type { DashboardFinancialAlert } from './types/alert-card';

export function getDashboardFinancialAlert(params: {
  monthIncome: number;
  monthExpenses: number;
}): DashboardFinancialAlert {
  const { monthIncome, monthExpenses } = params;
  const balance = monthIncome - monthExpenses;

  if (monthIncome <= 0 && monthExpenses > 0) {
    return {
      type: 'warning',
      title: 'Receitas do mes',
      description:
        'Ha despesas registradas, mas nenhuma receita neste mes. Vale revisar as entradas para enxergar o saldo real.',
    };
  }

  if (monthIncome <= 0 && monthExpenses <= 0) {
    return {
      type: 'positive',
      title: 'Sem movimentacoes no mes',
      description: 'Quando novas receitas e despesas entrarem, mostramos alertas relevantes aqui.',
    };
  }

  const ratio = monthExpenses / monthIncome;

  if (monthExpenses > monthIncome || ratio >= 0.95) {
    return {
      type: 'danger',
      title: 'Gastos acima do esperado',
      description: 'Voce ja comprometeu grande parte da renda do mes. Vale revisar o que ainda pode ser ajustado.',
    };
  }

  if (ratio >= 0.7) {
    return {
      type: 'warning',
      title: 'Atencao ao ritmo de gastos',
      description: 'Se continuar assim, existe risco de ultrapassar o orcamento antes do fim do mes.',
    };
  }

  return {
    type: 'positive',
    title: 'Controle financeiro saudavel',
    description:
      balance > 0
        ? 'Seu saldo do mes esta positivo e dentro do esperado.'
        : 'Suas despesas ainda estao abaixo do ritmo de receitas.',
  };
}
