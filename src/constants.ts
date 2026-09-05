import { Lesson, Report, Alert, User } from './types'

// Nigerian Scam Heuristics Engine
export const SCAM_KEYWORDS: Record<string, number> = {
  'bvn': 25, 'bank verification number': 25, 'verification number': 20,
  'nin': 20, 'national identification number': 20,
  'urgent': 15, 'immediately': 12, 'act now': 15, 'right now': 10,
  'transfer': 12, 'send money': 20, 'wire transfer': 20,
  'account blocked': 18, 'account suspended': 18, 'account frozen': 15,
  'lottery': 20, 'winner': 15, 'you have won': 25, 'congratulations you': 25,
  'click here': 15, 'click the link': 15, 'follow this link': 12,
  'pin': 15, 'password': 12, 'otp': 20, 'one time password': 20,
  'debit': 10, 'alert': 8, 'confirmation code': 15,
  'efcc': 12, 'arrest warrant': 20, 'police': 8,
  'crypto': 15, 'bitcoin': 12, 'doubling': 25, 'investment return': 15,
  'cbn': 10, 'central bank': 12, 'grant': 15, 'loan approval': 12,
  'pos reversal': 20, 'reversal': 15, 'refund': 12,
  'whatsapp': 8, '6-digit code': 20, 'verification code': 18,
  'romance': 10, 'love': 5, 'dear': 8, 'my darling': 20,
  'loan app': 15, 'defamation': 12, 'blackmail': 20,
  'inec': 10, 'recruitment': 12, 'job offer': 10, 'no experience': 15,
  'mpp': 10, 'pay later': 8, 'installment': 5,
  'opay': 8, 'palmpay': 8, 'moniepoint': 8, 'kuda': 8,
  'fake alert': 20, 'transaction failed': 12, 'reversed': 10,
  'customer care': 5, 'support': 5, 'help desk': 8,
  'free': 10, 'bonus': 12, 'reward': 10, 'prize': 15,
  'confidential': 12, 'do not tell': 20, 'secret': 15,
  'account number': 10, 'bank details': 15, 'sort code': 8,
}

