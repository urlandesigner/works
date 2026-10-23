import type { ParsedFinanceAction } from './types';

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseBrlAmount(value: string): number {
  return Number.parseFloat(value.replace(/\./g, '').replace(',', '.').trim());
}

function extractAmount(text: string): number | null {
  const normalized = text.replace(/\s+/g, ' ').trim();

  const beforeDia = normalized.match(/\b(\d{2,6})\s+dia\s+\d{1,2}\b/i);
  if (beforeDia) return Number.parseInt(beforeDia[1], 10);

  const brlFull = normalized.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
  if (brlFull) return parseBrlAmount(brlFull[1]);

  const commaDecimal = normalized.match(/\b(\d{1,3}),(\d{2})\b/);
  if (commaDecimal) return Number.parseFloat(`${commaDecimal[1]}.${commaDecimal[2]}`);

  const bigNumber = normalized.match(/\b(\d{4,})\b/);
  if (bigNumber) return Number.parseInt(bigNumber[1], 10);

  const afterVerb = normalized.match(
    /\b(?:gastei|paguei|recebi|ganhei|comprei|r\$)\s*(\d{1,6})\b/i,
  );
  if (afterVerb) return Number.parseInt(afterVerb[1], 10);

  const noWord = normalized.match(/\b(\d{1,3})\s+no\s+/i);
  if (noWord) return Number.parseInt(noWord[1], 10);

  const trailing = normalized.match(/\b(\d{2,6})\s*$/i);
  if (trailing && !/\bdia\s+\d{1,2}\s*$/i.test(normalized)) {
    return Number.parseInt(trailing[1], 10);
  }

  return null;
}

function extractDate(text: string): { iso: string; assumed: boolean } {
  const input = text.toLowerCase();
  const now = new Date();

  if (/\bhoje\b/.test(input)) return { iso: toIso(now), assumed: false };
  if (/\bontem\b/.test(input)) return { iso: toIso(addDays(now, -1)), assumed: false };
  if (/\banteontem\b/.test(input)) return { iso: toIso(addDays(now, -2)), assumed: false };

  const brDate = input.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (brDate) {
    const day = Number.parseInt(brDate[1], 10);
    const month = Number.parseInt(brDate[2], 10) - 1;
    const year = brDate[3]
      ? brDate[3].length === 2
        ? 2000 + Number.parseInt(brDate[3], 10)
        : Number.parseInt(brDate[3], 10)
      : now.getFullYear();
    return { iso: toIso(new Date(year, month, day)), assumed: false };
  }

  const diaDate = input.match(/\bdia\s+(\d{1,2})\b/);
  if (diaDate) {
    const day = Number.parseInt(diaDate[1], 10);
    return { iso: toIso(new Date(now.getFullYear(), now.getMonth(), day)), assumed: false };
  }

  return { iso: toIso(now), assumed: true };
}

function suggestCategory(text: string): string | null {
  const input = text.toLowerCase();

  if (/ifood|restaurante|lanche|pizza|burger|mercado|supermercado|padaria/.test(input)) {
    return 'Alimentação';
  }
  if (/uber|99|taxi|transporte|ônibus|onibus|metro|combustivel|gasolina/.test(input)) {
    return 'Transporte';
  }
  if (/farmácia|farmacia|drogaria|saúde|saude|médico|medico|hospital/.test(input)) {
    return 'Saúde';
  }
  if (/salário|salario|freelance|renda|bônus|bonus|pix recebido|depósito|deposito/.test(input)) {
    return 'Renda';
  }

  return null;
}

function extractDescription(original: string, amount: number | null): string {
  let text = original.trim();

  if (amount != null) {
    text = text.replace(String(amount), ' ');
  }

  text = text.replace(/\d{1,3}(?:\.\d{3})*,\d{2}/g, ' ');
  text = text.replace(/\b\d+,\d{2}\b/g, ' ');
  text = text.replace(/\b\d{4,}\b/g, ' ');
  text = text.replace(/\bhoje\b|\bontem\b|\banteontem\b/gi, ' ');
  text = text.replace(/\bdia\s+\d{1,2}\b/gi, ' ');
  text = text.replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, ' ');
  text = text.replace(/\bgastei|paguei|recebi|ganhei|comprei|no\b/gi, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text.length >= 2 ? text : 'Movimentacao';
}

function detectIntent(text: string): { type: 'income' | 'expense'; confidence: number } {
  const input = text.toLowerCase();
  let income = 0;
  let expense = 0;

  if (/\brecebi\b|\bganhei\b|\bsalário\b|\bsalario\b|\bentrada\b|\bfreelance\b|\bdep[oó]sito\b|\bpix recebido\b/.test(input)) {
    income += 3;
  }
  if (/\bgastei\b|\bpaguei\b|\bcomprei\b|\bdespesa\b/.test(input)) {
    expense += 3;
  }
  if (/ifood|mercado|uber|farmácia|farmacia|supermercado/.test(input)) {
    expense += 1;
  }
  if (/salário|salario|freelance|renda/.test(input)) {
    income += 2;
  }

  if (income > expense) return { type: 'income', confidence: Math.min(0.95, 0.5 + income * 0.1) };
  if (expense > income) return { type: 'expense', confidence: Math.min(0.95, 0.5 + expense * 0.1) };
  return /\brecebi|\bganhei|\bsalário|\bsalario/.test(input)
    ? { type: 'income', confidence: 0.55 }
    : { type: 'expense', confidence: 0.45 };
}

export function parseFinanceMessage(input: string): ParsedFinanceAction {
  const raw = input.trim();

  if (!raw) {
    return {
      intent: 'unknown',
      confidence: 0,
      data: {},
      missingFields: ['valor', 'descricao', 'tipo'],
    };
  }

  const amount = extractAmount(raw);
  const { iso: dateIso, assumed: dateAssumed } = extractDate(raw);
  const { type, confidence: intentConfidence } = detectIntent(raw);
  const description = extractDescription(raw, amount);
  const category = suggestCategory(`${raw} ${description}`);

  const missingFields: string[] = [];
  if (amount == null || amount <= 0) missingFields.push('valor');
  if (!description || description.length < 2) missingFields.push('descricao');
  if (dateAssumed) missingFields.push('data explicita');

  const intent = amount == null ? 'unknown' : type;
  const confidence = Math.max(
    0.15,
    Math.min(0.98, (intent === 'unknown' ? 0.25 : intentConfidence) - missingFields.length * 0.12),
  );

  return {
    intent,
    confidence,
    data: {
      type,
      amount: amount ?? undefined,
      description,
      date: dateIso,
      category,
      dateAssumed,
    },
    missingFields,
  };
}
