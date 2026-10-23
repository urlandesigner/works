"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { fetchAllFromSupabase } from "@/lib/supabase/data"
import { hydrateLeads, emitLeadsChange } from "@/lib/crm/store"
import { hydrateProposals, emitProposalsChange } from "@/lib/proposals/store"
import { hydrateClients, emitClientsChange } from "@/lib/clients/store"
import { hydrateProjects, emitProjectsChange } from "@/lib/projects/store"

function emitAll() {
  emitLeadsChange()
  emitProposalsChange()
  emitClientsChange()
  emitProjectsChange()
}

export function AtlasStorageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicProposal = pathname.startsWith("/proposta/")
  const [ready, setReady] = useState(isPublicProposal)

  useEffect(() => {
    if (isPublicProposal) return

    let active = true

    // Safety net: never leave the UI stuck on "Carregando dados..." even if
    // Supabase's client throws on init or onAuthStateChange never fires
    // (e.g. a stale/corrupted session in the browser's storage).
    const safetyTimeout = setTimeout(() => {
      if (active) setReady(true)
    }, 8000)

    async function load() {
      try {
        const { leads, proposals, clients, projects } = await fetchAllFromSupabase()
        if (!active) return
        hydrateLeads(leads)
        hydrateProposals(proposals)
        hydrateClients(clients)
        hydrateProjects(projects)
        emitAll()
      } catch (err) {
        console.error("[atlas] failed to load from Supabase:", err)
      }
    }

    function clear() {
      hydrateLeads([])
      hydrateProposals([])
      hydrateClients([])
      hydrateProjects({ freelancer: [], professional: [], personal: [] })
      emitAll()
    }

    try {
      const supabase = createClient()

      // Re-fetch whenever auth state changes so login/logout hydrate correctly.
      // onAuthStateChange fires INITIAL_SESSION on subscribe (covers first load).
      // Supabase calls are deferred out of the callback to avoid auth deadlocks.
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          clear()
          if (active) setReady(true)
          return
        }
        setTimeout(() => {
          void load().finally(() => {
            if (active) setReady(true)
          })
        }, 0)
      })

      return () => {
        active = false
        clearTimeout(safetyTimeout)
        sub.subscription.unsubscribe()
      }
    } catch (err) {
      console.error("[atlas] failed to initialize Supabase client:", err)
      setReady(true)
      return () => {
        active = false
        clearTimeout(safetyTimeout)
      }
    }
  }, [isPublicProposal])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando dados...
      </div>
    )
  }

  return <>{children}</>
}
