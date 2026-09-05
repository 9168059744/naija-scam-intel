import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldWarning, Users, Flag, ChartBar, ChartPie, Globe, ArrowUpRight } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Scan, Report, User, Certificate, SupportedLang } from '../types'
import { SCAM_TYPES, NIGERIAN_STATES, TRANSLATIONS } from '../constants'

interface AnalyticsProps {
  lang: SupportedLang
  scans: Scan[]
  reports: Report[]
  users: User[]
  certificates: Certificate[]
}

export function AnalyticsDashboard({ lang, scans, reports, users, certificates }: AnalyticsProps) {
  const t = TRANSLATIONS[lang]
  const [period, setPeriod] = useState('30')

  const stats = useMemo(() => {
    const highRisk = scans.filter(s => s.risk_score > 55).length
    const critical = scans.filter(s => s.risk_score > 75).length
    return {
      totalScans: scans.length,
      highRisk: highRisk + critical,
      totalReports: reports.length,
      totalUsers: users.length,
      certified: certificates.length,
      avgRisk: scans.length ? Math.round(scans.reduce((a, s) => a + s.risk_score, 0) / scans.length) : 0,
    }
  }, [scans, reports, users, certificates])

  const scamTypeData = useMemo(() => {
    const counts: Record<string, number> = {}
    scans.forEach(s => { counts[s.scam_type] = (counts[s.scam_type] || 0) + 1 })
    reports.forEach(r => { counts[r.scam_type] = (counts[r.scam_type] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [scans, reports])

  const stateData = useMemo(() => {
    const counts: Record<string, number> = {}
    reports.forEach(r => { counts[r.location] = (counts[r.location] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [reports])

  const riskDistribution = useMemo(() => {
    const levels = { safe: 0, low: 0, medium: 0, high: 0, critical: 0 }
    scans.forEach(s => { levels[s.risk_level]++ })
    return levels
  }, [scans])

  const maxScamCount = scamTypeData.length ? scamTypeData[0][1] : 1
  const maxStateCount = stateData.length ? stateData[0][1] : 1
  const totalRisk = Object.values(riskDistribution).reduce((a, b) => a + b, 0) || 1

  const riskColors: Record<string, string> = {
    safe: 'bg-emerald-500', low: 'bg-lime-500', medium: 'bg-yellow-500', high: 'bg-orange-500', critical: 'bg-red-500'
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">{t.analytics}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{lang === 'en' ? 'Threat intelligence dashboard' : 'Allon bayanan barazana'}</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t.total_scans, value: stats.totalScans, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: t.high_risk, value: stats.highRisk, icon: ShieldWarning, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
          { label: t.total_reports, value: stats.totalReports, icon: Flag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: t.certified, value: stats.certified, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-emerald-100/50 dark:border-emerald-900/30">
              <CardContent className="pt-4">
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className="mt-2 text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="threats" className="w-full">
        <TabsList>
          <TabsTrigger value="threats"><ChartBar size={14} className="mr-1.5" />{lang === 'en' ? 'Threat Types' : "Nau'ukan Barazana"}</TabsTrigger>
          <TabsTrigger value="geo"><Globe size={14} className="mr-1.5" />{lang === 'en' ? 'By Location' : 'Ta Wuri'}</TabsTrigger>
          <TabsTrigger value="risk"><ChartPie size={14} className="mr-1.5" />{lang === 'en' ? 'Risk Levels' : 'Matakan Haɗari'}</TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="mt-4">
          <Card className="border-emerald-100/50 dark:border-emerald-900/30">
            <CardHeader><CardTitle className="text-base">{lang === 'en' ? 'Top Scam Types Detected' : "Manyan Nau'ukan Zamba"}</CardTitle></CardHeader>
            <CardContent>
              {scamTypeData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{lang === 'en' ? 'No data yet. Run some scans!' : 'Babu bayanai tukuna.'}</p>
              ) : (
                <div className="space-y-3">
                  {scamTypeData.map(([type, count], i) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="w-32 sm:w-44 text-xs font-medium truncate">{type}</span>
                      <div className="flex-1 h-6 bg-muted/50 rounded-md overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-md flex items-center justify-end pr-2"
                          initial={{ width: 0 }} animate={{ width: `${(count / maxScamCount) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}>
                          <span className="text-[10px] font-bold text-white">{count}</span>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo" className="mt-4">
          <Card className="border-emerald-100/50 dark:border-emerald-900/30">
            <CardHeader><CardTitle className="text-base">{lang === 'en' ? 'Reports by State' : 'Rahotanni Ta Jihar'}</CardTitle></CardHeader>
            <CardContent>
              {stateData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{lang === 'en' ? 'No reports yet' : 'Babu rahotanni tukuna'}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stateData.map(([state, count], i) => (
                    <motion.div key={state} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between rounded-lg border p-3 border-emerald-100 dark:border-emerald-900/50">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-emerald-600" />
                        <span className="text-sm font-medium">{state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / maxStateCount) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold">{count}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <Card className="border-emerald-100/50 dark:border-emerald-900/30">
            <CardHeader><CardTitle className="text-base">{lang === 'en' ? 'Risk Level Distribution' : 'Rarraba Matakan Haɗari'}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex h-8 w-full rounded-full overflow-hidden mb-4">
                {Object.entries(riskDistribution).map(([level, count]) => (
                  count > 0 && (
                    <div key={level} className={`${riskColors[level]} flex items-center justify-center transition-all`}
                      style={{ width: `${(count / totalRisk) * 100}%` }}>
                      {count > 2 && <span className="text-[10px] font-bold text-white">{count}</span>}
                    </div>
                  )
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.entries(riskDistribution).map(([level, count]) => (
                  <div key={level} className="flex items-center gap-2 text-xs">
                    <div className={`h-3 w-3 rounded-full ${riskColors[level]}`} />
                    <span className="capitalize">{t[level]}</span>
                    <span className="font-bold ml-auto">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-emerald-100/50 dark:border-emerald-900/30">
        <CardHeader><CardTitle className="text-base">{lang === 'en' ? 'Recent Scans' : 'Binciken Kwanan Nan'}</CardTitle></CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{lang === 'en' ? 'No scans recorded yet' : 'Babu bincike tukuna'}</p>
          ) : (
            <div className="space-y-2">
              {scans.slice(-8).reverse().map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-2.5 text-sm border-emerald-100/50 dark:border-emerald-900/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge className={`text-[10px] ${s.risk_score > 55 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : s.risk_score > 30 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'}`}>
                      {s.risk_score}
                    </Badge>
                    <span className="truncate">{s.content.slice(0, 50)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">{s.scan_type}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}