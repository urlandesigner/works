import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import {
  type FeatureFlagKey,
  isFeatureEnabled,
} from '../../config/feature-flags'

type FeatureRouteProps = {
  flag: FeatureFlagKey
  children: ReactNode
}

/**
 * Redireciona para /dashboard quando a feature está desligada (acesso direto por URL).
 */
export function FeatureRoute({ flag, children }: FeatureRouteProps) {
  if (!isFeatureEnabled(flag)) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