export const SUSPICIOUS_URL_PATTERNS: { pattern: RegExp; weight: number; label: string }[] = [
  { pattern: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, weight: 30, label: 'IP-based URL' },
  { pattern: /bit\.ly|tinyurl|t\.co|is\.gd|goo\.gl|buff\.ly|ow\.ly/, weight: 20, label: 'Shortened URL' },
  { pattern: /gtbank[-.]|zenith[-.]|access[-.]|firstbank[-.]|uba[-.]|opay[-.]|palmpay[-.]/, weight: 25, label: 'Bank typosquatting' },
  { pattern: /[-.]?(ng|com|net|org)\/(login|verify|secure|update|confirm)/, weight: 20, label: 'Fake login path' },
  { pattern: /\.xyz|\.top|\.click|\.work|\.gq|\.ml/, weight: 15, label: 'Suspicious TLD' },
  { pattern: /http:\/\//, weight: 10, label: 'No HTTPS' },
  { pattern: /@(.*?):.*?\/\//, weight: 25, label: 'Credential stuffing in URL' },
  { pattern: /[0-9a-f]{20,}/, weight: 15, label: 'Random hash domain' },
  { pattern: /free|winner|prize|gift|reward/, weight: 15, label: 'Bait keywords in URL' },
]

export const NIGERIAN_PHONE_PATTERN = /(\+234|0[789][01])/

// Sample screenshot presets for the Image Scanner (simulated OCR sources)
export interface ScamSample {
  id: string
  label: string
  desc: string
  imageUrl: string
  ocrText: string
  isScam: boolean
}

export const SCAM_SAMPLES: ScamSample[] = [
  {
    id: 'gtbank-alert',
    label: 'Fake GTBank Alert',
    desc: 'Fake credit alert used to trick POS vendors',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
    isScam: true,
    ocrText: `Transaction Alert

GTBank | CREDIT
Amount: NGN 250,000.00
From: ADEBAYO S. O.

Dear customer, your account has been credited. Verify instantly at gtbank-verify.xyz/confirm or call our help desk to release funds. Reply with your BVN and PIN to confirm this transaction.

Do not share this alert.`,
  },
  {
    id: 'opay-doubling',
    label: 'OPay Doubling Scam',
    desc: 'Too-good-to-be-true investment promise',
    imageUrl: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=600&q=80',
    isScam: true,
    ocrText: `OPay Doubling Offer!!!

Send N50,000 and get N150,000 back in 2 hours. This is a LIMITED investment opportunity approved by CBN. Act now, only 10 slots left!

To participate: send money to 08123456789 or click the link. Do not tell anyone - urgent, immediate action required!`,
  },
  {
    id: 'job-offer',
    label: 'WhatsApp Job Offer',
    desc: 'Remote job promising easy money',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
    isScam: true,
    ocrText: `URGENT!!! Remote Job Offer

Work from home and earn N100,000 weekly, NO EXPERIENCE needed. Just like and subscribe to videos. Registration fee of N5,000 required to activate your account number.

Send payment now to register, act immediately - slots are limited!`,
  },
  {
    id: 'electricity-receipt',
    label: 'Legit Electricity Receipt',
    desc: 'Normal utility payment confirmation',
    imageUrl: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=600&q=80',
    isScam: false,
    ocrText: `Ikeja Electric
Payment Receipt

Date: 12-08-2024
Amount: NGN 12,500.00
Reference: 8843-2210-9973

Thank you for your payment. Your token has been sent to your registered phone number. For support, call 0700-453-5322.`,
  },
]

export const SCAM_TYPES = [
  'Banking Phishing', 'Fake Alert', 'Lottery Scam', 'Romance Scam',
  'Job Scam', 'Loan App Harassment', 'Crypto Scam', 'SIM Swap',
  'BVN/NIN Fraud', 'POS Fraud', 'WhatsApp Hijacking', 'Investment Fraud'
]

export const NIGERIAN_STATES = [
  'Lagos', 'Abuja (FCT)', 'Rivers', 'Kano', 'Oyo', 'Anambra',
  'Enugu', 'Delta', 'Kaduna', 'Plateau', 'Benue', 'Borno',
  'Cross River', 'Edo', 'Imo', 'Ogun', 'Osun', 'Akwa Ibom'
]

// Translations
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    mfa_title: 'Security Settings',
    mfa_subtitle: 'Protect your account with Two-Factor Authentication (2FA)',
    mfa_enabled_label: 'Two-Factor Authentication',
    mfa_enabled_desc: 'Require a one-time code from your email when you sign in.',
    mfa_method: 'Verification Method',
    mfa_email: 'Email Code',
    mfa_authenticator: 'Authenticator App',
    mfa_backup_codes: 'Backup Codes',
    mfa_backup_desc: 'Store these safely so you can recover access if your verification method is unavailable.',
    mfa_show_codes: 'Show backup codes',
    mfa_hide_codes: 'Hide backup codes',
    mfa_regenerate: 'Regenerate',
    mfa_copied: 'Copied to clipboard',
    mfa_save: 'Save Changes',
    mfa_on: 'On',
    mfa_off: 'Off',
    otp_title: 'Check your email',
    otp_subtitle: "We've sent a 6-digit code to",
    otp_label: 'One-Time Code',
    otp_resend: 'Resend code',
    otp_in: 'in',
    otp_verify: 'Verify & Continue',
    otp_back: 'Back to login',
    otp_invalid: 'Invalid code. Please try again.',
    otp_sent_toast: 'Verification code sent to your email (demo: 123456)',
    otp_verified_toast: 'Verification successful!',
    otp_resend_toast: 'A new code has been sent (demo: 123456)',
    otp_demo_hint: 'Demo code: 123456',
    otp_received_banner: 'Simulated Inbox - new secure message',
    otp_code_is: 'Your ScamGuard verification OTP is',
    otp_quick_fill: 'Use Code',
    otp_copied: 'Code copied to clipboard',
    mfa_required_title: 'Security Check Required',
    mfa_required_desc: 'This action requires re-verification. Enter the code sent to your email.',
    mfa_req_confirm: 'Confirm & Continue',
    mfa_req_cancel: 'Cancel',
    mfa_step_up_toast: 'Identity verified. Action completed.',
    app_name: 'CyberShield NG',
    tagline: 'AI-Powered Scam Detection for Nigeria & Africa',
    scanner: 'AI Scanner',
    reports: 'Threat Reports',
    academy: 'Learning Academy',
    analytics: 'Analytics',
    admin: 'Admin Panel',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    scan_text: 'Scan Text',
    scan_url: 'Scan URL',
    scan_image: 'Scan Image',
    analyze: 'Analyze',
    risk_score: 'Risk Score',
    safe: 'Safe',
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical',
    report_scam: 'Report a Scam',
    submit_report: 'Submit Report',
    lessons: 'Lessons',
    quizzes: 'Quizzes',
    certificate: 'Certificate',
    points: 'Points',
    notifications: 'Notifications',
    dark_mode: 'Dark Mode',
    light_mode: 'Light Mode',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    pending: 'Pending',
    investigating: 'Investigating',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
    total_scans: 'Total Scans',
    high_risk: 'High Risk Intercepted',
    total_reports: 'Community Reports',
    certified: 'Certified Learners',
    broadcast: 'Broadcast Alert',
    manage_users: 'Manage Users',
    moderate_reports: 'Moderate Reports',
    no_results: 'No results found',
    welcome: 'Welcome back',
    demo_login: 'Try Demo',
    take_quiz: 'Take Quiz',
    read_lesson: 'Read Lesson',
    question_of: 'Question',
    of: 'of',
    your_answer: 'Your answer',
    correct_answer: 'Correct answer',
    back_to_lessons: 'Back to Lessons',
    completed_badge: 'Completed',
    certificate_title: 'Certificate of Completion',
    cert_certifies: 'This certifies that',
    cert_completed: 'has completed all cybersecurity lessons',
    issue_certificate: 'Issue Certificate',
    print: 'Print',
    academy_subtitle: 'Learn to protect yourself from cyber threats',
    all_complete: 'All lessons complete!',
    all_complete_sub: 'You earned a verifiable certificate',
    pass_msg: 'Passed! +30 points awarded',
    fail_msg: 'Try again - need 60% to pass',
    sign_in_account: 'Sign in to your account',
    create_account: 'Create a new account',
    full_name: 'Full Name',
    email: 'Email',
    password: 'Password',
    name_required: 'Name required',
    auth_error: 'Invalid email or password',
    email_exists: 'Email already registered',
    no_account: "Don't have an account?",
    have_account: 'Already have an account?',
    ai_scanner: 'AI Scanner',
    states_18: '18 States',
    free_forever: 'Free Forever',
    progress_label: 'Lessons Progress',
  },
  ha: {
    mfa_title: 'Saitunan Tsaro',
    mfa_subtitle: 'Kare asusunka da Tabbataccen Shiga Biyu (2FA)',
    mfa_enabled_label: 'Tabbataccen Shiga Biyu',
    mfa_enabled_desc: 'Buƙaci lambar lokaci ɗaya daga imelinka lokacin shiga.',
    mfa_method: 'Hanyar Tabbatarwa',
    mfa_email: 'Lambar Imel',
    mfa_authenticator: 'App ɗin Tabbatarwa',
    mfa_backup_codes: 'Lambobin Ajiya',
    mfa_backup_desc: 'Ajiye waɗannan lafiya don sake samun shiga idan hanyarka ta kasa aiki.',
    mfa_show_codes: 'Nuna lambobin ajiya',
    mfa_hide_codes: 'Ɓoye lambobin ajiya',
    mfa_regenerate: 'Sabunta',
    mfa_copied: 'An kwafi zuwa allo',
    mfa_save: 'Ajiye Canje-canje',
    mfa_on: 'Kunna',
    mfa_off: 'Kashe',
    otp_title: 'Duba imelinka',
    otp_subtitle: 'Mun aika lamba mai lambobi 6 zuwa',
    otp_label: 'Lambar Lokaci ɗaya',
    otp_resend: 'Sake aika lamba',
    otp_in: 'cikin',
    otp_verify: 'Tabbatar & Ci gaba',
    otp_back: 'Koma zuwa shiga',
    otp_invalid: 'Lambar ba daidai ba. Sake gwadawa.',
    otp_sent_toast: 'An aika lambar tabbatarwa zuwa imelinka (demo: 123456)',
    otp_verified_toast: 'An yi nasarar tabbatarwa!',
    otp_resend_toast: 'An aika sabuwar lamba (demo: 123456)',
    otp_demo_hint: 'Lambar demo: 123456',
    otp_received_banner: 'Akwatin Saƙo - sabon saƙon tsaro',
    otp_code_is: 'Lambar tabbatarwar ScamGuard dinka ita ce',
    otp_quick_fill: 'Yi Amfani da Lamba',
    otp_copied: 'An kwafi lamba zuwa allo',
    mfa_required_title: 'Ana Bukatar Duban Tsaro',
    mfa_required_desc: 'Wannan aikin yana buƙatar sake tabbatarwa. Shigar da lambar da aka aika zuwa imelinka.',
    mfa_req_confirm: 'Tabbatar & Ci gaba',
    mfa_req_cancel: 'Soke',
    mfa_step_up_toast: 'An tabbatar da asalin ka. An kammala aikin.',
    app_name: 'CyberShield NG',
    tagline: 'Gano Zamba ta AI don Najeriya & Afirka',
    scanner: "Na'urar Bincike",
    reports: 'Rahoton Barazana',
    academy: 'Makarantar Koyarwa',
    analytics: 'Binciken Bayanai',
    admin: 'Sashen Gudanarwa',
    login: 'Shiga',
    register: 'Yin Rajista',
    logout: 'Fita',
    profile: 'Bayanai',
    scan_text: 'Binciken Rubutu',
    scan_url: 'Binciken Hanyar Yanar Gizo',
    scan_image: 'Binciken Hoto',
    analyze: 'Bincika',
    risk_score: 'Maki Haɗari',
    safe: 'Laushi',
    low: 'Haɗari Ƙanana',
    medium: 'Haɗari Matsakaici',
    high: 'Haɗari Mai Yawa',
    critical: 'Matuƙar Haɗari',
    report_scam: 'Ba da Rahoto',
    submit_report: 'Aika Rahoto',
    lessons: 'Darussa',
    quizzes: 'Gwaje-gwaje',
    certificate: 'Takardun Shaida',
    points: 'Maki',
    notifications: 'Sanarwa',
    dark_mode: 'Yan duhu',
    light_mode: 'Yan haske',
    search: 'Bincika',
    filter: 'Tace',
    all: 'Duka',
    pending: 'A jira',
    investigating: 'Ana bincike',
    resolved: 'An warware',
    dismissed: 'An ƙi',
    total_scans: 'Jimlar Bincike',
    high_risk: 'An Kama Haɗari',
    total_reports: "Rahoton Al'umma",
    certified: 'Masu Takardun Shaida',
    broadcast: 'Sanarwa Ga Kowa',
    manage_users: 'Gudanar da Masu Amfani',
    moderate_reports: 'Duba Rahotanni',
    no_results: 'Babu sakamako',
    welcome: 'Barka da zuwa',
    demo_login: 'Gwada',
    take_quiz: 'Yi Gwaji',
    read_lesson: 'Karanta Darasi',
    question_of: 'Tambaya',
    of: 'cikin',
    your_answer: 'Amsarka',
    correct_answer: 'Amsar da ta dace',
    back_to_lessons: 'Koma Darussa',
    completed_badge: 'An Kammala',
    certificate_title: 'Takardar Shaida',
    cert_certifies: 'Wannan yana tabbatar da cewa',
    cert_completed: 'ya kammala darussan tsaron yanar gizo dukansu',
    issue_certificate: 'Bayar da Takarda',
    print: 'Buga',
    academy_subtitle: 'Koye kare kanka daga barazanar yanar gizo',
    all_complete: 'Duka darussa an kammala!',
    all_complete_sub: 'Ka samu takardun shaida',
    pass_msg: 'An yi nasara! +30 maki',
    fail_msg: 'Sake gwadawa - ana buƙatar 60%',
    sign_in_account: 'Shiga asusunka',
    create_account: 'Ƙirƙiri sabon asusu',
    full_name: 'Suna Cikakke',
    email: 'Imel',
    password: 'Kalmar Sirri',
    name_required: 'Suna dole ne',
    auth_error: 'Imel ko kalmar sirri ba daidai ba',
    email_exists: 'An riga an yi rajista wannan imel',
    no_account: 'Ba ka da asusu?',
    have_account: 'Ka riga ka da asusu?',
    ai_scanner: "Na'urar AI",
    states_18: 'Jihohi 18',
    free_forever: 'B kyauta',
    progress_label: 'Ci Gaban Darussa',
  },
  pcm: {
    mfa_title: 'Security Settings',
    mfa_subtitle: 'Protect your account with Two-Factor Authentication (2FA)',
    mfa_enabled_label: 'Two-Factor Authentication',
    mfa_enabled_desc: 'Require one-time code from your email when you sign in.',
    mfa_method: 'Verification Method',
    mfa_email: 'Email Code',
    mfa_authenticator: 'Authenticator App',
    mfa_backup_codes: 'Backup Codes',
    mfa_backup_desc: 'Store these one well so you fit recover if your method no dey work.',
    mfa_show_codes: 'Show backup codes',
    mfa_hide_codes: 'Hide backup codes',
    mfa_regenerate: 'Regenerate',
    mfa_copied: 'Don copy to clipboard',
    mfa_save: 'Save Changes',
    mfa_on: 'On',
    mfa_off: 'Off',
    otp_title: 'Check your email',
    otp_subtitle: 'We send 6-digit code to',
    otp_label: 'One-Time Code',
    otp_resend: 'Resend code',
    otp_in: 'for',
    otp_verify: 'Verify & Continue',
    otp_back: 'Back to login',
    otp_invalid: 'Wrong code. Try again.',
    otp_sent_toast: 'We send verification code to your email (demo: 123456)',
    otp_verified_toast: 'Verification successful!',
    otp_resend_toast: 'We don send new code (demo: 123456)',
    otp_demo_hint: 'Demo code: 123456',
    otp_received_banner: 'Inbox - new strong message wey don enter',
    otp_code_is: 'Your ScamGuard verification OTP na',
    otp_quick_fill: 'Use Code',
    otp_copied: 'Don copy code to clipboard',
    mfa_required_title: 'Security Check Required',
    mfa_required_desc: 'This action need re-verification. Put the code we send to your email.',
    mfa_req_confirm: 'Confirm & Continue',
    mfa_req_cancel: 'Cancel',
    mfa_step_up_toast: 'Identity verified. Action don complete.',
    app_name: 'CyberShield NG',
    tagline: 'AI-Powered Scam Detection for Naija & Africa',
    scanner: 'Check Scam Quick',
    reports: 'Report Bad People',
    academy: 'Learning Academy',
    analytics: 'Analytics',
    admin: 'Admin Panel',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    scan_text: 'Check Text',
    scan_url: 'Check URL',
    scan_image: 'Check Picture',
    analyze: 'Analyse',
    risk_score: 'Risk Score',
    safe: 'De Safe',
    low: 'Small Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical',
    report_scam: 'Report Scam',
    submit_report: 'Submit Report',
    lessons: 'Lessons',
    quizzes: 'Quizzes',
    certificate: 'Certificate',
    points: 'Points',
    notifications: 'Notifications',
    dark_mode: 'Dark Mode',
    light_mode: 'Light Mode',
    search: 'Sarch',
    filter: 'Filter',
    all: 'All',
    pending: 'De Wait',
    investigating: 'De Check Am',
    resolved: 'Don Solve',
    dismissed: 'Dem Drop Am',
    total_scans: 'Total Scans',
    high_risk: 'High Risk Wey Dem Catch',
    total_reports: 'Community Reports',
    certified: 'Certified Learners',
    broadcast: 'Broadcast Alert',
    manage_users: 'Manage Users',
    moderate_reports: 'Check Reports',
    no_results: 'No result wey we find',
    welcome: 'Welcome back',
    demo_login: 'Try Am',
    take_quiz: 'Do Quiz',
    read_lesson: 'Read Lesson',
    question_of: 'Question',
    of: 'of',
    your_answer: 'Your answer',
    correct_answer: 'Correct answer',
    back_to_lessons: 'Go back to Lessons',
    completed_badge: 'Don Finish',
    certificate_title: 'Certificate of Completion',
    cert_certifies: 'This one dey confirm say',
    cert_completed: 'don finish all cybersecurity lessons',
    issue_certificate: 'Issue Certificate',
    print: 'Print',
    academy_subtitle: 'Learn how to protect yourself from cyber wahala',
    all_complete: 'All lessons don finish!',
    all_complete_sub: 'You earn a verifiable certificate',
    pass_msg: 'You pass! +30 points',
    fail_msg: 'Try again - you need 60% to pass',
    sign_in_account: 'Sign in to your account',
    create_account: 'Create a new account',
    full_name: 'Full Name',
    email: 'Email',
    password: 'Password',
    name_required: 'Name required',
    auth_error: 'Invalid email or password',
    email_exists: 'Email already registered',
    no_account: "You no get account?",
    have_account: 'You don get account?',
    ai_scanner: 'AI Scanner',
    states_18: '18 States',
    free_forever: 'Free Forever',
    progress_label: 'Lessons Progress',
  },
  yo: {
    mfa_title: 'Àwọn Ètò Ààbò',
    mfa_subtitle: 'Dáàbò bo àkọọ́lẹ̀ rẹ pẹ̀lú Ìfọwọ́sowọ́pọ̀ Méjì (2FA)',
    mfa_enabled_label: 'Ìfọwọ́sowọ́pọ̀ Méjì',
    mfa_enabled_desc: 'Béèrè koodu ìgbà kan ṣoṣo láti inú íméèlì rẹ nígbà tí o bá ń wọlé.',
    mfa_method: 'Ọ̀nà Ìfọwọ́sowọ́pọ̀',
    mfa_email: 'Koodu Íméèlì',
    mfa_authenticator: 'App Ìfọwọ́sowọ́pọ̀',
    mfa_backup_codes: 'Àwọn Koodu Àfipamọ́',
    mfa_backup_desc: 'Fi àwọn wọ̀nyí pamọ́ dáradára láti gba àbáwọlé padà tí ọ̀nà rẹ bá kùnà.',
    mfa_show_codes: 'Fi àwọn koodu àfipamọ́ hàn',
    mfa_hide_codes: 'Pamọ́ àwọn koodu àfipamọ́',
    mfa_regenerate: 'Tún ṣe',
    mfa_copied: 'A dá kọ́pá sínú àpótí',
    mfa_save: 'Fi Àwọn Ìyípadà Pamọ́',
    mfa_on: 'Wọ́n',
    mfa_off: 'Pa',
    otp_title: 'Ṣàyẹ̀wò íméèlì rẹ',
    otp_subtitle: 'A rán koodu oní-nọ́mbà 6 sí',
    otp_label: 'Koodu Ìgbà Kan Ṣoṣo',
    otp_resend: 'Tún koodu rán',
    otp_in: 'nínú',
    otp_verify: 'Fọwọ́sí & Tẹ̀síwájú',
    otp_back: 'Padà sí ìwọ́lé',
    otp_invalid: 'Koodu tì kò tọ́. Tún gbìyànjú.',
    otp_sent_toast: 'A rán koodu ìfọwọ́sí sí íméèlì rẹ (demo: 123456)',
    otp_verified_toast: 'Ìfọwọ́sí àṣeyọrí!',
    otp_resend_toast: 'A ti rán koodu tuntun (demo: 123456)',
    otp_demo_hint: 'Koodu demo: 123456',
    otp_received_banner: 'Àpótí Ifiranṣẹ - ifiranṣẹ aabo tuntun',
    otp_code_is: 'Koodu ìfọwọ́si ScamGuard rẹ ni',
    otp_quick_fill: 'Lo Koodu',
    otp_copied: 'A ti daakọ koodu sínú àpótí',
    mfa_required_title: 'Ìfọwọ́sí Ààbò Ní Nnàní',
    mfa_required_desc: 'Ìgbésẹ̀ yìí nílò ìtúnyẹ̀wò. Tẹ koodu tí a rán sí íméèlì rẹ.',
    mfa_req_confirm: 'Jẹ́rìí & Tẹ̀síwájú',
    mfa_req_cancel: 'Fagilé',
    mfa_step_up_toast: 'A ti fọwọ́sí ìdánimọ̀ rẹ. A parí ìgbésẹ̀ náà.',
    app_name: 'CyberShield NG',
    tagline: 'Ayewo Itanjẹ pẹlu AI fun Naijiria & Afirika',
    scanner: 'Ayewo Itanjẹ',
    reports: 'Ijabọ Irokuro',
    academy: 'Ilé-Ẹ̀kọ́ Ẹ̀kọ́',
    analytics: 'Àyẹ̀wò Ìsọ̀rọ̀',
    admin: 'Ìgbìmọ̀ Àkóso',
    login: 'Wọlé',
    register: 'Forúkọ sílẹ̀',
    logout: 'Jáde',
    profile: 'Àkọọ́lẹ̀',
    scan_text: 'Ṣàyẹ̀wò Ọ̀rọ̀',
    scan_url: 'Ṣàyẹ̀wò URL',
    scan_image: 'Ṣàyẹ̀wò Àwòrán',
    analyze: 'Ṣàyẹ̀wò',
    risk_score: 'Àmì Ewu',
    safe: 'Àìléwu',
    low: 'Ewu Kékeré',
    medium: 'Ewu Àrín',
    high: 'Ewu Nlá',
    critical: 'Ewu Tó Lélè Jùlọ',
    report_scam: 'Jabọ Itanjẹ',
    submit_report: 'Fi Ìjábọ̀ Ránṣẹ́',
    lessons: 'Àwọn Ẹ̀kọ́',
    quizzes: 'Àwọn Ìdánwò',
    certificate: 'Ìwé Ẹ̀rí',
    points: 'Àwọn Àmì',
    notifications: 'Àwọn Ìfiránṣẹ́',
    dark_mode: 'Ibi òkùnkùn',
    light_mode: 'Ibi ìmọ́lẹ̀',
    search: 'Wá',
    filter: 'Àlẹ̀',
    all: 'Gbogbo',
    pending: 'Ń dúró',
    investigating: 'Ń ṣèwádìí',
    resolved: 'Tí yanjú',
    dismissed: 'Tí kọ̀ sílẹ̀',
    total_scans: 'Àpapọ̀ Àyẹ̀wò',
    high_risk: 'Ewu Nlá Tí À Mú',
    total_reports: 'Ìjábọ̀ Àwùjọ',
    certified: 'Àwọn Tó Gba Ìwé Ẹ̀rí',
    broadcast: 'Ìkìlọ̀ Gbígbórí',
    manage_users: 'Ṣàkóso Àwọn Olùlò',
    moderate_reports: 'Ṣàtúnṣe Àwọn Ìjábọ̀',
    no_results: 'Kò sí àbájáde',
    welcome: 'Káàbọ̀',
    demo_login: 'Gbìyànjú',
    take_quiz: 'Ṣe Ìdánwò',
    read_lesson: 'Kà Ẹ̀kọ́',
    question_of: 'Ìbéèrè',
    of: 'nínú',
    your_answer: 'Ìdáhùn rẹ',
    correct_answer: 'Ìdáhùn tó tọ́',
    back_to_lessons: 'Padà sí Àwọn Ẹ̀kọ́',
    completed_badge: 'Tí Párí',
    certificate_title: 'Ìwé Ẹ̀rí Ìparí',
    cert_certifies: 'Èyí jẹ́rìí sí pé',
    cert_completed: 'ti pari gbogbo ẹ̀kọ́ cybersecurity',
    issue_certificate: 'Fún ní Ìwé Ẹ̀rí',
    print: 'Tẹ̀ jáde',
    academy_subtitle: 'Kọ́ bí o ṣe lè dáàbò bo ara rẹ lọ́wọ́ ewu orí ayélujára',
    all_complete: 'Gbogbo ẹ̀kọ́ ti parí!',
    all_complete_sub: 'O gba ìwé ẹ̀rí tó jẹ́ olùfọ̀rọ̀jẹ́rìí',
    pass_msg: 'Ó ṣeéṣe! +30 àmì',
    fail_msg: 'Tún gbìyànjú - o nílò 60% láti kọjá',
    sign_in_account: 'Wọlé sí ìpamọ́ rẹ',
    create_account: 'Ṣẹ̀dá àkọọ́lẹ̀ tuntun',
    full_name: 'Orúkọ Kíkún',
    email: 'Iméèlì',
    password: 'Ọ̀rọ̀àṣínà',
    name_required: 'Orúkọ pọ́n dandan',
    auth_error: 'Iméèlì tàbí ọ̀rọ̀àṣínà kò tọ́',
    email_exists: 'Iméèlì yìí ti forúkọsilẹ̀',
    no_account: 'Ṣé o kò ní àkọọ́lẹ̀?',
    have_account: 'Ṣé o ti ní àkọọ́lẹ̀?',
    ai_scanner: 'Ayẹ̀wò AI',
    states_18: 'Àwọn Ìpínlẹ̀ 18',
    free_forever: 'Ọ̀fẹ́ Láéláé',
    progress_label: 'Ìlọsíwájú Ẹ̀kọ́',
  },
  ig: {
    mfa_title: 'Ntọala Nchebe',
    mfa_subtitle: 'Chebe akaụntụ gị na nkwenye ihe abụọ (2FA)',
    mfa_enabled_label: 'Nkwenye Ihe Abụọ',
    mfa_enabled_desc: 'Chọọ koodu otu oge site na email gị mgbe ị banyere.',
    mfa_method: 'Ụzọ Nkwenye',
    mfa_email: 'Koodu Email',
    mfa_authenticator: 'Ngwa Nkwenye',
    mfa_backup_codes: 'Koodu Ndọkwa',
    mfa_backup_desc: 'Chekwa ndị a nke ọma iji nwetaghachi ohere ma ọ bụrụ na ụzọ gị adịghị arụ ọrụ.',
    mfa_show_codes: 'Gosi koodu ndọkwa',
    mfa_hide_codes: 'Zoo koodu ndọkwa',
    mfa_regenerate: 'Mepụtaghachi',
    mfa_copied: 'E depụtagoro na clipboard',
    mfa_save: 'Chekwa Mgbanwe',
    mfa_on: 'Gbanye',
    mfa_off: 'Gbanyụọ',
    otp_title: 'Lelee email gị',
    otp_subtitle: 'Anyị zigara koodu mkpụrụ ọnụọgụ 6 na',
    otp_label: 'Koodu Otu Oge',
    otp_resend: 'Zigharịa koodu',
    otp_in: "n'ime",
    otp_verify: "Nyocha & Gaa n'ihu",
    otp_back: 'Laghachi na nbanye',
    otp_invalid: 'Koodu ezighi ezi. Gbalịa ọzọ.',
    otp_sent_toast: 'E zigara koodu nyocha na email gị (demo: 123456)',
    otp_verified_toast: 'Nyocha gara nke ọma!',
    otp_resend_toast: 'E zigara koodu ọhụrụ (demo: 123456)',
    otp_demo_hint: 'Koodu demo: 123456',
    otp_received_banner: 'Igbe Ozi - ozi nchebe ọhụrụ',
    otp_code_is: 'Koodu nyocha ScamGuard gị bụ',
    otp_quick_fill: 'Jiri Koodu',
    otp_copied: 'E depụtara koodu na clipboard',
    mfa_required_title: 'Achọrọ Nlele Nchebe',
    mfa_required_desc: 'Omume a chọrọ nyocha ọzọ. Tinye koodu e zigara na email gị.',
    mfa_req_confirm: "Kwado & Gaa n'ihu",
    mfa_req_cancel: 'Kagbuo',
    mfa_step_up_toast: 'Egosiputara njirimara gị. Emechara omume ahụ.',
    app_name: 'CyberShield NG',
    tagline: 'Nyocha Aghụghọ site na AI maka Naijiria & Afrịka',
    scanner: 'Nyocha Aghụghọ',
    reports: 'Kpesa Ihe Egwu',
    academy: 'Ụlọ Akwụkwọ Mmụta',
    analytics: 'Nyocha Data',
    admin: 'Ngalaba Nchịkwa',
    login: 'Banye',
    register: 'Deba aha',
    logout: 'Pụọ',
    profile: 'Profaịlụ',
    scan_text: 'Nyochaa Ederede',
    scan_url: 'Nyochaa URL',
    scan_image: 'Nyochaa Foto',
    analyze: 'Nyochaa',
    risk_score: 'Akara Ihe Egwu',
    safe: 'Nchebe',
    low: 'Ihe Egwu Dị Ala',
    medium: 'Ihe Egwu Dị N’etiti',
    high: 'Ihe Egwu Dị Elu',
    critical: 'Ihe Egwu Dị Oké njọ',
    report_scam: 'Kpesa Aghụghọ',
    submit_report: 'Nyefee Mkpesa',
    lessons: 'Ihe Ọmụmụ',
    quizzes: 'Ule',
    certificate: 'Asambodo',
    points: 'Akara',
    notifications: 'Ngosi',
    dark_mode: 'Ọchịchịrị',
    light_mode: 'Ìhè',
    search: 'Chọọ',
    filter: 'Nyochaa',
    all: 'Ha niile',
    pending: 'Ọ na-echere',
    investigating: 'Ọ na-eme nchọpụta',
    resolved: 'Edoziela',
    dismissed: 'Ajụla',
    total_scans: 'Ngụkọta Nyocha',
    high_risk: 'Ihe Egwu Dị Elu Jidere',
    total_reports: 'Mkpesa Obodo',
    certified: 'Ndị Nwetara Asambodo',
    broadcast: 'Mgbasa Ozi',
    manage_users: 'Jikwaa Ndị Ọrụ',
    moderate_reports: 'Lekwaa Mkpesa',
    no_results: 'Enweghị nsonaazụ',
    welcome: 'Nnọọ',
    demo_login: 'Nwaa',
    take_quiz: 'Mee Ule',
    read_lesson: 'Gụọ Ihe Ọmụmụ',
    question_of: 'Ajụjụ',
    of: 'nke',
    your_answer: 'Azịza gị',
    correct_answer: 'Azịza ziri ezi',
    back_to_lessons: 'Laghachi na Ihe Ọmụmụ',
    completed_badge: 'Emechara',
    certificate_title: 'Asambodo Mmecha',
    cert_certifies: 'Nke a na-akwado na',
    cert_completed: 'mechara ihe ọmụmụ cybersecurity niile',
    issue_certificate: 'Nye Asambodo',
    print: 'Bipụta',
    academy_subtitle: 'Mụta otu esi echebe onwe gị pụọ n’ihe egwu ịntanetị',
    all_complete: 'Ihe ọmụmụ niile emechala!',
    all_complete_sub: 'Ị nwetara asambodo a pụrụ ịkwenye',
    pass_msg: 'Ị gafere! +30 akara',
    fail_msg: 'Nwaa ọzọ - ị chọrọ 60% iji gafee',
    sign_in_account: 'Banye na akaụntụ gị',
    create_account: 'Mepụta akaụntụ ọhụrụ',
    full_name: 'Aha Nzuzo',
    email: 'Email',
    password: 'Okwuntụahịa',
    name_required: 'Aha achọrọ',
    auth_error: 'Email ma ọ bụ okwuntụahịa adịghị mma',
    email_exists: 'Edelarị email a aha',
    no_account: 'Ị nweghị akaụntụ?',
    have_account: 'Ị nweelarị akaụntụ?',
    ai_scanner: 'Nyocha AI',
    states_18: 'Steeti 18',
    free_forever: 'Na-efu efu Ebighị Ebi',
    progress_label: 'Ọganihu Ihe Ọmụmụ',
  },
  fr: {
    mfa_title: 'Paramètres de Sécurité',
    mfa_subtitle: "Protégez votre compte avec l'authentification à deux facteurs (2FA)",
    mfa_enabled_label: 'Authentification à Deux Facteurs',
    mfa_enabled_desc: 'Exigez un code à usage unique depuis votre e-mail lors de la connexion.',
    mfa_method: 'Méthode de Vérification',
    mfa_email: 'Code E-mail',
    mfa_authenticator: 'Application Authenticator',
    mfa_backup_codes: 'Codes de Secours',
    mfa_backup_desc: 'Conservez-les précieusement pour récupérer votre accès si votre méthode est indisponible.',
    mfa_show_codes: 'Afficher les codes de secours',
    mfa_hide_codes: 'Masquer les codes de secours',
    mfa_regenerate: 'Régénérer',
    mfa_copied: 'Copié dans le presse-papiers',
    mfa_save: 'Enregistrer les Modifications',
    mfa_on: 'Activé',
    mfa_off: 'Désactivé',
    otp_title: 'Vérifiez votre e-mail',
    otp_subtitle: 'Nous avons envoyé un code à 6 chiffres à',
    otp_label: 'Code à Usage Unique',
    otp_resend: 'Renvoyer le code',
    otp_in: 'dans',
    otp_verify: 'Vérifier & Continuer',
    otp_back: 'Retour à la connexion',
    otp_invalid: 'Code invalide. Réessayez.',
    otp_sent_toast: 'Code de vérification envoyé à votre e-mail (démo : 123456)',
    otp_verified_toast: 'Vérification réussie !',
    otp_resend_toast: 'Un nouveau code a été envoyé (démo : 123456)',
    otp_demo_hint: 'Code démo : 123456',
    otp_received_banner: 'Boîte de réception - nouveau message sécurisé',
    otp_code_is: 'Votre code OTP de vérification ScamGuard est',
    otp_quick_fill: 'Utiliser le Code',
    otp_copied: 'Code copié dans le presse-papiers',
    mfa_required_title: 'Vérification de Sécurité Requise',
    mfa_required_desc: 'Cette action nécessite une re-vérification. Saisissez le code envoyé à votre e-mail.',
    mfa_req_confirm: 'Confirmer & Continuer',
    mfa_req_cancel: 'Annuler',
    mfa_step_up_toast: 'Identité vérifiée. Action terminée.',
    app_name: 'CyberShield NG',
    tagline: 'Détection des arnaques par IA pour le Nigéria & l’Afrique',
    scanner: 'Détecteur d’Arnaques',
    reports: 'Rapports de Menaces',
    academy: 'Académie d’Apprentissage',
    analytics: 'Analyses',
    admin: 'Panneau d’Administration',
    login: 'Connexion',
    register: 'S’inscrire',
    logout: 'Déconnexion',
    profile: 'Profil',
    scan_text: 'Analyser le Texte',
    scan_url: 'Analyser l’URL',
    scan_image: 'Analyser l’Image',
    analyze: 'Analyser',
    risk_score: 'Score de Risque',
    safe: 'Sûr',
    low: 'Risque Faible',
    medium: 'Risque Moyen',
    high: 'Risque Élevé',
    critical: 'Critique',
    report_scam: 'Signaler une Arnaque',
    submit_report: 'Soumettre le Rapport',
    lessons: 'Leçons',
    quizzes: 'Quiz',
    certificate: 'Certificat',
    points: 'Points',
    notifications: 'Notifications',
    dark_mode: 'Mode Sombre',
    light_mode: 'Mode Clair',
    search: 'Rechercher',
    filter: 'Filtrer',
    all: 'Tout',
    pending: 'En attente',
    investigating: 'En cours d’enquête',
    resolved: 'Résolu',
    dismissed: 'Rejeté',
    total_scans: 'Analyses Totales',
    high_risk: 'Risques Élevés Interceptés',
    total_reports: 'Rapports Communautaires',
    certified: 'Apprenants Certifiés',
    broadcast: 'Alerte de Diffusion',
    manage_users: 'Gérer les Utilisateurs',
    moderate_reports: 'Modérer les Rapports',
    no_results: 'Aucun résultat trouvé',
    welcome: 'Bon retour',
    demo_login: 'Essayer la Démo',
    take_quiz: 'Faire le Quiz',
    read_lesson: 'Lire la Leçon',
    question_of: 'Question',
    of: 'sur',
    your_answer: 'Votre réponse',
    correct_answer: 'Bonne réponse',
    back_to_lessons: 'Retour aux Leçons',
    completed_badge: 'Terminé',
    certificate_title: 'Certificat de Réussite',
    cert_certifies: 'Ceci certifie que',
    cert_completed: 'a terminé toutes les leçons de cybersécurité',
    issue_certificate: 'Délivrer le Certificat',
    print: 'Imprimer',
    academy_subtitle: 'Apprenez à vous protéger contre les menaces en ligne',
    all_complete: 'Toutes les leçons sont terminées !',
    all_complete_sub: 'Vous avez obtenu un certificat vérifiable',
    pass_msg: 'Réussi ! +30 points',
    fail_msg: 'Réessayez - il faut 60% pour réussir',
    sign_in_account: "Connectez-vous à votre compte",
    create_account: 'Créer un nouveau compte',
    full_name: 'Nom Complet',
    email: 'E-mail',
    password: 'Mot de passe',
    name_required: 'Nom requis',
    auth_error: 'E-mail ou mot de passe invalide',
    email_exists: 'Cet e-mail est déjà enregistré',
    no_account: "Vous n'avez pas de compte ?",
    have_account: 'Vous avez déjà un compte ?',
    ai_scanner: 'Détecteur IA',
    states_18: '18 États',
    free_forever: 'Gratuit à Vie',
    progress_label: 'Progression des Leçons',
  }
}

