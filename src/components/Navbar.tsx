import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Bell, Sun, Moon, Globe, User, SignOut, Warning, Check, CaretDown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User as UserType, Alert as AlertType, Notification, SupportedLang } from '../types'
import { TRANSLATIONS } from '../constants'
import { SUPPORTED_LANGUAGES } from '../locales'

interface NavbarProps {
  user: UserType | null
  currentPage: string
  onNavigate: (page: string) => void
  lang: SupportedLang
  onLangChange: (lang: SupportedLang) => void
  darkMode: boolean
  onDarkToggle: () => void
  notifications: Notification[]
  activeAlerts: AlertType[]
  onLogout: () => void
  onMarkRead: (id: string) => void
  onOpenSecurity: () => void
  onClearNotifications: () => void
}

const NAV_ITEMS = [
  { id: 'scanner', labelKey: 'scanner', icon: ShieldCheck },
  { id: 'reports', labelKey: 'reports', icon: Warning },
  { id: 'academy', labelKey: 'academy', icon: Globe },
  { id: 'analytics', labelKey: 'analytics', icon: Globe },
]

export function Navbar({ user, currentPage, onNavigate, lang, onLangChange, darkMode, onDarkToggle, notifications, activeAlerts, onLogout, onMarkRead, onOpenSecurity, onClearNotifications }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const t = TRANSLATIONS[lang]
  const unreadCount = notifications.filter(n => !n.read).length
  const criticalAlert = activeAlerts.find(a => a.severity === 'critical' && a.active)
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === lang) ?? SUPPORTED_LANGUAGES[0]

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-200/20 bg-white/80 backdrop-blur-xl dark:bg-zinc-950/80">
      {criticalAlert && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-red-600 px-4 py-1.5 text-center text-xs font-medium text-white">
          <span className="inline-flex items-center gap-1">
            <Warning size={14} weight="fill" /> {criticalAlert.title}
          </span>
        </motion.div>
      )}
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-zinc-800">
            <div className="space-y-1">
              <div className="w-5 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded" />
              <div className="w-5 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded" />
              <div className="w-3 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded" />
            </div>
          </button>
          <ShieldCheck size={28} className="text-emerald-600 dark:text-emerald-400" weight="fill" />
          <span className="text-lg font-bold tracking-tight text-emerald-900 dark:text-emerald-100">{t.app_name}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <Button key={item.id} variant={currentPage === item.id ? 'secondary' : 'ghost'} size="sm"
              className={currentPage === item.id ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200' : ''}
              onClick={() => onNavigate(item.id)}>
              <item.icon size={16} className="mr-1.5" />
              {t[item.labelKey]}
            </Button>
          ))}
          {user?.is_admin && (
            <Button variant={currentPage === 'admin' ? 'secondary' : 'ghost'} size="sm"
              className={currentPage === 'admin' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200' : ''}
              onClick={() => onNavigate('admin')}>
              <User size={16} className="mr-1.5" />
              {t.admin}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Popover open={langOpen} onOpenChange={setLangOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium border-emerald-200/60 dark:border-zinc-700">
                <Globe size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">{currentLang.flag}</span>
                <span className="hidden md:inline">{currentLang.label}</span>
                <CaretDown size={12} weight="bold" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1.5" align="end">
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.profile === 'Profile' ? 'Language' : 'Harshe / Language'}
              </div>
              {SUPPORTED_LANGUAGES.map(l => (
                <button key={l.code}
                  onClick={() => { onLangChange(l.code); setLangOpen(false) }}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-emerald-50 dark:hover:bg-zinc-800 ${lang === l.code ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'text-foreground'}`}>
                  <span className="text-base">{l.flag}</span>
                  <span className="flex-1 text-left">{l.label}</span>
                  {lang === l.code && <Check size={14} weight="bold" className="text-emerald-600 dark:text-emerald-400" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" onClick={onDarkToggle} className="h-8 w-8">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell size={16} />
                {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white">{unreadCount}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-3 border-b">
                <span className="font-semibold text-sm">{t.notifications}</span>
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onClearNotifications}>Clear all</Button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
                ) : notifications.slice(0, 10).map(n => (
                  <div key={n.id} className={`p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 ${!n.read ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`} onClick={() => onMarkRead(n.id)}>
                    <p className="text-sm font-medium">{n.read ? '' : '• '}{new Date(n.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Security alert received</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs dark:bg-emerald-900 dark:text-emerald-200">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{user.name.split(' ')[0]}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="px-3 py-2">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-emerald-600 mt-1">{user.points} {t.points}</p>
                </div>
                <Separator className="my-1" />
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={() => { onOpenSecurity() }}>
                  <ShieldCheck size={14} className="mr-2" />Security
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={onLogout}>
                  <SignOut size={14} className="mr-2" />{t.logout}
                </Button>
              </PopoverContent>
            </Popover>
          ) : (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onNavigate('auth')}>
              {t.login}
            </Button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden border-t overflow-hidden">
            <div className="p-3 space-y-1">
              {[...NAV_ITEMS, ...(user?.is_admin ? [{ id: 'admin', labelKey: 'admin', icon: User }] : [])].map(item => (
                <Button key={item.id} variant={currentPage === item.id ? 'secondary' : 'ghost'} size="sm" className="w-full justify-start"
                  onClick={() => { onNavigate(item.id); setMobileOpen(false) }}>
                  <item.icon size={16} className="mr-2" />{t[item.labelKey]}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}