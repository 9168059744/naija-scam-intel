import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Link, Image, ShieldCheck, ShieldWarning, XCircle, CheckCircle, Upload, ArrowRight, CloudArrowUp, ArrowsClockwise, Scan, PlusCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Scan as ScanType, User, SupportedLang } from '../types'
import { analyzeText, analyzeUrl, getRiskLevel, TRANSLATIONS, SCAM_SAMPLES } from '../constants'
import { tr } from '../locales'

interface ScamScannerProps {
  user: User | null
  lang: SupportedLang
  onScanComplete: (scan: ScanType) => void
  onExportToReport: (content: string, scamType: string) => void
}

interface ScanResult {
  score: number
  flags: string[]
  scamType: string
  explanation: string
}

const isImageFile = (name: string) => /\.(png|jpe?g|gif|webp|bmp)$/i.test(name)

export function ScamScanner({ user, lang, onScanComplete, onExportToReport }: ScamScannerProps) {
  const t = TRANSLATIONS[lang]
  const [activeTab, setActiveTab] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageName, setImageName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [ocrText, setOcrText] = useState('')
  const [scanningImage, setScanningImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextScan = () => {
    if (!textInput.trim()) return
    setScanning(true)
    setTimeout(() => {
      const analysis = analyzeText(textInput)
      setResult(analysis)
      setScanning(false)
      if (user) {
        const scan: ScanType = {
          id: `scan-${Date.now()}`, user_id: user.id, scan_type: 'text',
          content: textInput.slice(0, 200), risk_score: analysis.score,
          risk_level: getRiskLevel(analysis.score), scam_type: analysis.scamType,
          explanation: analysis.explanation, flags: analysis.flags,
          created_at: new Date().toISOString()
        }
        onScanComplete(scan)
      }
    }, 1500)
  }

  const handleUrlScan = () => {
    if (!urlInput.trim()) return
    setScanning(true)
    setTimeout(() => {
      const analysis = analyzeUrl(urlInput)
      setResult(analysis)
      setScanning(false)
      if (user) {
        const scan: ScanType = {
          id: `scan-${Date.now()}`, user_id: user.id, scan_type: 'url',
          content: urlInput, risk_score: analysis.score,
          risk_level: getRiskLevel(analysis.score), scam_type: analysis.scamType,
          explanation: analysis.explanation, flags: analysis.flags,
          created_at: new Date().toISOString()
        }
        onScanComplete(scan)
      }
    }, 1200)
  }

  const runOcrPipeline = (preview: string, name: string, presetOcr?: string) => {
    setImagePreview(preview)
    setImageName(name)
    setResult(null)
    setOcrText('')
    setScanningImage(true)
    setTimeout(() => {
      const extracted = presetOcr && presetOcr.length > 0 ? presetOcr : (name || 'Screenshot').replace(/\.[^/.]+$/, '')
      setOcrText(extracted)
      const analysis = analyzeText(extracted)
      setResult(analysis)
      setScanningImage(false)
      if (user) {
        const scan: ScanType = {
          id: `scan-${Date.now()}`, user_id: user.id, scan_type: 'image',
          content: `${name} | ${extracted.slice(0, 200)}`, risk_score: analysis.score,
          risk_level: getRiskLevel(analysis.score), scam_type: analysis.scamType,
          explanation: `${tr(lang, 'Extracted text: ', 'Rubutun da aka ciro: ', 'Text wey dem cuz out: ', 'Ọrọ ti a fa jade: ', 'Ederede ewepụtara: ', 'Texte extrait : ')} "${extracted.slice(0, 120)}..." ${analysis.explanation}`,
          flags: analysis.flags, created_at: new Date().toISOString()
        }
        onScanComplete(scan)
      }
    }, 2200)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!isImageFile(file.name)) return
      const reader = new FileReader()
      reader.onload = (ev) => runOcrPipeline(ev.target?.result as string, file.name)
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (!isImageFile(file.name)) return
      const reader = new FileReader()
      reader.onload = (ev) => runOcrPipeline(ev.target?.result as string, file.name)
      reader.readAsDataURL(file)
    }
  }

  const handleSample = (sampleId: string) => {
    const sample = SCAM_SAMPLES.find(s => s.id === sampleId)
    if (!sample) return
    runOcrPipeline(sample.imageUrl, sample.label, sample.ocrText)
  }

  const clearImage = () => {
    setImagePreview(null)
    setImageName('')
    setOcrText('')
    setResult(null)
    setScanningImage(false)
  }

  const reanalyzeOcr = () => {
    if (!ocrText.trim()) return
    setScanningImage(true)
    setTimeout(() => {
      const analysis = analyzeText(ocrText)
      setResult(analysis)
      setScanningImage(false)
      if (user) {
        const scan: ScanType = {
          id: `scan-${Date.now()}`, user_id: user.id, scan_type: 'image',
          content: `${imageName} | ${ocrText.slice(0, 200)}`, risk_score: analysis.score,
          risk_level: getRiskLevel(analysis.score), scam_type: analysis.scamType,
          explanation: `${tr(lang, 'Extracted text: ', 'Rubutun da aka ciro: ', 'Text wey dem cuz out: ', 'Ọrọ ti a fa jade: ', 'Ederede ewepụtara: ', 'Texte extrait : ')} "${ocrText.slice(0, 120)}..." ${analysis.explanation}`,
          flags: analysis.flags, created_at: new Date().toISOString()
        }
        onScanComplete(scan)
      }
    }, 900)
  }

  const riskColor = (score: number) => {
    if (score <= 10) return 'text-emerald-600'
    if (score <= 30) return 'text-yellow-600'
    if (score <= 55) return 'text-orange-500'
    if (score <= 75) return 'text-red-500'
    return 'text-red-700'
  }

  const riskBg = (score: number) => {
    if (score <= 10) return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
    if (score <= 30) return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
    if (score <= 55) return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
    return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">{t.scanner}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.tagline}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setResult(null) }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text"><FileText size={14} className="mr-1.5" />{t.scan_text}</TabsTrigger>
          <TabsTrigger value="url"><Link size={14} className="mr-1.5" />{t.scan_url}</TabsTrigger>
          <TabsTrigger value="image"><Image size={14} className="mr-1.5" />{t.scan_image}</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <Card className="border-emerald-200/50 dark:border-emerald-800/30">
            <CardContent className="pt-6">
              <Textarea placeholder={tr(lang, 'Paste SMS, WhatsApp message, or email text here...', 'Manna saƙon SMS, WhatsApp, ko imel a nan...', 'Paste SMS, WhatsApp message, or email text here...', 'Fi SMS, WhatsApp, tabi imeeli si ibi...', 'Tapịa SMS, WhatsApp, ma ọ bụ email ebe a...', 'Collez le texte SMS, WhatsApp ou e-mail ici...')}
                value={textInput} onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[120px] resize-none font-mono text-sm" />
              <Button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleTextScan} disabled={scanning || !textInput.trim()}>
                {scanning ? tr(lang, 'Analyzing...', 'Ana bincike...', 'De dey analyze...', 'Ṣe ayẹwo...', 'Na-enyocha...', 'Analyse en cours...') : t.analyze}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <Card className="border-emerald-200/50 dark:border-emerald-800/30">
            <CardContent className="pt-6">
              <Input placeholder={tr(lang, "Paste suspicious URL here (e.g. http://196.168.1.1/gtbank-verify)", "Manna hanyar yanar gizo a nan...", "Paste suspicious URL here (e.g. http://196.168.1.1/gtbank-verify)", "Fi URL ti o ti nsewu si ibi (fun apẹẹrẹ http://196.168.1.1/gtbank-verify)", "Tapịa URL enyo ebe a (dịka http://196.168.1.1/gtbank-verify)", "Collez l'URL suspecte ici (ex. http://196.168.1.1/gtbank-verify)")}
                value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                className="font-mono text-sm" />
              <Button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleUrlScan} disabled={scanning || !urlInput.trim()}>
                {scanning ? tr(lang, 'Scanning...', 'Ana bincike...', 'De dey scan...', 'Ṣe ayẹwo...', 'Na-enyocha...', 'Analyse en cours...') : t.analyze}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <Card className="border-emerald-200/50 dark:border-emerald-800/30">
            <CardContent className="pt-6 space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex min-h-[190px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                    : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-400'
                }`}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt={imageName || 'Preview'} className="max-h-52 w-full rounded-lg border border-emerald-200/60 object-cover dark:border-emerald-800/60" />
                    <AnimatePresence>
                      {scanningImage && (
                        <motion.div
                          initial={{ top: '4%', opacity: 0.9 }}
                          animate={{ top: '92%', opacity: 0.9 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                          className="absolute left-3 right-3 h-[3px] rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]"
                        >
                          <span className="absolute -top-1 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-emerald-400 blur-[2px]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {scanningImage && (
                      <div className="absolute bottom-14 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white shadow-lg">
                        <Scan size={13} className="animate-pulse" />
                        {tr(lang, "Scanning image...", "Ana daukar hoton ido...", "De dey scan image...", "Ṣe ayẹwo aworan...", "Na-enyocha onyonyo...", "Analyse de l'image en cours...")}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <CloudArrowUp size={36} weight="duotone" className={dragOver ? 'text-emerald-600' : 'text-emerald-400'} />
                    <div>
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                        {tr(lang, 'Drag & drop a screenshot here, or click to upload', 'Janyo hoto nan ko danna don zaɓar', 'Drag & drop screenshot for here, or click am to upload', 'Fà àmì ìgbàrá sí ibí, tàbí tẹ láti gbé sílẹ̀', 'Dọrịta & tụba foto ebe a, ma ọ bụ pịa ka bulie', 'Glissez-déposez une capture ici, ou cliquez pour téléverser')}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, GIF, WEBP</p>
                    </div>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleImageUpload} />
              </div>

              {imagePreview && !scanningImage && (
                <Button variant="outline" size="sm" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40" onClick={clearImage}>
                  <XCircle size={14} className="mr-1.5" />{tr(lang, "Remove Image", "Cire Hoto", "Comot Image", "Yọ Aworan", "Wepụ Onyonyo", "Retirer l'image")}
                </Button>
              )}

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  <PlusCircle size={13} />{tr(lang, "Try Sample Screenshots", "Gwada Hotunan Misali", "Try Sample Screenshots", "Gbiyànjú Awọn Apeere", "Nwaa Ihe Nlereanya", "Essayer des captures d'exemple")}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SCAM_SAMPLES.map((s, i) => (
                    <motion.button
                      key={s.id}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={scanningImage}
                      onClick={() => handleSample(s.id)}
                      className={`group relative overflow-hidden rounded-lg border text-left transition-colors ${
                        s.isScam
                          ? 'border-red-200 bg-red-50/60 hover:border-red-300 dark:border-red-900/50 dark:bg-red-950/20 dark:hover:border-red-700'
                          : 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:hover:border-emerald-700'
                      } disabled:opacity-50`}
                    >
                      <span className="block aspect-[4/3] w-full overflow-hidden">
                        <img src={s.imageUrl} alt={s.label} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </span>
                      <span className="block px-2 py-1.5">
                        <span className="block truncate text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">{s.label}</span>
                        <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                          {s.isScam
                            ? <ShieldWarning size={10} className="text-red-500" />
                            : <ShieldCheck size={10} className="text-emerald-600" />}
                          {s.isScam ? tr(lang, 'Scam', 'Zamba', 'Scam', 'Ẹ̀tàn', 'Aghụghọ', 'Arnaque') : tr(lang, 'Safe', 'Laushi', 'Safe', 'Ailéwu', 'Nchekwa', 'Sûr')}
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {ocrText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                  key={ocrText}
                >
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      <Scan size={13} />{tr(lang, 'Extracted Text (OCR)', 'Rubutun Da Aka Ciro (OCR)', 'Text wey dem cuz out (OCR)', 'Ọrọ Ti A Fa Jade (OCR)', 'Ederede Ewepụtara (OCR)', 'Texte extrait (OCR)')}
                    </p>
                    {imageName && <span className="text-[10px] text-muted-foreground">{imageName}</span>}
                  </div>
                  <Textarea
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    rows={5}
                    className="resize-y font-mono text-xs leading-relaxed"
                  />
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={reanalyzeOcr}
                    disabled={scanningImage || !ocrText.trim()}
                  >
                    {scanningImage ? (
                      <> <Scan size={14} className="mr-1.5 animate-pulse" />{tr(lang, 'Re-analyzing...', 'Ana sake bincike...', 'De dey re-analyze...', 'Tún ń ṣàtúnyẹ̀wò...', 'Na-enyochaghachi...', 'Réanalyse en cours...')}</>
                    ) : (
                      <><ArrowsClockwise size={14} className="mr-1.5" />{tr(lang, 'Re-analyze Text', 'Sake Bincika', 'Re-analyze Text', 'Tún Àyẹ̀wò Ọ̀rọ̀', 'Nyegharịa Ederede', 'Réanalyser le texte')}</>
                    )}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className={`border-2 ${riskBg(result.score)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    {result.score > 55 ? <ShieldWarning size={20} className={riskColor(result.score)} /> : <ShieldCheck size={20} className={riskColor(result.score)} />}
                    {t.risk_score}: <span className={`font-mono text-2xl font-bold ${riskColor(result.score)}`}>{result.score}</span>/100
                  </span>
                  <Badge className={result.score > 55 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : result.score > 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'}>
                    {t[getRiskLevel(result.score)]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={result.score} className={`h-2 ${result.score > 55 ? '[&>div]:bg-red-500' : result.score > 30 ? '[&>div]:bg-orange-500' : '[&>div]:bg-emerald-500'}`} />
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
                {result.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.flags.map((flag, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-red-300 text-red-700 dark:border-red-700 dark:text-red-300">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                )}
                {result.scamType !== 'Unknown' && result.scamType !== 'Suspicious URL' && (
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    <XCircle size={14} className="inline mr-1" />{tr(lang, 'Likely scam type', "Nau'in zamba", 'Likely scam type', 'Iru ẹ̀tàn tó ṣeéṣe', 'Ụdị aghụghọ nwere ike', "Type d'arnaque probable")}: {result.scamType}
                  </p>
                )}
                {result.score > 30 && (
                  <Button variant="outline" size="sm" className="mt-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
                    onClick={() => onExportToReport(`${imageName ? `${imageName} | ` : ''}${activeTab === 'text' ? textInput : activeTab === 'url' ? urlInput : ocrText || 'Image scan'}`, result.scamType)}>
                    <ArrowRight size={14} className="mr-1.5" />{tr(lang, 'Export to Report', 'Aika Rahoto', 'Export to Report', 'Gbe sí Ìròyìn', 'Bupụta na Akụkọ', 'Exporter vers le rapport')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}