// Pre-seeded data
export const DEFAULT_USERS: User[] = [
  {
    id: 'admin-001', name: 'Adaeze Okonkwo', email: 'admin.cybershield.ng@gmail.com',
    password: 'admin123', is_admin: true, created_at: '2024-01-15T10:00:00Z',
    points: 500, certificates: ['CERT-2024-001'],
    mfa_enabled: true, mfa_method: 'email', backup_codes: ['4738-2105', '8192-4460', '3057-9918', '6621-7743', '1284-0336'],
    plan: 'enterprise', billing_cycle: 'yearly', credits: { scans: 999, exports: 999 },
    subscription_expires_at: '2025-12-31T23:59:59Z', transactions: []
  },
  {
    id: 'user-001', name: 'Chidi Okafor', email: 'chidi@gmail.com',
    password: 'user123', is_admin: false, created_at: '2024-03-20T14:30:00Z',
    points: 120, certificates: [],
    mfa_enabled: false, mfa_method: 'email', backup_codes: [],
    plan: 'free', billing_cycle: 'monthly', credits: { scans: 2, exports: 1 },
    subscription_expires_at: null, transactions: []
  },
  {
    id: 'user-002', name: 'Amina Yusuf', email: 'amina@yahoo.com',
    password: 'user123', is_admin: false, created_at: '2024-04-10T09:00:00Z',
    points: 80, certificates: [],
    mfa_enabled: false, mfa_method: 'email', backup_codes: [],
    plan: 'pro', billing_cycle: 'monthly', credits: { scans: 50, exports: 99 },
    subscription_expires_at: '2025-03-15T23:59:59Z', transactions: []
  },
  {
    id: 'user-003', name: 'Emeka Nwosu', email: 'emeka@outlook.com',
    password: 'user123', is_admin: false, created_at: '2024-05-01T11:00:00Z',
    points: 200, certificates: ['CERT-2024-002'],
    mfa_enabled: true, mfa_method: 'email', backup_codes: ['9012-5534', '2276-8109', '5548-1920', '3390-6671', '8812-0456'],
    plan: 'free', billing_cycle: 'monthly', credits: { scans: 0, exports: 0 },
    subscription_expires_at: null, transactions: []
  }
]

