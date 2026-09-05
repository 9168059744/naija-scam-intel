import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Lock, Envelope, IdentificationCard, Eye, EyeSlash, ArrowRight, Brain, Scan as ScanIcon, Globe } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Navbar } from './components/Navbar'
import { ScamScanner } from './components/ScamScanner'
import { LearningAcademy } from './components/LearningAcademy'
import { ReportHub } from './components/ReportHub'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { AdminPanel } from './components/AdminPanel'
import { OTPVerification } from './components/OTPVerification'
import { SecurityModal } from './components/SecurityModal'
import { PaymentModal } from './components/PaymentModal'
import { BillingDashboard } from './components/BillingDashboard'
import { User, Scan, Report, Alert, Notification, UserProgress, Certificate, SupportedLang, OtpPending, PlanTier, BillingCycle, Transaction, CreditBundle, PaymentMethod } from './types'
import { DEFAULT_USERS, DEFAULT_REPORTS, DEFAULT_ALERTS, TRANSLATIONS } from './constants'
import { toast } from 'sonner'
import { CheckoutIntent, CREDIT_PACKS } from './billing'

const DEMO_OTP = '123456'

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [lang, setLang] = useState<SupportedLang>('en')
  const [currentPage, setCurrentPage] = useState('scanner')
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [scans, setScans] = useState<Scan[]>([])
  const [reports, setReports] = useState<Report[]>(DEFAULT_REPORTS)
  const [alerts, setAlerts] = useState<Alert[]>(DEFAULT_ALERTS)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({})
  const [prefillReport, setPrefillReport] = useState<{ content: string; scamType: string } | null>(null)
  const [otpPending, setOtpPending] = useState<OtpPending | null>(null)
  const [securityOpen, setSecurityOpen] = useState(false)
  const [stepUpPending, setStepUpPending] = useState<{ id: string; action: () => void } | null>(null)
  const [billingOpen, setBillingOpen] = useState(false)
  const [checkoutIntent, setCheckoutIntent] = useState<CheckoutIntent | null>(null)
  const [paywallGate, setPaywallGate] = useState<string | null>(null) // 'scanner' or 'export'

  const t = TRANSLATIONS[lang]

  const getProgress = useCallback((): UserProgress => {
    if (!currentUser) return { lessons_completed: [], quiz_scores: {}, total_points: 0, current_lesson_id: null }
    return userProgress[currentUser.id] || { lessons_completed: [], quiz_scores: {}, total_points: 0, current_lesson_id: null }
  }, [currentUser, userProgress])

  const notifyOtp = (code: string) => {
    const t2 = TRANSLATIONS[lang]
    toast.custom(() => (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white p-3 shadow-lg dark:border-emerald-800 dark:bg-zinc-900">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
          <Envelope size={16} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t2.otp_sent_toast}</p>
          <p className="mt-0.5 font-mono text-sm font-bold tracking-[0.25em] text-emerald-600 dark:text-emerald-400">{code}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            handleOtpVerified()
          }}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-emerald-700"
        >
          {t2.otp_quick_fill}
        </button>
      </div>
    ), { duration: 8000 })
  }

  const handleLogin = (email: string, password: string): string | null => {
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) return t.auth_error
    if (user.mfa_enabled) {
      const code = generateOtp()
      setOtpPending({ purpose: 'login', email, password, pendingUser: user, currentOtp: code })
      notifyOtp(code)
      return null
    }
    setCurrentUser(user)
    setCurrentPage('scanner')
    return null
  }

  const handleRegister = (name: string, email: string, password: string): string | null => {
    if (users.find(u => u.email === email)) return t.email_exists
    const newUser: User = {
      id: `user-${Date.now()}`, name, email, password,
      is_admin: false, created_at: new Date().toISOString(), points: 0, certificates: [],
      mfa_enabled: true, mfa_method: 'email', backup_codes: [],
      plan: 'free', billing_cycle: 'monthly', credits: { scans: 2, exports: 1 },
      subscription_expires_at: null, transactions: []
    }
    const code = generateOtp()
    setOtpPending({ purpose: 'register', email, name, password, pendingUser: newUser, currentOtp: code })
    notifyOtp(code)
    return null
  }

  const handleLogout = () => { setCurrentUser(null); setCurrentPage('scanner'); setSecurityOpen(false) }

  const handleOtpCancel = () => {
    setOtpPending(null)
    return 'cancelled'
  }

  const handleOtpVerified = () => {
    const pending = otpPending
    if (!pending) return
    const t2 = TRANSLATIONS[lang]
    if (pending.purpose === 'register' && pending.pendingUser) {
      setUsers(prev => [...prev, pending.pendingUser!])
      setCurrentUser(pending.pendingUser!)
      toast(t2.otp_verified_toast)
    } else if (pending.purpose === 'login' && pending.pendingUser) {
      setCurrentUser(pending.pendingUser)
      toast(t2.otp_verified_toast)
    } else if (pending.purpose === 'stepup' && currentUser) {
      toast(t2.mfa_step_up_toast)
    }
    const step = stepUpPending
    setOtpPending(null)
    if (pending.purpose === 'stepup' && step) {
      setStepUpPending(null)
      step.action()
    } else {
      setCurrentPage('scanner')
    }
  }

  const handleRegenerateCodes = (): string[] => {
    const codes = Array.from({ length: 5 }, () => `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`)
    if (currentUser) {
      const updated = { ...currentUser, backup_codes: codes }
      setCurrentUser(updated)
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    }
    return codes
  }

  const handleToggleMfa = (enabled: boolean) => {
    if (!currentUser) return
    const updated = { ...currentUser, mfa_enabled: enabled }
    setCurrentUser(updated)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
  }

  const handleMethodChange = (method: 'email' | 'authenticator') => {
    if (!currentUser) return
    const updated = { ...currentUser, mfa_method: method }
    setCurrentUser(updated)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
  }

  const requireStepUp = (action: () => void) => {
    if (!currentUser?.mfa_enabled) { action(); return }
    setStepUpPending({ id: `step-${Date.now()}`, action })
    const code = generateOtp()
    setOtpPending({ purpose: 'stepup', email: currentUser.email, pendingUser: currentUser, currentOtp: code })
    notifyOtp(code)
  }

  const handleScanComplete = (scan: Scan) => {
    setScans(prev => [...prev, scan])
  }

  const handleExportToReport = (content: string, scamType: string) => {
    setPrefillReport({ content, scamType })
    setCurrentPage('reports')
  }

  const handleSubmitReport = (report: Report) => {
    setReports(prev => [report, ...prev])
    const notif: Notification = {
      id: `notif-${Date.now()}`, user_id: report.user_id, alert_id: 'report',
      read: false, created_at: new Date().toISOString()
    }
    setNotifications(prev => [notif, ...prev])
  }

  const handleUpdateReportStatus = (id: string, status: Report['status']) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r))
  }

  const handleDeleteUser = (id: string) => {
    requireStepUp(() => setUsers(prev => prev.filter(u => u.id !== id)))
  }

  const handleToggleAdmin = (id: string) => {
    requireStepUp(() => setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: !u.is_admin } : u)))
  }

  const handleBroadcast = (alert: Alert) => {
    requireStepUp(() => {
      setAlerts(prev => [alert, ...prev])
      setNotifications(prev => [
        { id: `notif-${Date.now()}`, user_id: 'all', alert_id: alert.id, read: false, created_at: new Date().toISOString() },
        ...prev
      ])
    })
  }

  const handleDeleteAlert = (id: string) => {
    requireStepUp(() => setAlerts(prev => prev.filter(a => a.id !== id)))
  }

  const handleAwardPoints = (points: number) => {
    if (!currentUser) return
    const updated = { ...currentUser, points: currentUser.points + points }
    setCurrentUser(updated)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
  }

  const handleIssueCertificate = (cert: Certificate) => {
    setCertificates(prev => [...prev, cert])
    if (currentUser) {
      const updated = { ...currentUser, certificates: [...currentUser.certificates, cert.certificate_id] }
      setCurrentUser(updated)
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    }
  }

  const handleUpdateProgress = (p: UserProgress) => {
    if (!currentUser) return
    setUserProgress(prev => ({ ...prev, [currentUser.id]: p }))
  }

  // ===== Commercial Billing Handlers =====
  const canScan = !currentUser || currentUser.plan === 'free' ? currentUser.credits.scans > 0 : true
  const canExport = !currentUser || currentUser.plan === 'free' ? currentUser.credits.exports > 0 : true

  const handleDeductScan = () => {
    if (!currentUser || currentUser.plan !== 'free') return
    const updated = { ...currentUser, credits: { ...currentUser.credits, scans: Math.max(0, currentUser.credits.scans - 1) } }
    setCurrentUser(updated)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
  }

  const handleDeductExport = () => {
    if (!currentUser || currentUser.plan !== 'free') return
    const updated = { ...currentUser, credits: { ...currentUser.credits, exports: Math.max(0, currentUser.credits.exports - 1) } }
    setCurrentUser(updated)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
  }

  const handlePaymentSuccess = (desc: string, amount: number, currency: 'NGN' | 'USD', method: PaymentMethod, plan: PlanTier, cycle: BillingCycle, bundle: CreditBundle | null) => {
    if (!currentUser) return
    let newCredits = { ...currentUser.credits }
    if (bundle && bundle.scans > 0) newCredits.scans += bundle.scans
    if (bundle && bundle.scans === 0) newCredits.exports += 30 // export packs give exports
    const updated: User = {
      ...currentUser,
      plan: plan !== 'free' ? plan : currentUser.plan,
      billing_cycle: cycle,
      credits: newCredits,
      subscription_expires_at: plan !== 'free' ? new Date(Date.now() + (cycle === 'yearly' ? 365 : 12) * 30 * 24 * 60 * 60 * 1000).toISOString() : currentUser.subscription_expires_at,
      transactions: [...currentUser.transactions, {
        id: `tx-${Date.now()}`,
        user_id: currentUser.id,
        description: desc,
        amount,
        currency,
        payment_method: method,
        status: 'completed',
        invoice_url: `/invoices/${Date.now()}`,
        created_at: new Date().toISOString(),
      }]
    }
    setCurrentUser(updated)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    toast.success('Payment successful! Your credits have been added.')
  }

  const handleOpenCheckout = (kind: 'plan' | 'credits', plan?: PlanTier, cycle?: BillingCycle, bundleId?: string) => {
    const bundle = bundleId ? CREDIT_PACKS.find(c => c.id === bundleId) ?? null : null
    setCheckoutIntent({ kind, plan, cycle, bundle, originNote: kind === 'plan' ? 'Upgrade Your Plan' : 'Top-Up Credits' })
    setBillingOpen(false) // close dashboard, open modal
  }

  const handleGateAction = (action: () => void) => {
    if (canScan && canExport) { action(); return }
    setPaywallGate('scanner')
  }

  const handleDeductExportFromApp = () => {
    if (!currentUser || currentUser.plan !== 'free') return
    const updated = { ...currentUser, credits: { ...currentUser.credits, exports: Math.max(0, currentUser.credits.exports - 1) } }
    setCurrentUser(updated)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
  }

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-[100dvh] bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
        <Navbar user={currentUser} currentPage={currentPage} onNavigate={setCurrentPage}
          lang={lang} onLangChange={setLang}
          darkMode={darkMode} onDarkToggle={() => setDarkMode(d => !d)}
          notifications={notifications} activeAlerts={alerts}
          onLogout={handleLogout} onMarkRead={handleMarkRead}
          onOpenSecurity={() => setSecurityOpen(true)}
          onClearNotifications={() => setNotifications([])}
          onOpenBilling={() => setBillingOpen(true)} />

        <main className="px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {currentPage === 'auth' && !currentUser ? (
                <AuthPage lang={lang} onLogin={handleLogin} onRegister={handleRegister} onNavigate={setCurrentPage} />
              ) : currentPage === 'scanner' ? (
                <ScamScanner user={currentUser} lang={lang} onScanComplete={handleScanComplete} onExportToReport={handleExportToReport} />
              ) : currentPage === 'reports' ? (
                <ReportHub user={currentUser} lang={lang} reports={reports} onSubmitReport={handleSubmitReport}
                  prefillContent={prefillReport} onClearPrefill={() => setPrefillReport(null)} />
              ) : currentPage === 'academy' ? (
                <LearningAcademy user={currentUser} lang={lang} progress={getProgress()}
                  onUpdateProgress={handleUpdateProgress} onAwardPoints={handleAwardPoints} onIssueCertificate={handleIssueCertificate} />
              ) : currentPage === 'analytics' ? (
                <AnalyticsDashboard lang={lang} scans={scans} reports={reports} users={users} certificates={certificates} />
              ) : currentPage === 'admin' && currentUser?.is_admin ? (
                <AdminPanel lang={lang} users={users} reports={reports} alerts={alerts} scans={scans}
                  onUpdateReportStatus={handleUpdateReportStatus} onDeleteUser={handleDeleteUser}
                  onToggleAdmin={handleToggleAdmin} onBroadcast={handleBroadcast} onDeleteAlert={handleDeleteAlert} />
              ) : !currentUser ? (
                <AuthPage lang={lang} onLogin={handleLogin} onRegister={handleRegister} onNavigate={setCurrentPage} />
              ) : (
                <ScamScanner user={currentUser} lang={lang} onScanComplete={handleScanComplete} onExportToReport={handleExportToReport} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-emerald-100 dark:border-emerald-900/30 py-8 text-center">
          <p className="text-xs text-muted-foreground">CyberShield NG - {t.tagline}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Protecting Nigerian & African digital citizens</p>
        </footer>

        <OTPVerification
          open={!!otpPending}
          lang={lang}
          purpose={otpPending?.purpose ?? 'login'}
          email={otpPending?.email ?? ''}
          activeOtp={otpPending?.currentOtp ?? DEMO_OTP}
          onCancel={handleOtpCancel}
          onVerify={handleOtpVerified}
          onResend={() => {
            const code = generateOtp()
            setOtpPending(prev => (prev ? { ...prev, currentOtp: code } : prev))
            notifyOtp(code)
          }}
        />

        <SecurityModal
          open={securityOpen && !!currentUser}
          lang={lang}
          name={currentUser?.name ?? ''}
          email={currentUser?.email ?? ''}
          mfaEnabled={currentUser?.mfa_enabled ?? false}
          mfaMethod={currentUser?.mfa_method ?? 'email'}
          backupCodes={currentUser?.backup_codes ?? []}
          onClose={() => setSecurityOpen(false)}
          onToggleMfa={handleToggleMfa}
          onMethodChange={handleMethodChange}
          onRegenerateCodes={handleRegenerateCodes}
        />
      </div>
    </div>
  )
}

