import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CheckCircle, XCircle, Trophy, Certificate as CertIcon, ArrowLeft, Star, Lock } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { LESSONS, TRANSLATIONS } from '../constants'
import { User, UserProgress, Certificate, SupportedLang } from '../types'
import { localize, localizeArr } from '../locales'

interface AcademyProps {
  user: User | null
  lang: SupportedLang
  progress: UserProgress
  onUpdateProgress: (p: UserProgress) => void
  onAwardPoints: (points: number) => void
  onIssueCertificate: (cert: Certificate) => void
}

export function LearningAcademy({ user, lang, progress, onUpdateProgress, onAwardPoints, onIssueCertificate }: AcademyProps) {
  const t = TRANSLATIONS[lang]
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [quizMode, setQuizMode] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [certOpen, setCertOpen] = useState(false)

  const lesson = LESSONS.find(l => l.id === selectedLesson)
  const completedCount = progress.lessons_completed.length
  const totalLessons = LESSONS.length
  const allComplete = completedCount >= totalLessons

  // Language-aware helpers
  const getLessonTitle = (l: typeof LESSONS[number]) => localize(l, 'title', lang)
  const getLessonDesc = (l: typeof LESSONS[number]) => localize(l, 'description', lang)
  const getLessonContent = (l: typeof LESSONS[number]) => localize(l, 'content', lang)
  const getQuestionText = (q: typeof LESSONS[number]['quiz']['questions'][number]) => localize(q, 'text', lang)
  const getQuestionOptions = (q: typeof LESSONS[number]['quiz']['questions'][number]) => localizeArr(q, 'options', lang)
  const getQuestionExplanation = (q: typeof LESSONS[number]['quiz']['questions'][number]) => localize(q, 'explanation', lang)

  const startQuiz = (lessonId: string) => {
    setSelectedLesson(lessonId)
    setQuizMode(true)
    setCurrentQ(0)
    setAnswers([])
    setShowResult(false)
  }

  const selectAnswer = (idx: number) => {
    const newAnswers = [...answers, idx]
    setAnswers(newAnswers)
    if (lesson && newAnswers.length < lesson.quiz.questions.length) {
      setCurrentQ(prev => prev + 1)
    } else {
      setShowResult(true)
      const score = newAnswers.reduce((acc, ans, i) => acc + (ans === lesson!.quiz.questions[i].correct_index ? 1 : 0), 0)
      const pct = Math.round((score / lesson!.quiz.questions.length) * 100)
      const newProgress = { ...progress }
      newProgress.quiz_scores[lesson!.id] = pct
      if (pct >= 60 && !newProgress.lessons_completed.includes(lesson!.id)) {
        newProgress.lessons_completed.push(lesson!.id)
        newProgress.total_points += 30
        onAwardPoints(30)
      }
      onUpdateProgress(newProgress)
    }
  }

  const score = lesson ? Math.round((answers.reduce((acc, ans, i) => acc + (ans === lesson.quiz.questions[i].correct_index ? 1 : 0), 0) / lesson.quiz.questions.length) * 100) : 0

  const issueCertificate = () => {
    if (!user) return
    const cert: Certificate = {
      id: `cert-${Date.now()}`, user_id: user.id, recipient_name: user.name,
      certificate_id: `CSNG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      issued_date: new Date().toISOString(), security_seal: `SEAL-${user.id.slice(0, 6).toUpperCase()}`
    }
    onIssueCertificate(cert)
    setCertOpen(false)
  }

  if (quizMode && lesson) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => { setQuizMode(false); setSelectedLesson(null) }}>
          <ArrowLeft size={14} className="mr-1" /> {t.lessons}
        </Button>
        <Card className="border-emerald-200/50 dark:border-emerald-800/30">
          <CardHeader>
            <CardTitle className="text-lg"><motion.span key={`qt-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>{getLessonTitle(lesson)} - {t.quizzes}</motion.span></CardTitle>
            <Progress value={((currentQ + (showResult ? 1 : 0)) / lesson.quiz.questions.length) * 100} className="h-1.5 mt-2" />
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div key={`${currentQ}-${lang}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-sm font-medium mb-1 text-muted-foreground">{t.question_of} {currentQ + 1} {t.of} {lesson.quiz.questions.length}</p>
                  <p className="text-base font-semibold mb-4">{getQuestionText(lesson.quiz.questions[currentQ])}</p>
                  <div className="space-y-2">
                    {getQuestionOptions(lesson.quiz.questions[currentQ]).map((opt, i) => (
                      <Button key={i} variant="outline" className="w-full justify-start text-left h-auto py-3 px-4 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        onClick={() => selectAnswer(i)}>
                        <span className="mr-2 font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="text-center py-6">
                    <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${score >= 60 ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-red-100 dark:bg-red-900'}`}>
                      {score >= 60 ? <CheckCircle size={32} className="text-emerald-600" /> : <XCircle size={32} className="text-red-600" />}
                    </div>
                    <p className="text-2xl font-bold">{score}%</p>
                    <p className="text-sm text-muted-foreground mt-1">{score >= 60 ? t.pass_msg : t.fail_msg}</p>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    {lesson.quiz.questions.map((q, qi) => (
                      <div key={qi} className="text-sm">
                        <p className="font-medium">{getQuestionText(q)}</p>
                        <p className={`mt-1 ${answers[qi] === q.correct_index ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.your_answer}: {getQuestionOptions(q)[answers[qi]]} {answers[qi] !== q.correct_index && `| ${t.correct_answer}: ${getQuestionOptions(q)[q.correct_index]}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{getQuestionExplanation(q)}</p>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => { setQuizMode(false); setSelectedLesson(null) }}>
                    {t.back_to_lessons}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedLesson && lesson) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedLesson(null)}>
          <ArrowLeft size={14} className="mr-1" /> {t.lessons}
        </Button>
        <Card className="border-emerald-200/50 dark:border-emerald-800/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl"><motion.span key={`title-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>{getLessonTitle(lesson)}</motion.span></CardTitle>
              <Badge variant="outline" className="text-emerald-600 border-emerald-300 dark:border-emerald-700">
                <Star size={12} className="mr-1" />{lesson.duration_min} min
              </Badge>
            </div>
            <CardDescription><motion.span key={`desc-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>{getLessonDesc(lesson)}</motion.span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div key={`content-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
              className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-sm leading-relaxed">
              {getLessonContent(lesson)}
            </motion.div>
            <Separator />
            <div className="flex gap-2">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => startQuiz(lesson.id)}>
                <Trophy size={16} className="mr-1.5" />{t.take_quiz}
              </Button>
              {progress.lessons_completed.includes(lesson.id) && (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 self-center">
                  <CheckCircle size={12} className="mr-1" />{t.completed_badge}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">{t.academy}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.academy_subtitle}</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <Progress value={(completedCount / totalLessons) * 100} className="w-48 h-2" />
          <span className="text-xs font-medium text-muted-foreground">{completedCount}/{totalLessons}</span>
        </div>
      </div>

      {allComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <CertIcon size={32} className="text-amber-600" weight="fill" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">{t.all_complete}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{t.all_complete_sub}</p>
                </div>
              </div>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCertOpen(true)}>
                <CertIcon size={14} className="mr-1.5" />{t.certificate}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {LESSONS.map((l, i) => {
          const completed = progress.lessons_completed.includes(l.id)
          const quizScore = progress.quiz_scores[l.id]
          return (
            <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border-emerald-200/50 dark:border-emerald-800/30 ${completed ? 'ring-1 ring-emerald-300 dark:ring-emerald-700' : ''}`}
                onClick={() => setSelectedLesson(l.id)}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                      <BookOpen size={20} className="text-emerald-700 dark:text-emerald-300" />
                    </div>
                    {completed && <CheckCircle size={20} className="text-emerald-500" weight="fill" />}
                    {!completed && <Lock size={16} className="text-muted-foreground/50" />}
                  </div>
                  <motion.h3 key={`lt-${l.id}-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="mt-3 font-semibold text-sm">{getLessonTitle(l)}</motion.h3>
                  <motion.p key={`ld-${l.id}-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="mt-1 text-xs text-muted-foreground line-clamp-2">{getLessonDesc(l)}</motion.p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{l.duration_min} min</Badge>
                    {quizScore !== undefined && <Badge variant="outline" className={`text-[10px] ${quizScore >= 60 ? 'text-emerald-600 border-emerald-300' : 'text-red-600 border-red-300'}`}>{quizScore}%</Badge>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Dialog open={certOpen} onOpenChange={setCertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CertIcon size={20} className="text-amber-600" weight="fill" />{t.certificate}
            </DialogTitle>
          </DialogHeader>
          <div className="border-2 border-amber-300 rounded-lg p-6 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-zinc-900 text-center">
            <ShieldCheck size={40} className="mx-auto text-emerald-700 dark:text-emerald-400" weight="fill" />
            <p className="mt-2 text-xs uppercase tracking-widest text-amber-700 dark:text-amber-300">CyberShield NG Academy</p>
            <h3 className="mt-3 text-lg font-bold text-emerald-900 dark:text-emerald-100">{t.certificate_title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t.cert_certifies}</p>
            <p className="mt-1 text-base font-semibold">{user?.name || 'Student'}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.cert_completed}</p>
            <div className="mt-4 flex justify-between text-[10px] text-muted-foreground">
              <span>ID: CSNG-{new Date().getFullYear()}-XXXX</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={issueCertificate}>
              <CertIcon size={14} className="mr-1.5" />{t.issue_certificate}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              {t.print}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ShieldCheck(props: { size?: number; className?: string; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }) {
  return <CertIcon {...props} />
}