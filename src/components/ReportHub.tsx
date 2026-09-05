import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, MapPin, Clock, MagnifyingGlass, Plus, X, CaretDown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Report, User, SupportedLang } from '../types'
import { SCAM_TYPES, NIGERIAN_STATES, TRANSLATIONS } from '../constants'

interface ReportHubProps {
  user: User | null
  lang: SupportedLang
  reports: Report[]
  onSubmitReport: (report: Report) => void
  prefillContent?: { content: string; scamType: string } | null
  onClearPrefill: () => void
}

export function ReportHub({ user, lang, reports, onSubmitReport, prefillContent, onClearPrefill }: ReportHubProps) {
  const t = TRANSLATIONS[lang]
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterState, setFilterState] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', scam_type: '', location: '' })
  const [detailReport, setDetailReport] = useState<Report | null>(null)

  const openReportDialog = () => {
    if (prefillContent) {
      setForm({ title: '', description: prefillContent.content, scam_type: prefillContent.scamType, location: '' })
    } else {
      setForm({ title: '', description: '', scam_type: '', location: '' })
    }
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!user || !form.title.trim() || !form.description.trim() || !form.scam_type || !form.location) return
    const report: Report = {
      id: `rpt-${Date.now()}`, user_id: user.id, user_name: user.name,
      title: form.title, description: form.description, scam_type: form.scam_type,
      status: 'pending', location: form.location,
      reported_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }
    onSubmitReport(report)
    setDialogOpen(false)
    setForm({ title: '', description: '', scam_type: '', location: '' })
    onClearPrefill()
  }

  const filtered = reports.filter(r => {
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase()) && !r.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterType !== 'all' && r.scam_type !== filterType) return false
    if (filterState !== 'all' && r.location !== filterState) return false
    return true
  })

  const statusColor = (s: string) => {
    if (s === 'resolved') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    if (s === 'investigating') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (s === 'dismissed') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">{t.reports}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{lang === 'en' ? 'Community scam reports across Nigeria' : "Rahoton zamba na al'umma a Najeriya"}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) onClearPrefill() }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openReportDialog} disabled={!user}>
              <Plus size={14} className="mr-1.5" />{t.report_scam}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t.submit_report}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">{lang === 'en' ? 'Title' : 'Taken'}</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder={lang === 'en' ? 'Brief title of the scam' : 'Taken gajeren zamba'} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">{lang === 'en' ? 'Description' : 'Bayani'}</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder={lang === 'en' ? 'Describe what happened...' : 'Bayyari abin da ya faru...'} className="mt-1 min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{lang === 'en' ? 'Type' : "Nau'i"}</Label>
                  <Select value={form.scam_type} onValueChange={v => setForm({ ...form, scam_type: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={lang === 'en' ? 'Select' : 'Zaɓi'} /></SelectTrigger>
                    <SelectContent>{SCAM_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{lang === 'en' ? 'State' : 'Jihohi'}</Label>
                  <Select value={form.location} onValueChange={v => setForm({ ...form, location: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={lang === 'en' ? 'Select' : 'Zaɓi'} /></SelectTrigger>
                    <SelectContent>{NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}
                disabled={!form.title.trim() || !form.description.trim() || !form.scam_type || !form.location}>
                {t.submit_report}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={t.filter} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            {SCAM_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterState} onValueChange={setFilterState}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            {NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground text-sm">{t.no_results}</motion.p>
          ) : filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="cursor-pointer hover:shadow-sm transition-shadow border-emerald-100/50 dark:border-emerald-900/30" onClick={() => setDetailReport(r)}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{r.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                    </div>
                    <Badge className={`shrink-0 ${statusColor(r.status)}`}>{t[r.status]}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Flag size={12} />{r.scam_type}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} />{r.location}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(r.reported_at).toLocaleDateString()}</span>
                    <span className="ml-auto">{r.user_name}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={!!detailReport} onOpenChange={() => setDetailReport(null)}>
        <DialogContent className="max-w-md">
          {detailReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{detailReport.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">{detailReport.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline"><Flag size={12} className="mr-1" />{detailReport.scam_type}</Badge>
                  <Badge variant="outline"><MapPin size={12} className="mr-1" />{detailReport.location}</Badge>
                  <Badge className={statusColor(detailReport.status)}>{t[detailReport.status]}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Reported by {detailReport.user_name}</span>
                  <span>{new Date(detailReport.reported_at).toLocaleDateString()}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Separator() {
  return <div className="h-px bg-border" />
}