export const DEFAULT_REPORTS: Report[] = [
  {
    id: 'rpt-001', user_id: 'user-001', user_name: 'Chidi Okafor',
    title: 'Fake GTBank SMS asking for BVN verification',
    description: 'Received an SMS claiming my GTBank account will be suspended unless I provide my BVN via a link. The link goes to a non-gtbank domain.',
    scam_type: 'BVN/NIN Fraud', status: 'resolved', location: 'Lagos',
    reported_at: '2024-06-15T08:30:00Z', updated_at: '2024-06-18T10:00:00Z'
  },
  {
    id: 'rpt-002', user_id: 'user-002', user_name: 'Amina Yusuf',
    title: 'WhatsApp hijacking via 6-digit code scam',
    description: 'Someone called pretending to be MTN customer care asking me to share a 6-digit code sent to my phone. After sharing, my WhatsApp was locked.',
    scam_type: 'WhatsApp Hijacking', status: 'investigating', location: 'Kano',
    reported_at: '2024-07-02T14:20:00Z', updated_at: '2024-07-05T09:00:00Z'
  },
  {
    id: 'rpt-003', user_id: 'user-003', user_name: 'Emeka Nwosu',
    title: 'Fake OPay debit alert tricking POS operators',
    description: 'A customer showed a fake OPay payment confirmation. The alert looked real but no money came through. Lost N45,000.',
    scam_type: 'Fake Alert', status: 'pending', location: 'Anambra',
    reported_at: '2024-07-20T16:45:00Z', updated_at: '2024-07-20T16:45:00Z'
  },
  {
    id: 'rpt-004', user_id: 'user-001', user_name: 'Chidi Okafor',
    title: 'Crypto doubling scam on Instagram',
    description: 'An account claiming to be a crypto exchange promised to double any amount sent in Bitcoin. They took N200,000 and disappeared.',
    scam_type: 'Crypto Scam', status: 'investigating', location: 'Abuja (FCT)',
    reported_at: '2024-07-25T11:00:00Z', updated_at: '2024-07-28T14:00:00Z'
  },
  {
    id: 'rpt-005', user_id: 'user-002', user_name: 'Amina Yusuf',
    title: 'Loan app contacts all phone numbers for harassment',
    description: 'Downloaded a quick loan app, defaulted by 2 days, and they started calling all my contacts with defamatory messages.',
    scam_type: 'Loan App Harassment', status: 'resolved', location: 'Rivers',
    reported_at: '2024-08-01T09:30:00Z', updated_at: '2024-08-05T11:00:00Z'
  }
]

