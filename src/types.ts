export type PlanTier = 'free' | 'pro' | 'enterprise'
export type BillingCycle = 'monthly' | 'yearly'
export type PaymentMethod = 'card' | 'bank' | 'paystack' | 'flutterwave' | 'crypto'

export interface PricingPlan {
  id: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  priceNgnMonthly: number
  priceNgnYearly: number
  scans: 'unlimited' | number
  exports: 'unlimited' | number
  features: string[]
  badge?: string
  popular?: boolean
}

export interface Invoice {
  id: string
  description: string
  amount: number
  currency: 'NGN' | 'USD'
  paymentMethod: PaymentMethod
  planId?: string
  createdAt: string
}

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  currency: 'NGN' | 'USD'
  payment_method: PaymentMethod
  status: 'completed' | 'pending' | 'failed'
  invoice_url: string
  created_at: string
}

export interface CreditBundle {
  id: string
  label: string
  scans: number
  priceUsd: number
  priceNgn: number
  savings?: string
  popular?: boolean
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  is_admin: boolean;
  created_at: string;
  points: number;
  certificates: string[];
  // Multi-Factor Authentication (MFA / 2FA) fields
  mfa_enabled: boolean;
  mfa_method: 'email' | 'authenticator';
  backup_codes: string[];
  // Commercial billing fields
  plan: PlanTier;
  billing_cycle: BillingCycle;
  credits: { scans: number; exports: number };
  subscription_expires_at: string | null;
  transactions: Transaction[];
}

export interface Scan {
  id: string;
  user_id: string;
  scan_type: 'text' | 'url' | 'image';
  content: string;
  risk_score: number;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  scam_type: string;
  explanation: string;
  flags: string[];
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  description: string;
  scam_type: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  location: string;
  reported_at: string;
  updated_at: string;
}

export type SupportedLang = 'en' | 'ha' | 'pcm' | 'yo' | 'ig' | 'fr'

export interface Question {
  id: string;
  text: string;
  text_ha?: string;
  text_pcm?: string;
  text_yo?: string;
  text_ig?: string;
  text_fr?: string;
  options: string[];
  options_ha?: string[];
  options_pcm?: string[];
  options_yo?: string[];
  options_ig?: string[];
  options_fr?: string[];
  correct_index: number;
  explanation: string;
  explanation_ha?: string;
  explanation_pcm?: string;
  explanation_yo?: string;
  explanation_ig?: string;
  explanation_fr?: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  title_ha?: string;
  title_pcm?: string;
  title_yo?: string;
  title_ig?: string;
  title_fr?: string;
  description: string;
  description_ha?: string;
  description_pcm?: string;
  description_yo?: string;
  description_ig?: string;
  description_fr?: string;
  content: string;
  content_ha?: string;
  content_pcm?: string;
  content_yo?: string;
  content_ig?: string;
  content_fr?: string;
  quiz: Quiz;
  duration_min: number;
}

export interface UserProgress {
  lessons_completed: string[];
  quiz_scores: Record<string, number>;
  total_points: number;
  current_lesson_id: string | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  recipient_name: string;
  certificate_id: string;
  issued_date: string;
  security_seal: string;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  created_at: string;
  active: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  alert_id: string;
  read: boolean;
  created_at: string;
}

export type OTPPurpose = 'login' | 'register' | 'stepup'

export interface OtpPending {
  purpose: OTPPurpose
  email: string
  name?: string
  password?: string
  pendingUser?: User | null
  currentOtp: string
}