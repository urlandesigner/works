/**
 * Dados de cadastro persistidos localmente (apenas texto).
 * Foto de perfil: preview em memória na sessão (ver `UserProfileContext`); futura API pode adicionar `avatar_url`.
 */
export interface UserProfile {
  name: string
  email: string
  phone: string
  updated_at?: string
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Usuário',
  email: 'usuario@email.com',
  phone: '',
}
