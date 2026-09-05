import { PlanTier, BillingCycle, CreditBundle } from './types'

// ===== Commercial Billing =====

export const PLANS: Record<PlanTier, {
  name: string
  tagline: string
  monthly_ngn: number
  yearly_ngn: number
  monthly_usd: number
  yearly_usd: number
  features: string[]
  unlimited_scans: boolean
  export_allowance: number
  accent: string
}> = {
  free: {
    name: 'Starter', tagline: 'Basic protection for everyday users',
    monthly_ngn: 0, yearly_ngn: 0, monthly_usd: 0, yearly_usd: 0,
    features: ['2 quick scans', 'Basic risk analysis', 'Community threat reports', '1 report export'],
    unlimited_scans: false, export_allowance: 1, accent: 'zinc'
  },
  pro: {
    name: 'Pro Analyst', tagline: 'Unlimited forensic deep scans for professionals',
    monthly_ngn: 15000, yearly_ngn: 150000, monthly_usd: 19, yearly_usd: 190,
    features: ['Unlimited deep scans', 'Forensic image OCR', 'Branded PDF/CSV exports', 'Threat intelligence feeds', 'Priority support'],
    unlimited_scans: true, export_allowance: 99, accent: 'emerald'
  },
  enterprise: {
    name: 'Enterprise', tagline: 'Bulk batch scanning & compliance for organizations',
    monthly_ngn: 75000, yearly_ngn: 750000, monthly_usd: 99, yearly_usd: 990,
    features: ['Everything in Pro', 'Bulk batch scanning', 'API access', 'Certified compliance reports', 'Dedicated analyst', 'SLA & audit logs'],
    unlimited_scans: true, export_allowance: 999, accent: 'amber'
  }
}

export const CREDIT_PACKS: CreditBundle[] = [
  { id: 'pack-scan-5', label: '5 Forensic Scans', scans: 5, priceUsd: 4.5, priceNgn: 3500 },
  { id: 'pack-scan-20', label: '20 Forensic Scans', scans: 20, priceUsd: 15, priceNgn: 12000, popular: true },
  { id: 'pack-export-10', label: '10 Report Exports', scans: 0, priceUsd: 12.5, priceNgn: 10000 },
  { id: 'pack-export-30', label: '30 Report Exports', scans: 0, priceUsd: 30, priceNgn: 25000 },
]

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Card', sub: 'Visa, Mastercard, Verve' },
  { id: 'bank', label: 'Bank Transfer', sub: 'Instant NGN transfer' },
  { id: 'paystack', label: 'Paystack', sub: 'Pay with Paystack' },
  { id: 'flutterwave', label: 'Flutterwave', sub: 'Pay with Flutterwave' },
  { id: 'crypto', label: 'Crypto / USDC', sub: 'USDC on Polygon' },
] as const

export const FREE_TRIAL_CREDITS = { scans: 2, exports: 1 }

export const CURRENCY_SYMBOL: Record<'NGN' | 'USD', string> = { NGN: '₦', USD: '$' }

export function planPrice(plan: PlanTier, cycle: BillingCycle): { ngn: number; usd: number } {
  const p = PLANS[plan]
  const monthly = cycle === 'monthly'
  return {
    ngn: monthly ? p.monthly_ngn : Math.round(p.yearly_ngn / 12),
    usd: monthly ? p.monthly_usd : Math.round(p.yearly_usd / 12),
  }
}