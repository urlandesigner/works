import type { ProposalEntry, ProposalForm } from "@/lib/proposals/store"
import {
  getKnownProposalPlanValue,
  getProposalAddonTotal,
  getProposalAddonOptions,
  getProposalDevelopmentTotal,
  getProposalDisplayTotal,
  normalizeProposalEntry,
  resolveOfferedDevelopmentTotal,
} from "@/lib/proposals/store"

export type ProposalOfferSource = Pick<
  ProposalEntry,
  | "isPartnership"
  | "totalValue"
  | "included"
  | "title"
  | "clientName"
  | "objective"
  | "estimatedDeadline"
  | "domainFirstYearFree"
  | "hostingFirstYearFree"
  | "baselineTotalValue"
  | "discountPercent"
  | "offerRevision"
>

export type ProposalOfferInput = ProposalOfferSource | ProposalForm

function asOfferNumber(value: string | number | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const parsed = Number(String(value ?? "").replace(",", "."))
  return Number.isFinite(parsed) ? parsed : 0
}

function coerceOfferSource(source: ProposalOfferInput): ProposalOfferSource {
  return {
    isPartnership: Boolean(source.isPartnership),
    totalValue: asOfferNumber(source.totalValue),
    included: source.included ?? [],
    title: "title" in source ? String(source.title ?? "") : "",
    clientName: "clientName" in source ? String(source.clientName ?? "") : "",
    objective: "objective" in source ? String(source.objective ?? "") : "",
    estimatedDeadline: "estimatedDeadline" in source ? String(source.estimatedDeadline ?? "") : "",
    domainFirstYearFree: Boolean(source.domainFirstYearFree),
    hostingFirstYearFree: Boolean(source.hostingFirstYearFree),
    baselineTotalValue: asOfferNumber(source.baselineTotalValue),
    discountPercent: asOfferNumber(source.discountPercent),
    offerRevision: asOfferNumber(source.offerRevision),
  }
}

export function hasActiveProposalOffer(
  source: Partial<
    Pick<ProposalEntry, "discountPercent" | "offerRevision" | "baselineTotalValue" | "totalValue">
  >
) {
  const discount = asOfferNumber(source.discountPercent)
  const revision = asOfferNumber(source.offerRevision)
  const baseline = asOfferNumber(source.baselineTotalValue)
  const total = asOfferNumber(source.totalValue)

  if (discount > 0 && revision > 0) return true
  if (discount > 0 && baseline > total + 0.009) return true
  return false
}

export function getProposalOfferDiscountAmount(source: ProposalOfferInput, inferFromAddonOnly = true) {
  const pricing = getProposalOfferPricing(source, inferFromAddonOnly)
  if (!pricing.hasOffer) return 0
  return Math.max(pricing.developmentBaseline - pricing.developmentTotal, 0)
}

export function getProposalListDevelopmentTotal(source: ProposalOfferInput, inferFromAddonOnly = true) {
  const pricing = getProposalOfferPricing(source, inferFromAddonOnly)
  return pricing.hasOffer ? pricing.developmentBaseline : pricing.developmentTotal
}