export const DEFAULT_ALERTS: Alert[] = [
  {
    id: 'alert-001', severity: 'critical',
    title: 'New BVN Phishing Wave Detected',
    message: 'Scammers are sending SMS claiming to be from CBN asking users to "verify BVN" via suspicious links. NEVER share your BVN via SMS or links.',
    created_at: '2024-08-10T08:00:00Z', active: true
  },
  {
    id: 'alert-002', severity: 'warning',
    title: 'Fake OPay/PalmPay Alert Apps Spreading',
    message: 'Android apps that generate fake payment alerts are circulating in POS agent communities. Always verify transactions in your bank app directly.',
    created_at: '2024-08-08T12:00:00Z', active: true
  },
  {
    id: 'alert-003', severity: 'info',
    title: 'CyberShield Academy: New Course Available',
    message: 'Our new "Mobile Money Security" course is now live. Complete it to earn a verifiable certificate and 50 bonus points.',
    created_at: '2024-08-05T10:00:00Z', active: false
  }
]

export const LESSONS: Lesson[] = [
  {
    id: 'lesson-001',
    title: 'Phishing & Social Engineering',
    title_ha: `Fishing da Gwagwarmayar Jama'a`,
    description: 'Learn to identify phishing attempts targeting Nigerian bank customers through SMS, email, and phone calls.',
    description_ha: 'Koyi yadda za a gano ƙoƙarin fishing masu nufin abokan ciniki na bankunan Najeriya ta hanyar SMS, imel, da kira waya.',
    content: `Phishing is the most common cyberattack in Nigeria. Scammers impersonate banks (GTBank, Zenith, Access, UBA), telcos (MTN, Airtel, Glo), and fintechs (OPay, PalmPay, Moniepoint).

Key signs of phishing:
1. Urgency: "Your account will be suspended in 24 hours"
2. Request for sensitive info: BVN, PIN, OTP, passwords
3. Suspicious links that don't match official domains
4. Poor grammar or unusual sender numbers
5. Too-good-to-be-true offers (lottery wins, free money)

Always verify through official channels. Banks NEVER ask for your full PIN or OTP via phone or SMS.`,
    content_ha: `Fishing ita ce mafi yawan hari na yanar gizo a Najeriya. Masu zamba suna kamala sunayen bankuna (GTBank, Zenith, Access, UBA), kamfanonin waya (MTN, Airtel, Glo), da kamfanonin kuɗi (OPay, PalmPay, Moniepoint).

Alamu na fishing:
1. Gaggawa: "Hankinka za a dakata cikin sa'o'i 24"
2. Bucen bayanan sirri: BVN, PIN, OTP, kalmar sirri
3. Haɗin da ba su dace da sanannun wurare ba
4. Harshe mara kyau ko lambobin mai aikawa ba a saba da su ba
5. Shawarwari masu kyau sosai (nasarar lotiri, kuɗi kyauta)

Koyaushe tabbatar ta hanyoyin hukuma. Bankuna BA SU BUƘATA PIN ɗinka cikakke ko OTP ta waya ko SMS.`,
    duration_min: 15,
    quiz: {
      id: 'quiz-001', lesson_id: 'lesson-001',
      questions: [
        {
          id: 'q1', text: 'A "GTBank" SMS asks you to click a link to verify your BVN. What should you do?',
          text_ha: 'SMS ɗin "GTBank" yana bukatar ka danna haɗi don tabbatar da BVN ɗinka. Me za ka yi?',
          options: ['Click the link and enter your BVN', 'Delete and report the message', 'Forward to friends to warn them', 'Reply asking if it is legitimate'],
          options_ha: ['Danna haɗin ka shigar da BVN ɗinka', 'Share sakon ka gabatar da rahoto', 'Aika ga abokai don hada su kai', 'Amsa tambaya idan halitta ce'],
          correct_index: 1,
          explanation: 'Legitimate banks never ask for BVN verification via SMS links. Delete and report to your bank via official channels.',
          explanation_ha: 'Bankuna masu inganci ba su buƙaci tabbatar da BVN ta hanyar haɗin SMS. Share sakon ka gabatar da rahoto ga bankinka ta hanyoyin hukuma.'
        },
        {
          id: 'q2', text: 'Which of these is a common phishing tactic in Nigeria?',
          text_ha: 'Wanne daga cikin waɗannan hanya ce ta fishing da aka fi sani da ita a Najeriya?',
          options: ['Asking for your account number', 'Requesting your OTP or PIN', 'Sending promotional SMS', 'Updating app terms'],
          options_ha: ['Bucen lambar hankinka', 'Bucen OTP ɗinka ko PIN', 'Aika SMS na tallafi', 'Sabunta sharuɗɗan aikace-aikacen'],
          correct_index: 1,
          explanation: 'OTP and PIN are sensitive credentials. No legitimate organization will ask for these via SMS, phone, or email.',
          explanation_ha: 'OTP da PIN suna da mahimmanci. Babu wata kungiya mai inganci za ta buƙaci waɗannan ta SMS, waya, ko imel.'
        },
        {
          id: 'q3', text: "You receive a call from someone claiming to be your bank's customer care. They ask for your full card number and PIN. This is:",
          text_ha: "Ka karɓi kira daga wanda ke cewa yana wakiltar bankinka. Suna buƙatar lambar kadanka cikakke da PIN. Wannan yana nufin:",
          options: ['Legitimate - banks verify identity this way', 'A scam - banks never ask for PIN', 'Safe if they know your name', 'Only risky for new accounts'],
          options_ha: ['Halitta - bankuna suna tabbatar da asali ta wannan hanya', 'Zamba - bankuna ba su buƙaci PIN koyaushe', 'Tsaro idan sun san sunanka', 'Haɗari ne kawai ga sabbin hankali'],
          correct_index: 1,
          explanation: 'Banks NEVER ask for your PIN, full card number, or CVV over the phone. Hang up and call the official number on your card.',
          explanation_ha: 'Bankuna BA SU BUƘATA PIN ɗinka, lambar kadanka cikakke, ko CVV ta waya. Rufe waya ka kira lambar hukuma akan kadanka.'
        }
      ]
    }
  },
  {
    id: 'lesson-002',
    title: 'Mobile Banking & USSD Security',
    title_ha: 'Bankin Waya & Tsaron USSD',
    description: 'Protect yourself when using mobile banking apps, USSD codes, and POS terminals in Nigeria.',
    description_ha: `Kare kanka yayin amfani da aikace-aikacen bankin waya, lambobin USSD, da na'urorin POS a Najeriya.`,
    content: `Mobile banking is convenient but comes with risks specific to Nigeria's fintech landscape.

USSD Security:
- Never dial USSD codes sent by strangers
- Be wary of "*737#" or "*894#" prompts from suspicious sources
- Always check the session timeout and complete transactions in private

POS Terminal Safety:
- Count your cash BEFORE the attendant leaves
- Check the amount on the POS screen matches your request
- Never let the POS operator handle your card unsupervised
- Be aware of "reversal" scams where they claim the transaction failed

Mobile Money (OPay, PalmPay, MoMo):
- Enable transaction alerts for ALL movements
- Never approve a payment you didn't initiate
- Use biometric locks on your payment apps
- Verify recipient names before sending money`,
    content_ha: `Bankin waya yana da sauƙi amma yana da haɗari na musamman ga yanayin kuɗin dijital na Najeriya.

Tsaron USSD:
- Koyaushe ka guji lambobin USSD da ba ka sani ba
- Ka yi hankali kan "*737#" ko "*894#" daga tushen da ba a amincewa ba
- Koyaushe duba lokacin daidaitawa kuma kammala ma'amaloli a cikin sirri

Tsaron Na'urar POS:
- Lissafa kuɗinka KA'BAN DA mai hidima ya tafi
- Duba adadin akan allo ya dace da buƙatarka
- Ka bar mai amfani da POS ya sarrafa kadanka ba tare da kulawa ba
- Ka sanin ƙoƙarin "mayar da kuɗi" inda suke ce ma'amala ta kasa

Kuɗin Waya (OPay, PalmPay, MoMo):
- Kunna sanarwar ma'amala ga DUK motsi
- Ka ki amincewa da biya ba ka fara ba
- Yi amfani da rumbun biometric akan aikace-aikacen biya
- Tabbatar sunayen mai karɓa kafin aika kuɗi`,
    duration_min: 12,
    quiz: {
      id: 'quiz-002', lesson_id: 'lesson-002',
      questions: [
        {
          id: 'q4', text: 'A POS attendant says "the transaction failed" and asks you to try again. What should you do first?',
          text_ha: `Mai hidimar POS ya ce "ma'amala ta kasa" kuma ya bukatar ka sake gwadawa. Me za ka fara?`,
          options: ['Try again immediately', 'Check your bank app for the actual balance', 'Give them your PIN to retry', 'Leave without checking'],
          options_ha: ['Sake gwadawa nan take', 'Duba aikin bankinka don sanin adadin da a zahiri', 'Ba su PIN ɗinka don sake gwadawa', 'Fita ba tare da dubawa ba'],
          correct_index: 1,
          explanation: 'Always verify in your own banking app before retrying. This is a common "double charge" scam at POS terminals.',
          explanation_ha: `Koyaushe tabbatar a cikin aikin bankinka kafin sake gwadawa. Wannan zamba ce ta "cika biyu" da aka fi sani a na'urorin POS.`
        },
        {
          id: 'q5', text: 'Which is the safest practice for mobile money apps?',
          text_ha: 'Wane ne mafi tsaro aikace-aikacen kuɗin waya?',
          options: ['Share your login with a trusted friend', 'Enable biometric lock and transaction alerts', 'Use the same password for all apps', 'Save your PIN in your phone notes'],
          options_ha: ['Raba shigar ka da abokin aminci', `Kunna rumbun biometric da sanarwar ma'amala`, 'Yi amfani da kalmar sirri ɗaya ga duk aikace-aikace', 'Ajiye PIN ɗinka a rubuce-rubucen wayarka'],
          correct_index: 1,
          explanation: 'Biometric locks and real-time alerts are your first line of defense against unauthorized transactions.',
          explanation_ha: `Rumbun biometric da sanarwar lokaci-ne-lokaci sune layin farko na kariya daƙile ma'amalar da ba a ba da izini ba.`
        }
      ]
    }
  },
  {
    id: 'lesson-003',
    title: 'SIM Swap & BVN/NIN Protection',
    title_ha: 'Canjin SIM & Kare BVN/NIN',
    description: 'Understand SIM swap attacks and how to protect your Bank Verification Number and National ID.',
    description_ha: 'Fahimci harbin canjin SIM da yadda za a kare Lambar Tabbatar da Banki da Takardar Shaida ta ƙasa.',
    content: `SIM Swap attacks are devastating in Nigeria because your phone number is tied to your banking identity.

How SIM Swap Works:
1. Attacker gathers your personal info (name, DOB, NIN, address)
2. They visit a telco office with fake ID or bribe staff
3. Your SIM is deactivated, theirs is activated with your number
4. They intercept OTPs and reset your banking passwords

Protecting Your BVN:
- Your BVN links ALL your bank accounts
- Never share it on social media or with unverified parties
- If compromised, visit ALL your banks immediately to flag it
- Regularly check if unknown accounts are linked to your BVN

Protecting Your NIN:
- NIN is your master identity document
- Scammers use it for SIM registration fraud
- Monitor for unauthorized SIM registrations via telco USSD codes
- Report lost/delayed SIM replacements immediately

Key USSD codes: Check NIN-linked SIMs via *346*4# (MTN), *785*4# (Glo)`,
    content_ha: `Harbin canjin SIM suna da tsoro a Najeriya saboda lambar wayarka ta haɗu da asalin bankinka.

Yadda Canjin SIM Yake Aiki:
1. Mai hari yana tattara bayanan sirrinka (sunan, ranar haihuwa, NIN, adireshi)
2. Suna tafiya ofishin waya da takarda shaida ƙarya ko ba da riba
3. SIM ɗinka ana kashe shi, sunan su ne aka kunna da lambar ka
4. Suna tsoratar da OTPs da sake saitin kalmar sirrin bankinka

Kare BVN ɗinka:
- BVN ɗinka yana haɗa DUK hankankin bankinka
- Ka raba shi a shafukan sada zumunta ko da waɗanda ba a tabbatar ba
- Idan an lalata, ziyarci duk bankuna nan take don alama
- Koyaushe duba idan akwai hankali maras sani da ke haɗe da BVN ɗinka

Kare NIN ɗinka:
- NIN ita ce takardar asalin ka
- Masu zamba suna amfani da ita don jarrabawar SIM
- Kula da rajistar SIM mara izini ta hanyar lambobin USSD
- Gabatar da rahoton maye gurbin SIM da asara/lagawa nan take

Lambobin USSD: Duba SIMs da NIN ta *346*4# (MTN), *785*4# (Glo)`,
    duration_min: 18,
    quiz: {
      id: 'quiz-003', lesson_id: 'lesson-003',
      questions: [
        {
          id: 'q6', text: 'Your phone suddenly shows "No Service" and you suspect a SIM swap. What is your FIRST action?',
          text_ha: 'Wayarka ta nuna "Babu Hidima" ba tare da sanin abin da ya faru ba kuma kana tsoron canjin SIM. Menene FARKO da za ka yi?',
          options: ['Wait and see if service returns', 'Call your bank to freeze accounts and visit telco immediately', 'Post about it on social media', 'Buy a new SIM from another network'],
          options_ha: ['Jira ka ga idan hidima ta koma', 'Kira bankinka don dakatar da hankali ka tafi kamfanin waya nan take', 'Rubuta game da shi a shafukan sada zumunta', 'Sayar da sabon SIM daga wani sadarwa'],
          correct_index: 1,
          explanation: 'Speed is critical. Call your banks to freeze accounts, then rush to your telco to recover your SIM. Every minute counts.',
          explanation_ha: 'Gaggawa ita ce muhimmiyar abu. Kira bankunka don dakatar da hankali, sannan ka gudana kamfanin wayarku don dawo da SIM ɗinka. Kowane minti yana da muhimmanci.'
        },
        {
          id: 'q7', text: 'Why is sharing your BVN on social media dangerous?',
          text_ha: 'Me ya sa rarraba BVN ɗinka a shafukan sada zumunta haɗari ne?',
          options: ['It is illegal to share BVN publicly', 'Anyone with your BVN can potentially access linked bank accounts', 'It will get your account suspended', 'Nothing, BVN is safe to share'],
          options_ha: ['Haramun ne a rarraba BVN a fili', 'Kowa da ke da BVN ɗinka zai iya shiga hankalin banki da ke haɗe', 'Za a dakatar da hankalki', 'Babu komai, BVN tsaro ne a rarraba'],
          correct_index: 1,
          explanation: 'Your BVN links all your bank accounts. Combined with social engineering, criminals can use it to access your funds.',
          explanation_ha: 'BVN ɗinka yana haɗa duk hankankin bankinka. Haɗa da injiniyancin zamantakewa, masu laifi za su iya amfani da shi don shiga kuɗinka.'
        }
      ]
    }
  },
  {
    id: 'lesson-004',
    title: 'Ransomware, Loan Apps & Digital Extortion',
    title_ha: 'Ransomware, Aikace-aikacen Amintitta & Zamba Dijital',
    description: 'Recognize and respond to ransomware attacks, predatory loan apps, and digital blackmail schemes.',
    description_ha: 'Sanya hannu da amsa ga harbin ransomware, aikace-aikacen amintitta masu ci, da tsare-tsaren zamba dijital.',
    content: `Digital extortion is rapidly growing in Nigeria through predatory loan apps and ransomware.

Predatory Loan Apps:
- Apps like "CreditPlus", "Okash", "Renmoney" (unlicensed variants) access your contacts, gallery, and SMS
- When you default (even by hours), they blast defamatory messages to ALL your contacts
- Some threaten to release intimate photos (if they accessed your gallery)
- NEVER download loan apps from outside Play Store/App Store
- Check CBN's list of licensed Microfinance banks
- Report to FCCPC (Federal Competition and Consumer Protection Commission)

Ransomware in Nigeria:
- Often spread through fake "invoice" or "delivery" emails
- Encrypts files and demands payment in cryptocurrency
- Prevention: Regular backups, don't open unexpected attachments, keep software updated
- Response: Disconnect from network, report to NITDA, do NOT pay

What to do if harassed by a loan app:
1. Document everything (screenshots, messages)
2. Report to FCCPC via their complaint portal
3. Report to Nigeria Police Cybercrime Unit
4. Warn your contacts that your data was breached
5. Change all passwords and enable 2FA everywhere`,
    content_ha: `Zamba dijital tana girma cikin sauri a Najeriya ta hanyar aikace-aikacen amintitta da ransomware.

Aikace-aikacen Amintitta Masu Ci:
- Aikace-aikace kamar "CreditPlus", "Okash", "Renmoney" (sigogi marasa lasisi) suna samun damar abokin hulɗarka, gidan hoto, da SMS
- Lokacin da ka yi rashin biya (ko da awanni), suna aika sakonnin lalata ga DUK abokin hulɗarka
- Wasu suna ciniki da fitar da hotuna sirri (idan sun shiga gidan hotonka)
- KA BARKWALE aikace-aikacen amintitta daga waje Play Store/App Store
- Duba jerin bankunan Microfinance da CBN ta lasisi
- Gabatar da rahoto ga FCCPC (Kungiyar Kula Da Gaske da Kare Abokan Ciniki)

Ransomware a Najeriya:
- Yawanci ya bazu ta imel ƙarya "takardar biya" ko "aikawa"
- Ya tsire fayilomi kuma ya bukaci biya da kuɗin dijital
- Hana: Ayyukan ɓangare na yau da kullum, ka buɗe ƙarfafa ba a saba da su, ka riƙe software sabon abu
- Amsa: Ka warware daga cibiya, gabatar da rahoto ga NITDA, KA BIYA

Abin da za a yi idan an yi maka zamba ta aikace-aikacen amintitta:
1. Rubuta komai (hotuna, sakonni)
2. Gabatar da rahoto ga FCCPC ta portal ɗinsu
3. Gabatar da rahoto ga Ma'aikatar Tsaron Yanar Gizo ta Najeriya
4. Hada abokin hulɗarka cewa an buga bayanan ka
5. Canza duk kalmar sirri kunna 2FA a ko'ina`,
    duration_min: 14,
    quiz: {
      id: 'quiz-004', lesson_id: 'lesson-004',
      questions: [
        {
          id: 'q8', text: 'A loan app is threatening to share your photos with all contacts. What should you do?',
          text_ha: 'Aikace-aikacen amintitta yana ciniki da rarraba hotunka da duk abokin hulɗarka. Me za ka yi?',
          options: ['Pay them immediately to delete the data', 'Screenshot evidence and report to FCCPC', 'Delete the app and ignore them', 'Ask friends to help threaten them back'],
          options_ha: ['Biye da su nan take don share bayanai', 'Hoton shaida ka gabatar da rahoto ga FCCPC', 'Share aikace-aikacen ka ka yi masa hakuri', 'Tambaya abokai don taimaka maka ciniki dasu'],
          correct_index: 1,
          explanation: 'Never pay extortionists. Document the threats and report to FCCPC and the Police Cybercrime Unit. They have the power to shut down illegal apps.',
          explanation_ha: `Koyaushe ka ki biyan masu zamba. Rubuta cinikayen ka gabatar da rahoto ga FCCPC da Ma'aikatar Tsaron Yanar Gizo. Suna da ƙarfin rufe aikace-aikacen da ba a yarda da su ba.`
        },
        {
          id: 'q9', text: 'Which is the best prevention against ransomware?',
          text_ha: 'Wane ne mafi kyau hana harbin ransomware?',
          options: ['Install multiple antivirus apps', 'Regular offline backups and not opening unexpected attachments', 'Never use email', 'Only use government websites'],
          options_ha: ['Shigar da yawancin aikace-aikacen antivirus', 'Ayyukan ɓangare na yau da kullum da kuma buɗe ƙarfafa ba a saba da su', 'Koyaushe ka guji imel', 'Yi amfani da shafukan yanar gizon gwamnati kawai'],
          correct_index: 1,
          explanation: 'The combination of regular backups (stored offline) and cautious email habits prevents most ransomware attacks.',
          explanation_ha: `Haɗin ayyukan ɓangare (da aka ajiye a wajen intanet) da al'adun imel mai hankali suna hana yawancin harbin ransomware.`
        }
      ]
    }
  }
]

