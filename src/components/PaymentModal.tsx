import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, CreditCard, Bank, Lightning, Lock, CheckCircle, ArrowRight,
  CurrencyNgn, Receipt, Crown, ShieldCheck
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PLANS, CREDIT_PACKS, PAYMENT_METHODS, CURRENCY_SYMBOL, planPrice } from '../billing'
import { PlanTier, BillingCycle, PaymentMethod, CreditBundle } from '../types'

export interface CheckoutIntent {
  kind: 'plan' | 'credits'
  plan?: PlanTier
  cycle?: BillingCycle
  bundle?: CreditBundle
  originNote?: string
  defaultCurrency?: 'NGN' | 'USD'
}

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  intent: CheckoutIntent | null
  currentPlan: PlanTier
  onSuccess: (desc: string, amount: number, currency: 'NGN' | 'USD', method: PaymentMethod, plan: PlanTier, cycle: BillingCycle, bundle: CreditBundle | null) => void
  lang: string
}

const CARD_BRANDS: { test: RegExp; label: string }[] = [
  { test: /^4/, label: 'Visa' },
  { test: /^5[1-5]/, label: 'Mastercard' },
  { test: /^506|^650/, label: 'Verve' },
  { test: /^3[47]/, label: 'Amex' },
]

function detectBrand(num: string): string {
  const c = CARD_BRANDS.find(b => b.test.test(num))
  return c ? c.label : 'Card'
}

