/**
 * Marca exibida no app (nome, slogan). Importe em componentes em vez de strings soltas.
 */
export const branding = {
  name: 'MyCofre',
  tagline: 'Controle seu dinheiro em um só lugar',
} as const

export type Branding = typeof branding
