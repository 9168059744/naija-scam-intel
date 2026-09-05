import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, Lightning, Receipt, DownloadSimple, ArrowRight, Check,
  Calendar, CreditCard, Bank, CurrencyNgn, ShieldCheck, FilePdf
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { PLANS, CREDIT_PACKS, CURRENCY_SYMBOL, planPrice } from '../billing'
import { User, PlanTier, BillingCycle, Transaction } from '../types'

interface BillingDashboardProps {
  user: User
  onOpenCheckout: (kind: 'plan' | 'credits', plan?: PlanTier, cycle?: BillingCycle, bundleId?: string) => void
  onToggleAutoRenew: (enabled: boolean) => void
  onDownloadInvoice: (tx: Transaction) => void
  lang: string
}

const PLAN_COLORS: Record<PlanTier, string> = {
  free: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-400/30',
  pro: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  enterprise: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function BillingDashboard({ user, onOpenCheckout, onToggleAutoRenew, onDownloadInvoice, lang }: BillingDashboardProps) {
  const [autoRenew, setAutoRenew] = useState(user.plan !== 'free')
  const plan = PLANS[user.plan]
  const limit = plan.unlimited_scans ? 999 : plan.export_allowance
  const scansUsed = Math.min(limit, Math.max(0, limit - user.credits.scans))
  const exportsUsed = Math.min(limit, Math.max(0, limit - user.credits.exports))
  const sym = CURRENCY_SYMBOL.NGN

  const totals = useMemo(() => ({
    spent: user.transactions.filter(t => t.status === 'completed').reduce((a, t) => a + (t.currency === 'NGN' ? t.amount : t.amount * 1300), 0),
  }), [user.transactions])

  const methodIcon = (m: string) =>
    m === 'card' ? <CreditCard size={14} /> : m === 'bank' ? <Bank size={14} /> : m === 'crypto' ? <Lightning size={14} /> : <CurrencyNgn size={14} />

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <Receipt size={14} /> Billing &amp; Subscriptions
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">Manage your plan</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Track usage, top up credits, download invoices and control auto-renewal.</p>
        </div>
        <span className="rounded-xl border border-emerald-200/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
          Lifetime spent: {sym}{totals.spent.toLocaleString()}
        </span>
      </motion.div>

      {/* Current plan card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={`mt-6 overflow-hidden rounded-3xl border bg-white dark:bg-zinc-950 ${user.plan === 'enterprise' ? 'border-amber-400/40 shadow-lg shadow-amber-500/10' : 'border-emerald-200/20'}`}
      >
        <div className={`px-6 py-5 ${user.plan === 'enterprise' ? 'bg-gradient-to-r from-amber-500/15 to-yellow-500/10' : 'bg-gradient-to-r from-emerald-600/10 to-teal-600/5'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown size={20} weight="fill" className={user.plan === 'enterprise' ? 'text-amber-500' : 'text-emerald-500'} />
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">{plan.name}</h3>
                <Badge className={PLAN_COLORS[user.plan]}>{user.plan === 'free' ? 'Trial' : user.billing_cycle}</Badge>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{plan.tagline}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {plan.features.slice(0, 4).map(f => (
                  <span key={f} className="flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-zinc-600 shadow-sm dark:bg-zinc-900/70 dark:text-zinc-300">
                    <Check size={11} weight="bold" className="text-emerald-500" /> {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              {user.plan === 'free' ? (
                <>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">{sym}0<span className="text-sm font-medium text-zinc-400">/mo</span></div>
                  <Button className="mt-2 bg-gradient-to-r from-emerald-600 to-teal-600" onClick={() => onOpenCheckout('plan', 'pro')}>
                    Upgrade to Pro <ArrowRight size={15} weight="bold" className="ml-1" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                    {sym}{planPrice(user.plan, user.billing_cycle).ngn.toLocaleString()}<span className="text-sm font-medium text-zinc-400">/mo</span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">Renews {fmtDate(user.subscription_expires_at)}</div>
                  <div className="mt-2 flex items-center justify-end gap-2 text-xs text-zinc-500">
                    <button
                      onClick={() => onToggleAutoRenew(!autoRenew)}
                      className={`relative h-5 w-9 rounded-full transition ${autoRenew ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                      aria-label="Toggle auto-renew"
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${autoRenew ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                    Auto-renew {autoRenew ? 'on' : 'off'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200/60 p-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-200"><Lightning size={15} className="text-emerald-500" weight="fill" /> Forensic Scans</span>
              <span className="text-xs text-zinc-400">{plan.unlimited_scans ? 'Unlimited' : `${user.credits.scans} left`}</span>
            </div>
            <Progress value={plan.unlimited_scans ? 100 : (scansUsed / limit) * 100} className="h-2" />
          </div>
          <div className="rounded-2xl border border-zinc-200/60 p-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-200"><FilePdf size={15} className="text-rose-500" /> Report Exports</span>
              <span className="text-xs text-zinc-400">{plan.unlimited_scans ? 'Unlimited' : `${user.credits.exports} left`}</span>
            </div>
            <Progress value={plan.unlimited_scans ? 100 : (exportsUsed / limit) * 100} className="h-2" />
          </div>
        </div>
      </motion.div>

      {/* Credit packs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Credit Top-Ups</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKS.map(c => (
            <button
              key={c.id}
              onClick={() => onOpenCheckout('credits', undefined, undefined, c.id)}
              className="group rounded-2xl border border-zinc-200/70 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                <Lightning size={18} weight="fill" className="text-amber-500" />
                {c.popular && <Badge className="bg-emerald-600 text-white">Popular</Badge>}
              </div>
              <div className="mt-2 text-sm font-bold">{c.label}</div>
              <div className="mt-1 text-xs text-zinc-500">
                {c.scans > 0 && `${c.scans} scans`}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{sym}{c.priceNgn.toLocaleString()}</span>
                <ArrowRight size={15} className="text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-500" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Plan switcher */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Change Plan</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(PLANS) as PlanTier[]).map(p => {
            const pl = PLANS[p]
            const pr = planPrice(p, 'monthly')
            const active = user.plan === p
            return (
              <div key={p} className={`rounded-2xl border p-5 ${active ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-950'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-bold">{pl.name}</div>
                  {active && <Badge className="bg-emerald-500 text-white">Current</Badge>}
                </div>
                <div className="mt-2 text-2xl font-extrabold">{pr.ngn === 0 ? 'Free' : <>{sym}{pr.ngn.toLocaleString()}<span className="text-xs font-medium text-zinc-400">/mo</span></>}</div>
                <ul className="mt-3 space-y-1.5">
                  {pl.features.slice(0, 3).map(f => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"><Check size={12} weight="bold" className="shrink-0 text-emerald-500" /> {f}</li>
                  ))}
                </ul>
                {!active && (
                  <Button
                    variant={p === 'enterprise' ? 'default' : 'outline'}
                    className={`mt-4 w-full ${p === 'enterprise' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : ''}`}
                    onClick={() => onOpenCheckout('plan', p, 'monthly')}
                  >
                    {p === 'free' ? 'Downgrade' : p === 'pro' ? 'Upgrade' : 'Go Enterprise'}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Transactions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Receipt className="text-emerald-500" size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Transaction History</h3>
        </div>
        {user.transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <Receipt size={32} className="mx-auto text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-500">No transactions yet</p>
            <p className="text-xs text-zinc-400">Your receipts and invoices will appear here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 dark:bg-zinc-900">
                  <TableHead>Invoice</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Method</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...user.transactions].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(tx => (
                  <TableRow key={tx.id} className="dark:hover:bg-zinc-900/50">
                    <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm">{tx.description}</TableCell>
                    <TableCell className="hidden text-sm text-zinc-500 sm:table-cell">{fmtDate(tx.created_at)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="flex items-center gap-1.5 text-xs capitalize text-zinc-500">{methodIcon(tx.payment_method)} {tx.payment_method}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' : tx.status === 'pending' ? 'bg-amber-500/15 text-amber-600' : 'bg-red-500/15 text-red-600'}>{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold">{tx.currency === 'NGN' ? '₦' : '$'}{tx.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <button onClick={() => onDownloadInvoice(tx)} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-emerald-500/10 hover:text-emerald-600" title="Download invoice">
                        <DownloadSimple size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      <div className="mt-8 flex items-start gap-2 rounded-2xl border border-emerald-200/30 bg-emerald-500/5 p-4 text-xs text-zinc-500 dark:text-zinc-400">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-500" />
        <p>All payments are simulated for demo purposes. No real charges occur. Invoices are generated instantly and stored in your account wallet. Compliant with Nigerian data protection regulations (NDPR).</p>
      </div>
      <Separator className="mt-8" />
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
        <span className="flex items-center gap-1"><Calendar size={12} /> Member since {fmtDate(user.created_at)}</span>
        <span>CyberShield NG Billing Center</span>
      </div>
    </div>
  )
}