export function PaymentModal({ open, onClose, intent, currentPlan, onSuccess, lang }: PaymentModalProps) {
  const [mode, setMode] = useState<'plan' | 'credits'>(intent?.kind ?? 'plan')
  const [cycle, setCycle] = useState<BillingCycle>(intent?.cycle ?? 'monthly')
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(intent?.plan ?? (currentPlan === 'free' ? 'pro' : currentPlan))
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [cardNum, setCardNum] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [bundle, setBundle] = useState<CreditBundle | null>(null)
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [byobForm, setByobForm] = useState(false)
  const byob = false
  void byobForm; void byob

  const currency = useMemo<'NGN' | 'USD'>(() => intent?.defaultCurrency ?? 'NGN', [intent])
  const sym = CURRENCY_SYMBOL[currency]

  const price = selectedPlan === 'free'
    ? { ngn: 0, usd: 0 }
    : planPrice(selectedPlan, cycle)

  const amount = mode === 'plan'
    ? (currency === 'NGN' ? price.ngn : price.usd)
    : bundle ? (currency === 'NGN' ? bundle.priceNgn : bundle.priceUsd) : 0

  const brand = detectBrand(cardNum)

  const reset = () => { setStep('form'); setCardNum(''); setCardName(''); setCardExp(''); setCardCvv(''); setBundle(null) }

  const close = () => { reset(); onClose() }

  const handlePay = () => {
    if (amount <= 0) return
    setStep('processing')
    const no = `INV-CSNG-${Date.now().toString().slice(-6)}`
    setTimeout(() => {
      setInvoiceNo(no)
      setStep('success')
      const desc = mode === 'plan'
        ? `Upgrade to ${PLANS[selectedPlan].name} (${cycle === 'monthly' ? 'Monthly' : 'Yearly'})`
        : `Credit Pack — ${bundle?.label ?? ''}`
      onSuccess(desc, amount, currency, method, selectedPlan, cycle, bundle)
    }, 1800)
  }

  const cardReady = cardNum.replace(/\s/g, '').length >= 15 && cardName.trim().length > 2 && /^\d{2}\/\d{2}$/.test(cardExp) && cardCvv.length >= 3

  return (
    <AnimatePresence>
      {open && intent && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-emerald-200/20 bg-white shadow-2xl dark:bg-zinc-950"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={close} className="absolute right-4 top-4 z-10 rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close checkout">
              <X size={20} />
            </button>

            {step !== 'success' && (
              <div className="border-b border-emerald-200/20 bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-6 text-white">
                <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-emerald-200">
                  <ShieldCheck size={16} weight="fill" /> CyberShield NG Secure Checkout
                </div>
                <h2 className="text-2xl font-bold">
                  {intent.originNote && step === 'form'
                    ? intent.originNote
                    : mode === 'plan' ? 'Choose Your Plan' : 'Top-Up Credits'}
                </h2>
                <p className="mt-1 text-sm text-emerald-100/90">
                  {mode === 'plan'
                    ? 'Unlock unlimited deep scans, branded forensics & exports.'
                    : 'Purchase scan & export credits instantly — no subscription needed.'}
                </p>
              </div>
            )}

            {step === 'form' && (
              <div className="p-6">
                <div className="mb-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode('plan')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${mode === 'plan' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-800'}`}
                  >
                    <Crown size={16} /> Subscription
                  </button>
                  <button
                    onClick={() => setMode('credits')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${mode === 'credits' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-800'}`}
                  >
                    <Lightning size={16} /> Credit Packs
                  </button>
                </div>

                {mode === 'plan' ? (
                  <>
                    <div className="mb-4 flex items-center gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
                      <button onClick={() => setCycle('monthly')} className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition ${cycle === 'monthly' ? 'bg-white shadow dark:bg-zinc-700' : 'text-zinc-500'}`}>Monthly</button>
                      <button onClick={() => setCycle('yearly')} className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition ${cycle === 'yearly' ? 'bg-white shadow dark:bg-zinc-700' : 'text-zinc-500'}`}>
                        Yearly <Badge className="ml-1 bg-amber-500/90 text-[10px]">-17%</Badge>
                      </button>
                    </div>
                    <div className="mb-5 grid gap-3 sm:grid-cols-3">
                      {(Object.keys(PLANS) as PlanTier[]).map(p => {
                        const pl = PLANS[p]
                        const active = selectedPlan === p
                        const pr = planPrice(p, cycle)
                        return (
                          <button
                            key={p}
                            onClick={() => setSelectedPlan(p)}
                            className={`relative rounded-2xl border p-4 text-left transition ${active ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800'}`}
                          >
                            {pl.accent === 'amber' && (
                              <span className="absolute -top-2 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Best</span>
                            )}
                            <div className="text-sm font-bold">{pl.name}</div>
                            <div className="mt-2 text-2xl font-extrabold">
                              {pr.ngn === 0 ? 'Free' : <>{sym}{pr.ngn.toLocaleString()}</>}
                              {pr.ngn > 0 && <span className="text-xs font-medium text-zinc-400">/mo</span>}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{pl.tagline}</div>
                            {pl.accent === 'emerald' && active && (
                              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle size={12} weight="fill" /> Unlimited scans</div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    {CREDIT_PACKS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setBundle(bundle?.id === c.id ? null : c)}
                        className={`relative flex items-center justify-between rounded-2xl border p-4 text-left transition ${bundle?.id === c.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800'}`}
                      >
                        {c.popular && (
                          <span className="absolute -top-2 right-3 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Popular</span>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 text-sm font-bold"><Lightning size={14} className="text-emerald-500" weight="fill" /> {c.label}</div>
                          <div className="mt-0.5 text-xs text-zinc-500">
                            {c.scans > 0 && `${c.scans} forensic scan${c.scans > 1 ? 's' : ''}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-extrabold">{sym}{c.priceNgn.toLocaleString()}</div>
                          <div className="text-[10px] text-zinc-400">{c.priceUsd ? `$${c.priceUsd}` : ''}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Payment method */}
                <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Payment Method</Label>
                <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id as PaymentMethod)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition ${method === m.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-800'}`}
                    >
                      {m.id === 'card' ? <CreditCard size={18} /> : m.id === 'bank' ? <Bank size={18} /> : m.id === 'crypto' ? <Lightning size={18} /> : <CurrencyNgn size={18} />}
                      <span className="text-[11px] font-semibold leading-tight">{m.label}</span>
                    </button>
                  ))}
                </div>

                {method === 'card' ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="mb-1.5 block text-xs font-medium text-zinc-500">Card Number</Label>
                      <div className="relative">
                        <Input
                          value={cardNum} onChange={e => setCardNum(e.target.value.replace(/[^\d ]/g, '').slice(0, 19))}
                          placeholder="4242 4242 4242 4242" className="pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{cardNum.length > 0 ? brand : ''}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="mb-1.5 block text-xs font-medium text-zinc-500">Cardholder Name</Label>
                        <Input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="A. Okonkwo" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="mb-1.5 block text-xs font-medium text-zinc-500">Expiry</Label>
                          <Input
                            value={cardExp} onChange={e => {
                              let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
                              if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`
                              setCardExp(v)
                            }} placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <Label className="mb-1.5 block text-xs font-medium text-zinc-500">CVV</Label>
                          <Input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/[^\d]/g, '').slice(0, 4))} placeholder="123" type="password" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-emerald-300/60 bg-emerald-500/5 p-4 text-sm text-zinc-600 dark:text-zinc-300">
                    <div className="mb-1 flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                      <Bank size={16} /> {PAYMENT_METHODS.find(m => m.id === method)?.label} — {PAYMENT_METHODS.find(m => m.id === method)?.sub}
                    </div>
                    <p className="text-xs text-zinc-500">A one-time {sym}{amount.toLocaleString()} charge will be initiated. Your account activates instantly after confirmation.</p>
                  </div>
                )}

                <Separator className="my-5" />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-500">
                    <div className="font-semibold text-zinc-700 dark:text-zinc-200">
                      {mode === 'plan' ? PLANS[selectedPlan].name : bundle?.label ?? 'Select a pack'}
                    </div>
                    <div className="flex items-center gap-1 text-xs"><Lock size={12} /> Encrypted · PCI-DSS compliant</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{sym}{amount.toLocaleString()}</div>
                    {amount > 0 && <div className="text-[11px] text-zinc-400">{(currency === 'NGN' ? amount / 1300 : amount * 1300).toFixed(2)} {(currency === 'NGN' ? 'USD' : 'NGN')} est.</div>}
                  </div>
                </div>

                <Button
                  className="mt-4 w-full py-3 text-base font-bold"
                  size="lg"
                  disabled={!cardReady && method === 'card' ? true : amount <= 0}
                  onClick={handlePay}
                >
                  {amount === 0 ? 'Select an option' : `Pay ${sym}${amount.toLocaleString()} Securely`} <ArrowRight size={18} weight="bold" className="ml-1" />
                </Button>
              </div>
            )}

            {step === 'processing' && (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <motion.div
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-zinc-800 dark:border-t-emerald-400"
                >
                  <Lock size={22} className="text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-bold">Processing payment…</h3>
                <p className="mt-2 max-w-xs text-sm text-zinc-500">Contacting {method === 'card' ? 'your card network' : PAYMENT_METHODS.find(m => m.id === method)?.label}. Do not close this window.</p>
                <div className="mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <motion.div initial={{ width: '5%' }} animate={{ width: '100%' }} transition={{ duration: 1.7, ease: 'easeInOut' }} className="h-full rounded-full bg-emerald-500" />
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15"
                >
                  <CheckCircle size={44} weight="fill" className="text-emerald-500" />
                </motion.div>
                <h3 className="text-2xl font-extrabold">Payment Successful! 🎉</h3>
                <p className="mt-2 max-w-sm text-sm text-zinc-500">
                  {mode === 'plan'
                    ? <>Your <span className="font-bold text-emerald-600 dark:text-emerald-400">{PLANS[selectedPlan].name}</span> plan is now active. All premium features are unlocked.</>
                    : <>Your <span className="font-bold text-emerald-600 dark:text-emerald-400">{bundle?.label}</span> credits have been added to your wallet.</>}
                </p>
                <div className="mt-6 w-full max-w-sm rounded-2xl border border-dashed border-emerald-300/60 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"><Receipt size={14} /> Receipt</span>
                    <span>{new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-sm"><span className="text-zinc-500">Invoice</span><span className="font-mono font-semibold">{invoiceNo}</span></div>
                  <div className="mt-2 flex justify-between text-sm"><span className="text-zinc-500">Amount paid</span><span className="font-extrabold">{sym}{amount.toLocaleString()} {currency}</span></div>
                  <div className="mt-1 flex justify-between text-sm"><span className="text-zinc-500">Method</span><span className="capitalize">{method}</span></div>
                </div>
                <Button className="mt-6 px-8 py-3" onClick={close}>Done</Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}