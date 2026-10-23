/** Ex.: "Hoje, 28 de março · 14:32" (fuso do dispositivo). */
export function formatMensagemMoment(date: Date): string {
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month =
    parts.find((p) => p.type === "month")?.value.toLowerCase() ?? "";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";
  return `Hoje, ${day} de ${month} · ${hour}:${minute}`;
}
