import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, CreditCard, CurrencyBtc, Bank, Copy, Download, X, Lightning, Coins, Star, ShieldCheck } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { PlanTier, PaymentMethod, PricingPlan, CreditBundle, Invoice } from '../types'
import { PRICING_PLANS, CREDIT_BUNDLES, PAYMENT_GATEWAYS } from '../constants'
import { toast } from 'sonner'

interface PricingPaywallModalProps {
  open: boolean
  onClose: () => void
  onSelectPlan: (tier: PlanTier) => void
  onPurchaseCredits: (scans: number) => void
}

type Gateway = PaymentMethod
type Tab = 'plans' | 'credits'

export function PricingPaywallModal({ open, onClose, onSelectPlan, onPurchaseCredits }: PricingPaywallModalProps) {
  const [tab, setTab] = useState<Tab>('plans')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)
  const [gateway, setGateway] = useState<Gateway>('card')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const handlePayment = useCallback(() => {
    if (tab === 'plans' && !selectedPlan) {
      toast.error('Please select a plan')
      return
    }
    if (tab === 'credits' && !selectedBundle) {
      toast.error('Please select a credit bundle')
      return
    }
    if (gateway === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        toast.error('Please fill in all card details')
        return
      }
    }

    setProcessing(true)

    setTimeout(() => {
      const isNgn = true
      let amount = 0
      let description = ''
      let planId: string | undefined

      if (tab === 'plans') {
        const plan = PRICING_PLANS.find(p => p.id === selectedPlan)
        if (!plan) return
        planId = plan.id
        amount = billingCycle === 'monthly' ? (isNgn ? plan.priceNgnMonthly : plan.priceMonthly) : (isNgn ? plan.priceNgnYearly : plan.priceYearly)
        description = `${plan.name} - ${billingCycle} subscription`
        onSelectPlan(plan.id as PlanTier)
      } else {
        const bundle = CREDIT_BUNDLES.find(b => b.id === selectedBundle)
        if (!bundle) return
        amount = isNgn ? bundle.priceNgn : bundle.priceUsd
        description = `${bundle.label} credit pack`
        onPurchaseCredits(bundle.scans)
      }

      const inv: Invoice = {
        id: `inv-${Date.now()}`,
        description,
        amount,
        currency: isNgn ? 'NGN' : 'USD',
        paymentMethod: gateway,
        planId,
        createdAt: new Date().toISOString(),
      }
      setInvoice(inv)
      setSuccess(true)
      setProcessing(false)
      toast.success('Payment successful! Credits activated.')
    }, 2000)
  }, [tab, selectedPlan, selectedBundle, gateway, cardNumber, cardExpiry, cardCvv, cardName, billingCycle, onSelectPlan, onPurchaseCredits])

  const downloadInvoice = () => {
    if (!invoice) return
    const content = `
INVOICE
${'='.repeat(40)}
Invoice ID: ${invoice.id}
Description: ${invoice.description}
Amount: ${invoice.currency} ${invoice.amount.toFixed(2)}
Payment Method: ${invoice.paymentMethod}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
${'='.repeat(40)}
Thank you for your purchase!
    `.trim()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\D/g, '').slice(0, 16)
    return v.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val: string) => {
    const v = val.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2)
    return v
  }

  if (success && invoice) {
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) { setSuccess(false); onClose(); } }}>
        <DialogContent className="sm:max-w-md">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <DialogHeader>
              <DialogTitle className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50"
                >
                  <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" weight="fill" />
                </motion.div>
                Payment Successful!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">{invoice.description}</p>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30">
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {invoice.currency} {invoice.amount.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Paid via {invoice.paymentMethod.charAt(0).toUpperCase() + invoice.paymentMethod.slice(1)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={downloadInvoice}>
                  <Download size={14} className="mr-1.5" /> Download Invoice
                </Button>
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { setSuccess(false); onClose(); }}>
                  Continue Scanning
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            Upgrade Your Plan
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setTab('plans')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === 'plans' ? 'bg-white shadow-sm dark:bg-zinc-700' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Plans
          </button>
          <button
            onClick={() => setTab('credits')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === 'credits' ? 'bg-white shadow-sm dark:bg-zinc-700' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Credit Packs
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'plans' ? (
            <motion.div key="plans" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Billing Toggle */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium">Billing Cycle</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${billingCycle === 'monthly' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Monthly</span>
                  <button
                    onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ${billingCycle === 'yearly' ? 'left-[26px]' : 'left-0.5'}`}
                    />
                  </button>
                  <span className={`text-xs ${billingCycle === 'yearly' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Yearly</span>
                </div>
              </div>

              {/* Plans */}
              <div className="space-y-3">
                {PRICING_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${selectedPlan === plan.id ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-400 dark:bg-emerald-950/30' : 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{plan.name}</h3>
                          {plan.badge && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] dark:bg-emerald-900 dark:text-emerald-300">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{plan.description}</p>
                      </div>
                      <RadioGroup value={selectedPlan ?? ''} onValueChange={setSelectedPlan}>
                        <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} className="sr-only peer" />
                        <Label htmlFor={`plan-${plan.id}`} className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/20">
                          {selectedPlan === plan.id && <CheckCircle size={12} className="text-white" weight="fill" />}
                        </Label>
                      </RadioGroup>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {billingCycle === 'monthly' ? (plan.priceNgnMonthly >= 1000 ? `N${plan.priceNgnMonthly.toLocaleString()}` : `$${plan.priceMonthly}`) : (plan.priceNgnYearly >= 1000 ? `N${plan.priceNgnYearly.toLocaleString()}` : `$${plan.priceYearly}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <Separator className="my-3" />
                    <ul className="space-y-1.5">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="credits" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-3">
                {CREDIT_BUNDLES.map((bundle) => (
                  <button
                    key={bundle.id}
                    onClick={() => setSelectedBundle(bundle.id)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all relative ${selectedBundle === bundle.id ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-400 dark:bg-emerald-950/30' : 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                  >
                    {'popular' in bundle && bundle.popular && (
                      <Badge className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px]">Popular</Badge>
                    )}
                    {'savings' in bundle && bundle.savings && (
                      <Badge className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[10px]">{bundle.savings}</Badge>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins size={20} className="text-emerald-600" />
                        <div>
                          <h3 className="font-semibold">{bundle.label}</h3>
                          <p className="text-xs text-muted-foreground">{bundle.scans} scans</p>
                        </div>
                      </div>
                      <RadioGroup value={selectedBundle ?? ''} onValueChange={setSelectedBundle}>
                        <RadioGroupItem value={bundle.id} id={`bundle-${bundle.id}`} className="sr-only peer" />
                        <Label htmlFor={`bundle-${bundle.id}`} className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/20">
                          {selectedBundle === bundle.id && <CheckCircle size={12} className="text-white" weight="fill" />}
                        </Label>
                      </RadioGroup>
                    </div>
                    <p className="mt-2 text-lg font-bold">
                      N{bundle.priceNgn.toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Gateway Selection */}
        {!success && (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment Method</p>
              <RadioGroup value={gateway} onValueChange={(v) => setGateway(v as Gateway)}>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'card' as const, label: 'Card', icon: CreditCard },
                    { id: 'paystack' as const, label: 'Paystack', icon: Lightning },
                    { id: 'flutterwave' as const, label: 'Flutterwave', icon: Lightning },
                    { id: 'crypto' as const, label: 'Crypto', icon: CurrencyBtc },
                    { id: 'bank' as const, label: 'Bank', icon: Bank },
                  ].map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setGateway(gw.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-all ${gateway === gw.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-300'}`}
                    >
                      <gw.icon size={18} />
                      {gw.label}
                    </button>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Card Details Form */}
            {gateway === 'card' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                <div>
                  <Label className="text-xs">Cardholder Name</Label>
                  <Input placeholder="Chidi Okafor" value={cardName} onChange={(e) => setCardName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Card Number</Label>
                  <div className="relative mt-1">
                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="pl-9 font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Expiry</Label>
                    <Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} className="mt-1 font-mono" />
                  </div>
                  <div>
                    <Label className="text-xs">CVV</Label>
                    <Input placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} className="mt-1 font-mono" maxLength={4} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Gateway Info */}
            {gateway !== 'card' && (
              <div className="rounded-lg border border-dashed border-zinc-300 p-3 text-center dark:border-zinc-600">
                <p className="text-xs text-muted-foreground">
                  {gateway === 'paystack' && 'You will be redirected to Paystack checkout'}
                  {gateway === 'flutterwave' && 'You will be redirected to Flutterwave checkout'}
                  {gateway === 'crypto' && 'Send USDT to the wallet address shown after confirmation'}
                  {gateway === 'bank' && 'Bank transfer details will be displayed'}
                </p>
              </div>
            )}

            <Separator />

            {/* Total & Submit */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">
                  {tab === 'plans'
                    ? (() => {
                        const plan = PRICING_PLANS.find(p => p.id === selectedPlan)
                        if (!plan) return 'N0'
                        return billingCycle === 'monthly' ? `N${plan.priceNgnMonthly.toLocaleString()}` : `N${plan.priceNgnYearly.toLocaleString()}`
                      })()
                    : (() => {
                        const bundle = CREDIT_BUNDLES.find(b => b.id === selectedBundle)
                        return bundle ? `N${bundle.priceNgn.toLocaleString()}` : 'N0'
                      })()
                  }
                </p>
              </div>
              <Button
                disabled={processing || (tab === 'plans' ? !selectedPlan : !selectedBundle) || (gateway === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardName))}
                className="min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
                onClick={handlePayment}
              >
                {processing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Lightning size={16} className="mr-1.5" /> Processing...
                  </motion.div>
                ) : (
                  <>Pay Now <Star size={14} className="ml-1.5" weight="fill" /></>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}