function AuthPage({ lang, onLogin, onRegister, onNavigate }: { lang: SupportedLang; onLogin: (e: string, p: string) => string | null; onRegister: (n: string, e: string, p: string) => string | null; onNavigate: (p: string) => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const t = TRANSLATIONS[lang]

  const handleSubmit = () => {
    setError('')
    if (isLogin) {
      const err = onLogin(email, password)
      if (err) setError(err)
    } else {
      if (!name.trim()) { setError(t.name_required); return }
      const err = onRegister(name, email, password)
      if (err) setError(err)
    }
  }

  const handleDemo = () => {
    const err = onLogin('admin.cybershield.ng@gmail.com', 'admin123')
    if (err) setError(err)
  }

  return (
    <div className="mx-auto max-w-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 mb-4">
            <ShieldCheck size={32} className="text-emerald-700 dark:text-emerald-300" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{t.app_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
        </div>

        <Card className="border-emerald-200/50 dark:border-emerald-800/30">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">{isLogin ? t.login : t.register}</CardTitle>
            <CardDescription>{isLogin ? t.sign_in_account : t.create_account}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div>
                <Label className="text-xs">{t.full_name}</Label>
                <div className="relative mt-1">
                  <IdentificationCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={name} onChange={e => setName(e.target.value)} className="pl-9" placeholder="Chidi Okafor" />
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs">{t.email}</Label>
              <div className="relative mt-1">
                <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <Label className="text-xs">{t.password}</Label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="pl-9 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
              {isLogin ? t.login : t.register}
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
            <Separator />
            <Button variant="outline" className="w-full" onClick={handleDemo}>
              <Brain size={14} className="mr-1.5" />{t.demo_login} (admin.cybershield.ng@gmail.com)
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {isLogin ? (t.no_account) : (t.have_account)}
              <button className="ml-1 font-medium text-emerald-600 hover:underline" onClick={() => { setIsLogin(!isLogin); setError('') }}>
                {isLogin ? t.register : t.login}
              </button>
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: ScanIcon, label: t.ai_scanner },
            { icon: Globe, label: t.states_18 },
            { icon: ShieldCheck, label: t.free_forever },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-emerald-100 p-3 dark:border-emerald-900/30">
                <f.icon size={18} className="text-emerald-600" />
                <span className="text-[10px] font-medium text-muted-foreground">{f.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default App