export const FREE_SCAN_LIMIT = 3

export const PRICING_PLANS = [
  {
    id: 'pro',
    name: 'Pro Plan',
    description: 'Unlimited AI scam analysis for individuals',
    priceMonthly: 9.99,
    priceYearly: 99.99,
    priceNgnMonthly: 12500,
    priceNgnYearly: 125000,
    scans: 'unlimited',
    exports: 'unlimited',
    features: ['Unlimited AI Scans', 'Priority Analysis', 'Email Support', 'Basic Export'],
    badge: 'Most Popular',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'Batch scanning & team seats for organizations',
    priceMonthly: 29.99,
    priceYearly: 299.99,
    priceNgnMonthly: 37500,
    priceNgnYearly: 375000,
    scans: 'unlimited',
    exports: 'unlimited',
    features: ['Everything in Pro', 'Batch Scanning', 'Team Seats (up to 10)', 'API Access', 'Dedicated Support'],
    badge: 'Best Value',
  },
] as const

export const CREDIT_BUNDLES = [
  { id: 'bundle-10', label: '10 Scans', scans: 10, priceUsd: 3, priceNgn: 3750 },
  { id: 'bundle-50', label: '50 Scans', scans: 50, priceUsd: 12, priceNgn: 15000, savings: 'Save 20%' },
  { id: 'bundle-100', label: '100 Scans', scans: 100, priceUsd: 20, priceNgn: 25000, savings: 'Save 33%' },
] as const

