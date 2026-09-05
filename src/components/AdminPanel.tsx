import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Flag, ShieldWarning, PaperPlaneRight, Trash, CheckCircle, XCircle, MagnifyingGlass, Megaphone } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Report, User, Alert, Scan, SupportedLang } from '../types'
import { TRANSLATIONS } from '../constants'

interface AdminPanelProps {
  lang: SupportedLang
  users: User[]
  reports: Report[]
  alerts: Alert[]
  scans: Scan[]
  onUpdateReportStatus: (id: string, status: Report['status']) => void
  onDeleteUser: (id: string) => void
  onToggleAdmin: (id: string) => void
  onBroadcast: (alert: Alert) => void
  onDeleteAlert: (id: string) => void
}

export function AdminPanel({ lang, users, reports, alerts, scans, onUpdateReportStatus, onDeleteUser, onToggleAdmin, onBroadcast, onDeleteAlert }: AdminPanelProps) {
  const t = TRANSLATIONS[lang]
  const [userSearch, setUserSearch] = useState('')
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', severity: 'warning' as Alert['severity'] })

  const pendingReports = reports.filter(r => r.status === 'pending')
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))

  const handleBroadcast = () => {
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return
    const alert: Alert = {
      id: `alert-${Date.now()}`, severity: broadcastForm.severity,
      title: broadcastForm.title, message: broadcastForm.message,
      created_at: new Date().toISOString(), active: true
    }
    onBroadcast(alert)
    setBroadcastForm({ title: '', message: '', severity: 'warning' })
  }

  const statusColor = (s: string) => {
    if (s === 'resolved') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    if (s === 'investigating') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (s === 'dismissed') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">{t.admin}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{lang === 'en' ? 'System administration & content moderation' : 'Gudanar da tsari da sahan abun ciki'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t.total_scans, value: scans.length, icon: ShieldWarning, color: 'text-emerald-600' },
          { label: t.total_reports, value: reports.length, icon: Flag, color: 'text-blue-600' },
          { label: t.manage_users, value: users.length, icon: Users, color: 'text-purple-600' },
          { label: 'Pending', value: pendingReports.length, icon: PaperPlaneRight, color: 'text-amber-600' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-emerald-100/50 dark:border-emerald-900/30">
              <CardContent className="pt-4 flex items-center gap-3">
                <s.icon size={20} className={s.color} />
                <div>
                  <p className="text-lg font-bold leading-none">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports"><Flag size={14} className="mr-1.5" />{t.moderate_reports}</TabsTrigger>
          <TabsTrigger value="users"><Users size={14} className="mr-1.5" />{t.manage_users}</TabsTrigger>
          <TabsTrigger value="broadcast"><Megaphone size={14} className="mr-1.5" />{t.broadcast}</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4 space-y-3">
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.no_results}</p>
          ) : reports.map(r => (
            <Card key={r.id} className="border-emerald-100/50 dark:border-emerald-900/30">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{r.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.user_name} - {r.location}</p>
                    <p className="text-xs mt-1 text-muted-foreground line-clamp-2">{r.description}</p>
                  </div>
                  <Badge className={statusColor(r.status)}>{t[r.status]}</Badge>
                </div>
                <Separator className="my-3" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300"
                    onClick={() => onUpdateReportStatus(r.id, 'investigating')}>
                    {lang === 'en' ? 'Investigate' : 'Bincika'}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300"
                    onClick={() => onUpdateReportStatus(r.id, 'resolved')}>
                    <CheckCircle size={12} className="mr-1" />{lang === 'en' ? 'Resolve' : 'Warware'}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                    onClick={() => onUpdateReportStatus(r.id, 'dismissed')}>
                    <XCircle size={12} className="mr-1" />{lang === 'en' ? 'Dismiss' : 'Ɗiye'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-3">
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t.search} value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-8" />
          </div>
          {filteredUsers.map(u => (
            <Card key={u.id} className="border-emerald-100/50 dark:border-emerald-900/30">
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{u.name} {u.is_admin && <Badge className="ml-1 text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Admin</Badge>}</p>
                  <p className="text-xs text-muted-foreground">{u.email} - {u.points} pts</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onToggleAdmin(u.id)}>
                    {u.is_admin ? 'Demote' : 'Promote'}
                  </Button>
                  {!u.is_admin && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:text-red-700" onClick={() => onDeleteUser(u.id)}>
                      <Trash size={12} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="broadcast" className="mt-4">
          <Card className="border-emerald-100/50 dark:border-emerald-900/30">
            <CardHeader><CardTitle className="text-base">{t.broadcast}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">{lang === 'en' ? 'Alert Title' : 'Taken Sanarwa'}</Label>
                <Input value={broadcastForm.title} onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder={lang === 'en' ? 'e.g. New Phishing Wave Detected' : 'Misali: Sabon Zamba An Gano'} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">{lang === 'en' ? 'Message' : 'Saƙo'}</Label>
                <Textarea value={broadcastForm.message} onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder={lang === 'en' ? 'Describe the threat and advise users...' : 'Bayyari barazana kuma ba da shawara...'} className="mt-1 min-h-[80px]" />
              </div>
              <div>
                <Label className="text-xs">{lang === 'en' ? 'Severity' : 'Matsayi'}</Label>
                <Select value={broadcastForm.severity} onValueChange={v => setBroadcastForm({ ...broadcastForm, severity: v as Alert['severity'] })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleBroadcast}
                disabled={!broadcastForm.title.trim() || !broadcastForm.message.trim()}>
                <PaperPlaneRight size={14} className="mr-1.5" />{lang === 'en' ? 'Send Broadcast' : 'Aika Sanarwa'}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold">{lang === 'en' ? 'Active Alerts' : 'Sanarwun Daima'}</h4>
            {alerts.filter(a => a.active).map(a => (
              <Card key={a.id} className={`border-l-4 ${a.severity === 'critical' ? 'border-l-red-500' : a.severity === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                <CardContent className="pt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.message.slice(0, 120)}...</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => onDeleteAlert(a.id)}>
                    <Trash size={14} />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {alerts.filter(a => a.active).length === 0 && (
              <p className="text-sm text-muted-foreground">{lang === 'en' ? 'No active alerts' : 'Babu sanarwa a halin yanzu'}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}