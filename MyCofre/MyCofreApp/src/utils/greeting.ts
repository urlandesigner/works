export function getGreeting(name: string, hour = new Date().getHours()): string {
  if (hour < 12) return `Bom dia, ${name}`;
  if (hour < 18) return `Boa tarde, ${name}`;
  return `Boa noite, ${name}`;
}