export const PAYMENT_GATEWAYS = ['card', 'bank', 'paystack', 'flutterwave', 'crypto'] as const

export function getRiskLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 10) return 'safe'
  if (score <= 30) return 'low'
  if (score <= 55) return 'medium'
  if (score <= 75) return 'high'
  return 'critical'
}

export function analyzeText(text: string): { score: number; flags: string[]; scamType: string; explanation: string } {
  const lower = text.toLowerCase()
  let score = 0
  const flags: string[] = []
  let scamType = 'Unknown'

  for (const [keyword, weight] of Object.entries(SCAM_KEYWORDS)) {
    if (lower.includes(keyword)) {
      score += weight
      flags.push(keyword.toUpperCase())
    }
  }

  if (NIGERIAN_PHONE_PATTERN.test(text)) score += 5
  if (text.length > 0 && /[A-Z]{10,}/.test(text)) score += 10
  if ((text.match(/!/g) || []).length > 3) score += 8
  if (/call.*\\d{10,14}/.test(lower)) score += 12

  score = Math.min(100, score)

  if (flags.some(f => ['BVN', 'NIN', 'BANK VERIFICATION NUMBER'].includes(f))) scamType = 'BVN/NIN Fraud'
  else if (flags.some(f => ['OTP', 'PIN', 'PASSWORD'].includes(f))) scamType = 'Credential Theft'
  else if (flags.some(f => ['LOTTERY', 'WINNER', 'PRIZE'].includes(f))) scamType = 'Lottery Scam'
  else if (flags.some(f => ['CRYPTO', 'BITCOIN', 'DOUBLING'].includes(f))) scamType = 'Crypto Scam'
  else if (flags.some(f => ['LOAN', 'PAY LATER'].includes(f))) scamType = 'Loan Scam'
  else if (flags.some(f => ['URGENT', 'IMMEDIATELY', 'ACT NOW'].includes(f))) scamType = 'Urgency Scam'
  else if (flags.some(f => ['TRANSFER', 'SEND MONEY'].includes(f))) scamType = 'Transfer Fraud'
  else if (flags.some(f => ['DEAR', 'MY DARLING'].includes(f))) scamType = 'Romance Scam'

  const explanation = score > 0
    ? `Detected ${flags.length} suspicious indicator(s). ${scamType !== 'Unknown' ? `Pattern matches ${scamType}.` : 'Multiple red flags present.'} Exercise caution and verify through official channels.`
    : 'No significant scam indicators detected. This message appears safe based on our heuristic analysis.'

  return { score, flags, scamType, explanation }
}

export function analyzeUrl(url: string): { score: number; flags: string[]; scamType: string; explanation: string } {
  let score = 0
  const flags: string[] = []
  let scamType = 'Suspicious URL'

  for (const { pattern, weight, label } of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(url.toLowerCase())) {
      score += weight
      flags.push(label)
    }
  }

  score = Math.min(100, score)

  const explanation = score > 0
    ? `Detected ${flags.length} suspicious pattern(s). ${scamType !== 'Unknown' ? `Pattern matches ${scamType}.` : 'Multiple red flags present.'} Do not visit this URL.`
    : 'URL appears safe based on our analysis.'

  return { score, flags, scamType, explanation }
}