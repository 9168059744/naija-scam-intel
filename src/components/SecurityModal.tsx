import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Keyhole, EnvelopeSimple, DeviceMobile, Copy, Check, ArrowsClockwise, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { TRANSLATIONS } from '../constants'
import { SupportedLang } from '../types'

interface SecurityModalProps {
  open: boolean
  lang: SupportedLang
  name: string
  email: string
  mfaEnabled: boolean
  mfaMethod: 'email' | 'authenticator'
  backupCodes: string[]
  onClose: () => void
  onToggleMfa: (enabled: boolean) => void
  onMethodChange: (method: 'email' | 'authenticator') => void
  onRegenerateCodes: () => string[]
}

function genCodes(): string[] {
  const codes: string[] = []
  while (codes.length < 5) {
    const c = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
    if (!codes.includes(c)) codes.push(c)
  }
  return codes
}

export function SecurityModal({
  open, lang, name, email, mfaEnabled, mfaMethod, backupCodes,
  onClose, onToggleMfa, onMethodChange, onRegenerateCodes,
}: SecurityModalProps) {
  const t = TRANSLATIONS[lang]
  const [showCodes, setShowCodes] = useState(false)
  const [codes, setCodes] = useState<string[]>(backupCodes.length ? backupCodes : genCodes())
  const [copied, setCopied] = useState(false)

  const regenerate = () => {
    const next = onRegenerateCodes()
    setCodes(next.length ? next : genCodes())
    setShowCodes(true)
    setCopied(false)
  }

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(codes.join(', '))
    } catch {
      /* clipboard unavailable — still show copied state for demo */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.2 }}
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-emerald-200/60 bg-white p-6 shadow-xl dark:border-emerald-800/40 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <ShieldCheck size={22} weight="fill" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t.mfa_title}</h2>
                  <p className="text-xs text-muted-foreground">{name} · {email}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">{t.mfa_subtitle}</p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 p-3.5 dark:border-emerald-800/40">
                <div className="flex items-center gap-3">
                  <Keyhole size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium">{t.mfa_enabled_label}</p>
                    <p className="text-xs text-muted-foreground">{t.mfa_enabled_desc}</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={mfaEnabled}
                  onClick={() => {
                    onToggleMfa(!mfaEnabled)
                    if (!mfaEnabled) setShowCodes(true)
                  }}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${mfaEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${mfaEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {mfaEnabled && (
                <div className="rounded-xl border border-emerald-200/60 p-3.5 dark:border-emerald-800/40">
                  <Label className="text-xs">{t.mfa_method}</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onMethodChange('email')}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${mfaMethod === 'email' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'border-zinc-200 text-muted-foreground hover:border-emerald-300 dark:border-zinc-700'}`}
                    >
                      <EnvelopeSimple size={16} /> {t.mfa_email}
                    </button>
                    <button
                      onClick={() => onMethodChange('authenticator')}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${mfaMethod === 'authenticator' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'border-zinc-200 text-muted-foreground hover:border-emerald-300 dark:border-zinc-700'}`}
                    >
                      <DeviceMobile size={16} /> {t.mfa_authenticator}
                    </button>
                  </div>
                </div>
              )}

              {mfaEnabled && (
                <div className="rounded-xl border border-emerald-200/60 p-3.5 dark:border-emerald-800/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t.mfa_backup_codes}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.mfa_backup_desc}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => setShowCodes(!showCodes)}>
                      {showCodes ? <Copy size={13} /> : <Keyhole size={13} />}
                      {showCodes ? t.mfa_hide_codes : t.mfa_show_codes}
                    </Button>
                  </div>
                  <AnimatePresence>
                    {showCodes && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {codes.map((c, i) => (
                            <div key={c} className="flex items-center justify-center rounded-lg bg-zinc-100 px-2 py-2 font-mono text-sm font-semibold tracking-wider text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                              {c}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-8 flex-1 gap-1 text-xs" onClick={copyAll}>
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            {copied ? t.mfa_copied : t.mfa_show_codes}
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={regenerate}>
                            <ArrowsClockwise size={13} /> {t.mfa_regenerate}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <Separator className="my-4" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                2FA: {mfaEnabled ? t.mfa_on : t.mfa_off}
              </span>
              <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onClose}>
                {t.mfa_save}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}