export function calculateDiscountedTotal(baseline: number, discountPercent: number) {
  const discount = Math.min(Math.max(discountPercent, 0), 100)
  return Math.round(baseline * (1 - discount / 100) * 100) / 100
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

function getOfferPricingBase(source: ProposalOfferInput, inferFromAddonOnly = true) {
  const normalized = coerceOfferSource(source)
  const addonOptions = getProposalAddonOptions(normalized)
  const addonTotal = getProposalAddonTotal(normalized.included, addonOptions)
  const baseline = getProposalBaselineTotal(normalized, inferFromAddonOnly)
  const developmentBaseline = getProposalDevelopmentTotal(
    normalized.isPartnership,
    baseline,
    normalized.included,
    addonOptions,
    inferFromAddonOnly
  )

  return {
    normalized,
    addonOptions,
    addonTotal,
    baseline,
    developmentBaseline,
  }
}

export function calculateProposalOfferTotal(
  source: ProposalOfferInput,
  discountPercent: number,
  inferFromAddonOnly = true
) {
  const { addonTotal, developmentBaseline } = getOfferPricingBase(source, inferFromAddonOnly)
  return roundCurrency(calculateDiscountedTotal(developmentBaseline, discountPercent) + addonTotal)
}

export function getProposalBaselineTotal(source: ProposalOfferInput, inferFromAddonOnly = true) {
  const normalized = coerceOfferSource(source)
  const addonOptions = getProposalAddonOptions(normalized)
  const addonTotal = getProposalAddonTotal(normalized.included, addonOptions)
  const knownPlanValue = getKnownProposalPlanValue(normalized)

  if (normalized.baselineTotalValue > 0) {
    if (
      knownPlanValue > 0 &&
      Math.abs(normalized.baselineTotalValue + addonTotal - knownPlanValue) <= 0.01
    ) {
      return knownPlanValue
    }
    return normalized.baselineTotalValue
  }

  if (knownPlanValue > 0 && Math.abs(normalized.totalValue + addonTotal - knownPlanValue) <= 0.01) {
    return knownPlanValue
  }

  return getProposalDevelopmentTotal(
    normalized.isPartnership,
    normalized.totalValue,
    normalized.included,
    addonOptions,
    inferFromAddonOnly
  )
}

export function getProposalOfferPricing(source: ProposalOfferInput, inferFromAddonOnly = true) {
  const { normalized, addonOptions, addonTotal, baseline, developmentBaseline } = getOfferPricingBase(
    source,
    inferFromAddonOnly
  )
  const hasOffer = hasActiveProposalOffer(normalized)
  const developmentTotal = hasOffer
    ? resolveOfferedDevelopmentTotal(
        normalized.totalValue,
        developmentBaseline,
        normalized.discountPercent,
        addonTotal
      )
    : getProposalDevelopmentTotal(
        normalized.isPartnership,
        normalized.totalValue,
        normalized.included,
        addonOptions,
        inferFromAddonOnly
      )
  const displayTotal = hasOffer
    ? roundCurrency(developmentTotal + addonTotal)
    : getProposalDisplayTotal(
        normalized.isPartnership,
        normalized.totalValue,
        normalized.included,
        addonOptions,
        normalized,
        inferFromAddonOnly
      )

  return {
    addonOptions,
    addonTotal,
    baseline: developmentBaseline,
    originalTotal: roundCurrency(developmentBaseline + addonTotal),
    developmentBaseline,
    developmentTotal,
    displayTotal,
    discountPercent: normalized.discountPercent,
    hasOffer,
    offerRevision: normalized.offerRevision,
  }
}

export function canCreateProposalOffer(proposal: ProposalEntry) {
  return proposal.status !== "draft" && proposal.status !== "expired"
}

export function applyNewOfferToProposal(proposal: ProposalEntry, discountPercent: number) {
  const addonOptions = getProposalAddonOptions(proposal)
  const baseline = getProposalBaselineTotal(proposal)
  const normalizedDiscount = Math.min(Math.max(discountPercent, 0), 100)
  const developmentBaseline = getProposalDevelopmentTotal(
    proposal.isPartnership,
    baseline,
    proposal.included,
    addonOptions
  )
  const discountedTotal = roundCurrency(calculateDiscountedTotal(developmentBaseline, normalizedDiscount))
  const now = new Date().toISOString()

  return normalizeProposalEntry({
    ...proposal,
    baselineTotalValue: developmentBaseline,
    discountPercent: normalizedDiscount,
    totalValue: discountedTotal,
    offerRevision: Math.max(proposal.offerRevision ?? 0, 0) + 1,
    offerUpdatedAt: now,
    updated_at: now,
    status: proposal.status === "draft" ? "sent" : proposal.status,
    isPartnership: proposal.isPartnership,
    included: proposal.included,
    domainFirstYearFree: addonOptions.domainFirstYearFree,
    hostingFirstYearFree: addonOptions.hostingFirstYearFree,
  })
}

export function removeProposalOffer(proposal: ProposalEntry) {
  const baseline = getProposalBaselineTotal(proposal)
  const now = new Date().toISOString()

  return normalizeProposalEntry({
    ...proposal,
    totalValue: baseline,
    baselineTotalValue: 0,
    discountPercent: 0,
    offerRevision: 0,
    offerUpdatedAt: null,
    updated_at: now,
  })
}
