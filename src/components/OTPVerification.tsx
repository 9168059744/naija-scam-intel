import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ShieldCheck,
  LockKey,
  Timer,
  ArrowClockwise,
  ClipboardText,
  WarningCircle,
  Envelope,
  Copy,
  Check,
  PaperPlaneTilt,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { TRANSLATIONS } from '../constants'
import type { SupportedLang } from '../types'

export type OTPPurpose = 'login' | 'register' | 'stepup'

const DEMO_OTP = '123456'
const RESEND_SECONDS = 30

interface OTPVerificationProps {
  open: boolean
  lang: SupportedLang
  purpose: OTPPurpose
  email: string
  activeOtp?: string
  onCancel: () => void
  onVerify: () => void
  onResend?: () => void
}

export function OTPVerification({ open, lang, purpose, email, activeOtp = DEMO_OTP, onCancel, onVerify, onResend }: OTPVerificationProps) {
  const t = TRANSLATIONS[lang]
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const focusIndex = useCallback((idx: number) => {
    const el = inputsRef.current[Math.min(Math.max(idx, 0), 5)]
    if (el) {
      el.focus()
      el.select()
    }
  }, [])

  const resetAll = useCallback(() => {
    setDigits(Array(6).fill(''))
    setError(false)
    setErrorMsg('')
    setIsVerifying(false)
    setCopied(false)
    setCountdown(RESEND_SECONDS)
  }, [])

  // Reset + start resend countdown whenever the modal opens (or code is resent)
  useEffect(() => {
    if (open) resetAll()
  }, [open, resetAll])

  useEffect(() => {
    if (open && countdown > 0) {
      const id = window.setInterval(() => setCountdown(c => c - 1), 1000)
      return () => window.clearInterval(id)
    }
  }, [open, countdown > 0, countdown])

  // Focus the first empty slot whenever the modal opens
  useEffect(() => {
    if (open) {
      const firstEmpty = digits.findIndex(d => d === '')
      focusIndex(firstEmpty === -1 ? 5 : firstEmpty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleChange = (idx: number, value: string) => {
    if (error) {
      setError(false)
      setErrorMsg('')
    }
    const cleaned = value.replace(/\D/g, '')
    if (!cleaned) {
      setDigits(prev => {
        const next = [...prev]
        next[idx] = ''
        return next
      })
      return
    }
    const next = [...digits]
    let cursor = idx
    for (const char of cleaned) {
      if (cursor > 5) break
      next[cursor] = char
      cursor += 1
    }
    setDigits(next)
    focusIndex(cursor)
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[idx]) {
        setDigits(prev => {
          const next = [...prev]
          next[idx] = ''
          return next
        })
        focusIndex(idx)
      } else if (idx > 0) {
        setDigits(prev => {
          const next = [...prev]
          next[idx - 1] = ''
          return next
        })
        focusIndex(idx - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusIndex(idx - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusIndex(idx + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      setDigits(pasted.split(''))
      focusIndex(Math.min(pasted.length, 5))
    }
  }

  const handleFill = useCallback((code: string) => {
    const padded = (code || '').replace(/\D/g, '').slice(0, 6)
    setDigits(padded ? padded.padEnd(6, '').split('') : Array(6).fill(''))
    setError(false)
    setErrorMsg('')
    focusIndex(Math.min(padded.length, 5))
  }, [focusIndex])

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const handleSubmit = () => {
    const code = digits.join('')
    if (code.length !== 6) {
      setError(true)
      setErrorMsg(t.otp_invalid)
      return
    }
    if (code !== activeOtp) {
      setError(true)
      setErrorMsg(t.otp_invalid)
      return
    }
    setIsVerifying(true)
    window.setTimeout(onVerify, 450)
  }

  const handleFillAndVerify = () => {
    handleFill(activeOtp)
    setIsVerifying(true)
    window.setTimeout(onVerify, 450)
  }

  const handleResend = () => {
    setCountdown(RESEND_SECONDS)
    setDigits(Array(6).fill(''))
    setError(false)
    setErrorMsg('')
    if (onResend) onResend()
    else setCountdown(RESEND_SECONDS)
    setTimeout(() => focusIndex(0), 50)
  }

  const isSubmittable = digits.join('').length === 6 && digits.join('') === activeOtp

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
          onClick={onCancel}
          aria-hidden="true"
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t.mfa_required_title}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl dark:border-emerald-900/40 dark:bg-zinc-900"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 pb-10 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                {purpose === 'stepup' ? <LockKey size={22} weight="bold" /> : <ShieldCheck size={22} weight="bold" />}
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">{t.mfa_required_title}</h2>
                <p className="text-xs text-emerald-50/90">{purpose === 'stepup' ? t.mfa_required_desc : t.otp_title}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Envelope size={15} weight="bold" className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">
                {t.otp_subtitle} <span className="font-semibold text-zinc-900 dark:text-zinc-100">{email}</span>
              </span>
            </div>

            {/* Simulated inbox delivery banner */}
            <motion.div
              layout
              className="mb-5 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40"
            >
              <div className="flex items-center gap-1.5 border-b border-emerald-200/70 px-3 py-1.5 dark:border-emerald-800/60">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  {t.otp_received_banner}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">ScamGuard Security</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                    <Envelope size={11} weight="bold" />
                    <span className="truncate">{t.otp_code_is}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1 font-mono text-sm font-bold tracking-[0.25em] text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                    {activeOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeOtp)}
                    aria-label="Copy code"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300 bg-white text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-800"
                  >
                    {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillAndVerify}
                className="flex w-full items-center justify-center gap-1.5 bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <PaperPlaneTilt size={13} weight="bold" />
                {t.otp_quick_fill} ({activeOtp})
              </button>
            </motion.div>

            {/* OTP slots */}
            <motion.div
              className="flex justify-center gap-2 sm:gap-3"
              animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              aria-label={t.otp_label}
            >
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputsRef.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={6}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  aria-label={`${t.otp_label} ${i + 1}`}
                  className={`h-12 w-11 rounded-lg border-2 text-center text-lg font-bold tracking-widest text-zinc-900 outline-none transition-colors dark:text-zinc-100 sm:h-14 sm:w-12
                    ${error
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400/30 dark:border-red-500 dark:bg-red-950/30'
                      : 'border-zinc-200 bg-zinc-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800'}`}
                />
              ))}
            </motion.div>

            {error && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-red-500 dark:text-red-400">
                <WarningCircle size={16} weight="bold" />
                {errorMsg}
              </div>
            )}

            {/* Quick paste-from-inbox chip */}
            <button
              type="button"
              onClick={() => handleFill(activeOtp)}
              className="mx-auto mt-4 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-[0.98] dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
            >
              <ClipboardText size={14} weight="bold" />
              {t.otp_demo_hint} ({activeOtp})
            </button>

            <Button
              size="lg"
              className="mt-5 w-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 disabled:opacity-50"
              disabled={!isSubmittable || isVerifying}
              onClick={handleSubmit}
            >
              {isVerifying ? t.otp_resend : t.otp_verify}
            </Button>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              {countdown > 0 ? (
                <button
                  type="button"
                  disabled
                  className="flex cursor-not-allowed items-center gap-1.5 opacity-60"
                >
                  <Timer size={14} weight="bold" />
                  {t.otp_resend} {t.otp_in} {countdown}s
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="flex items-center gap-1.5 font-semibold text-emerald-600 transition-all hover:text-emerald-700 active:scale-[0.98] dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  <ArrowClockwise size={14} weight="bold" />
                  {t.otp_resend}
                </button>
              )}

              <button
                type="button"
                onClick={onCancel}
                className="font-medium text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {t.otp_back}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}