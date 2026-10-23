import { toDataURL } from "qrcode";

/** Valor fixo solicitado (string com ponto, padrão PIX). */
export const PIX_FIXED_AMOUNT = "1.00" as const;

export const PIX_FIXED_AMOUNT_LABEL = "R$ 1,00" as const;

const GUI = "br.gov.bcb.pix";

/** CRC16-CCITT-FALSE (polinômio 0x1021), usado no campo 63 do BR Code. */
function crc16Pix(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  if (len.length !== 2) {
    throw new Error(`Valor TLV muito longo para o id ${id}`);
  }
  return id + len + value;
}

function sanitizePixText(value: string, max: number): string {
  const plain = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .toUpperCase();
  return plain.slice(0, max);
}

export type BuildPixCopiaColaInput = {
  /** Chave PIX (ex.: e-mail cadastrado no banco). */
  pixKey: string;
  /** Padrão: {@link PIX_FIXED_AMOUNT} */
  amount?: string;
  /** Nome do recebedor (máx. 25 caracteres úteis após saneamento). */
  merchantName?: string;
  /** Cidade (máx. 15). */
  merchantCity?: string;
};

/**
 * Monta o payload “Copia e Cola” do PIX (EMV / BR Code estático com valor).
 */
export function buildPixCopiaCola(input: BuildPixCopiaColaInput): string {
  const chave = input.pixKey.trim();
  if (!chave) {
    throw new Error("Chave PIX vazia.");
  }

  const amount = input.amount ?? PIX_FIXED_AMOUNT;
  const merchantName = sanitizePixText(
    input.merchantName ?? "Mensageiro do Bem",
    25,
  );
  const merchantCity = sanitizePixText(input.merchantCity ?? "SAO PAULO", 15);

  const accountInfo = tlv("00", GUI) + tlv("01", chave);
  const body =
    tlv("00", "01") +
    tlv("26", accountInfo) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", amount) +
    tlv("58", "BR") +
    tlv("59", merchantName) +
    tlv("60", merchantCity);

  const forCrc = `${body}6304`;
  return forCrc + crc16Pix(forCrc);
}

/** Gera imagem PNG do QR em data URL a partir do payload PIX. */
export function pixPayloadToQrDataUrl(
  payload: string,
  options?: { width?: number },
): Promise<string> {
  return toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: options?.width ?? 240,
    type: "image/png",
  });
}
