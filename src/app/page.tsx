'use client'

import Link from 'next/link'
import { useState, useEffect, createContext, useContext } from 'react'
import { motion, useScroll, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════
   Theme
   ═══════════════════════════════════════════ */

type Theme = 'dark' | 'light'
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} })
function useTheme() { return useContext(ThemeCtx) }

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    return () => { document.documentElement.removeAttribute('data-theme') }
  }, [theme])
  return <ThemeCtx value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>{children}</ThemeCtx>
}

/* ═══════════════════════════════════════════
   SVG Icons
   ═══════════════════════════════════════════ */

const s = { strokeWidth: 1.5, stroke: 'currentColor', fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function IconGlobe(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" /></svg>
}
function IconBuilding(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15M9 9v.01M9 12v.01M9 15v.01M17 9v.01M17 12v.01M17 15v.01" /></svg>
}
function IconUsers(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
function IconChart(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
}
function IconTarget(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
}
function IconPalette(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" /><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.1-.7-.4-1-.3-.3-.4-.7-.4-1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9-10-9z" /></svg>
}
function IconFileText(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
}
function IconLayout(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
}
function IconPhone(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
}
function IconMail(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
}
function IconShield(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
}
function IconCheck(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M20 6 9 17l-5-5" /></svg>
}
function IconPlus(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M12 5v14M5 12h14" /></svg>
}
function IconTrendingUp(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
}
function IconMessageSquare(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
}
function IconCamera(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
}
function IconSun(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
}
function IconMoon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={24} height={24} {...s} {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
}

/* ═══════════════════════════════════════════
   Data
   ═══════════════════════════════════════════ */

const heroStats = [
  { Icon: IconBuilding, value: '+200', label: 'مكتب عقاري' },
  { Icon: IconGlobe, value: '+15K', label: 'عقار مُدار' },
  { Icon: IconUsers, value: '+50K', label: 'عميل محتمل' },
  { Icon: IconChart, value: '6.8%', label: 'معدل التحويل' },
]

const features = [
  { Icon: IconGlobe, title: 'موقع إلكتروني مخصص', description: 'موقع احترافي بنطاقك الخاص يعرض عقاراتك وفريقك ومدونتك.', color: '#D4AF37' },
  { Icon: IconBuilding, title: 'إدارة العقارات', description: 'نظام شامل مع صور وفيديو وجولات 360 وبحث متقدم ثنائي اللغة.', color: '#3B82F6' },
  { Icon: IconTarget, title: 'نظام العملاء CRM', description: 'التقاط تلقائي للعملاء من النماذج والواتساب مع التوزيع على الوكلاء.', color: '#4ADE80' },
  { Icon: IconChart, title: 'تحليلات وتقارير', description: 'مؤشرات الأداء ومعدلات التحويل بتقارير قابلة للتصدير.', color: '#F59E0B' },
  { Icon: IconFileText, title: 'إدارة المحتوى', description: 'نظام تحرير ثنائي اللغة مع تصنيفات ووسوم متعددة.', color: '#A78BFA' },
  { Icon: IconPalette, title: 'هوية بصرية مخصصة', description: 'شعار وألوان ونطاق خاص يعكس هوية مكتبك العقاري.', color: '#FB923C' },
]

const websiteFeatures = [
  { Icon: IconGlobe, text: 'نطاق مخصص لمكتبك العقاري' },
  { Icon: IconUsers, text: 'صفحات تعريفية بالوكلاء' },
  { Icon: IconLayout, text: 'منشئ صفحات بالسحب والإفلات' },
  { Icon: IconPhone, text: 'تصميم متجاوب لجميع الأجهزة' },
]

const platformLeads = [
  { name: 'محمد العتيبي', source: 'واتساب', status: 'جديد', color: '#3B82F6', property: 'فيلا -- ابحر' },
  { name: 'سارة الحربي', source: 'نموذج الموقع', status: 'تواصل', color: '#F59E0B', property: 'شقة -- النرجس' },
  { name: 'فهد الدوسري', source: 'هاتف', status: 'معاينة', color: '#A78BFA', property: 'ارض -- الشاطئ' },
]

const platformStats = [
  { label: 'الزوار', value: '12,450', change: '+18%', Icon: IconChart },
  { label: 'العملاء المحتملون', value: '847', change: '+12%', Icon: IconTarget },
  { label: 'معدل التحويل', value: '6.8%', change: '+2.1%', Icon: IconTrendingUp },
]

const beforeItems = [
  { Icon: IconMessageSquare, text: 'واتساب للتواصل مع العملاء', detail: '63 رسالة بلا متابعة' },
  { Icon: IconFileText, text: 'جداول بيانات للعقارات', detail: 'آخر تحديث قبل اسبوعين' },
  { Icon: IconCamera, text: 'صور بدون تنظيم', detail: 'آلاف الصور في الجوال' },
  { Icon: IconGlobe, text: 'غياب الحضور الرقمي', detail: 'لا موقع إلكتروني للمكتب' },
]

const afterTags = ['موقع احترافي', 'نظام عملاء ذكي', 'تحليلات فورية', 'إدارة مركزية']

const plans = [
  { name: 'أساسي', subtitle: 'BASIC', price: '199', color: '#60A5FA', popular: false, features: ['موقع إلكتروني مخصص', 'حتى 50 عقار', 'وكيلان', 'نظام عملاء أساسي', 'نطاق فرعي falz.sa'] },
  { name: 'احترافي', subtitle: 'PRO', price: '499', color: '#D4AF37', popular: true, features: ['جميع مميزات الأساسي', 'عقارات غير محدودة', 'حتى 10 وكلاء', 'CRM متقدم', 'تحليلات وتقارير PDF', 'مدونة ثنائية اللغة', 'نطاق مخصص'] },
  { name: 'مؤسسي', subtitle: 'ENTERPRISE', price: '999', color: '#A78BFA', popular: false, features: ['جميع مميزات الاحترافي', 'وكلاء غير محدودين', 'منشئ صفحات', 'White Label كامل', 'واجهة برمجية API', 'مدير حساب مخصص'] },
]

const faqs = [
  { q: 'هل المنصة مناسبة للمكاتب الصغيرة؟', a: 'نعم. باقة "أساسي" مصممة للمكاتب الناشئة بسعر يبدأ من 199 ريال شهريا.' },
  { q: 'هل يُشترط ترخيص الهيئة العامة للعقار؟', a: 'نعم، المنصة مخصصة للمكاتب العقارية المرخصة. يتم التحقق من الترخيص عند التسجيل.' },
  { q: 'هل يمكن ربط نطاق خاص؟', a: 'نعم، في باقة "احترافي" وما فوق يمكنك ربط نطاقك المخصص بموقع مكتبك.' },
  { q: 'كيف يتم التقاط العملاء المحتملين؟', a: 'تلقائيا من نماذج الموقع ورسائل الواتساب والمكالمات، مع التوزيع التلقائي على الوكلاء.' },
  { q: 'هل المنصة تدعم اللغتين العربية والإنجليزية؟', a: 'نعم، المنصة ثنائية اللغة بالكامل مع دعم الاتجاهين RTL و LTR.' },
  { q: 'هل يمكن إلغاء الاشتراك في أي وقت؟', a: 'نعم، يمكن الإلغاء بنقرة واحدة دون أي رسوم إضافية.' },
]

const productLinks = [
  { label: 'الموقع الإلكتروني', href: '#platform' },
  { label: 'إدارة العقارات', href: '#features' },
  { label: 'نظام العملاء CRM', href: '#features' },
  { label: 'التحليلات والتقارير', href: '#features' },
  { label: 'منشئ الصفحات', href: '#features' },
  { label: 'إدارة المحتوى', href: '#features' },
]

const companyLinks = [
  { label: 'عن فلز', href: '#' },
  { label: 'الأسعار', href: '#pricing' },
  { label: 'الأسئلة الشائعة', href: '#' },
  { label: 'المدونة', href: '#' },
  { label: 'تواصل معنا', href: '#contact' },
]

const legalLinks = [
  { label: 'سياسة الخصوصية', href: '#' },
  { label: 'الشروط والأحكام', href: '#' },
  { label: 'اتفاقية الاستخدام', href: '#' },
]

const monthlyData = [45, 58, 42, 72, 85, 68, 92, 78]

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <ThemeProvider>
      <LandingContent />
    </ThemeProvider>
  )
}

function LandingContent() {
  const { scrollYProgress } = useScroll()
  const { theme, toggle } = useTheme()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* ══════════ NAVBAR ══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nav backdrop-blur-md border-b border-edge">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-black font-black text-sm">F</span>
            </div>
            <span className="text-xl font-black text-heading">
              FAL<span className="text-primary">Z</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-body">
            <a href="#features" className="hover:text-heading transition-colors">المميزات</a>
            <a href="#platform" className="hover:text-heading transition-colors">المنصة</a>
            <a href="#pricing" className="hover:text-heading transition-colors">الأسعار</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-lg border border-edge flex items-center justify-center hover:bg-card-hover transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <IconSun className="w-4 h-4 text-body" /> : <IconMoon className="w-4 h-4 text-body" />}
            </button>
            <Link href="/auth/signup" className="bg-primary text-black font-bold text-sm px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              ابدأ مجانا
            </Link>
          </div>
        </div>
        <motion.div className="h-0.5 bg-primary origin-right" style={{ scaleX: scrollYProgress }} />
      </nav>

      <main>
        {/* ══════════ HERO ══════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
          <div className="glow absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div className="text-center max-w-3xl mx-auto z-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 text-primary text-sm px-4 py-1.5 rounded-full mb-8" style={{ background: 'var(--badge-bg)', borderWidth: 1, borderColor: 'var(--badge-border)' }}>
              المنصة الرقمية المتكاملة للمكاتب العقارية
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 text-heading">
              تحكّم كامل بمكتبك العقاري
              <br />
              <span className="text-primary">من منصة واحدة.</span>
            </h1>

            <p className="text-body text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              موقع إلكتروني، إدارة عقارات، نظام عملاء، وتحليلات متقدمة -- في منصة واحدة متكاملة.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/auth/signup" className="bg-primary text-black font-bold text-lg px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-colors">
                ابدأ مجانا
              </Link>
              <Link href="/contact" className="border border-edge text-heading font-bold text-lg px-8 py-3.5 rounded-lg hover:bg-card-hover transition-colors">
                تواصل معنا
              </Link>
            </div>
          </motion.div>

          <motion.div className="mt-20 w-full max-w-3xl mx-auto grid grid-cols-4 gap-4 z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            {heroStats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.Icon className="w-5 h-5 mx-auto mb-2 text-primary/60" />
                <p className="text-2xl font-black text-heading">{stat.value}</p>
                <p className="text-xs text-dim">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section className="py-24 md:py-32 px-6 bg-alt transition-colors duration-300" id="features">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-sm font-bold tracking-[0.3em] text-primary uppercase">المميزات</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4 text-heading">مركز التحكّم <span className="text-primary">الكامل</span></h2>
              <p className="text-body text-lg max-w-lg mx-auto">كل ما يحتاجه مكتبك العقاري في منصة واحدة.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div key={i} className="bg-card border border-edge rounded-2xl p-6 hover:bg-card-hover transition-colors group" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color}10` }}>
                    <f.Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-base mb-1.5 text-heading group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-dim text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ BRANDED WEBSITES ══════════ */}
        <section className="py-24 md:py-32 px-6" id="platform">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-sm font-bold tracking-[0.3em] text-primary uppercase">الموقع الإلكتروني</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4 text-heading">موقع احترافي <span className="text-primary">باسم مكتبك</span></h2>
              <p className="text-body text-lg max-w-lg mx-auto">موقع إلكتروني متكامل يعرض عقاراتك وفريقك ومدونتك بهوية مكتبك.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-elevated rounded-2xl border border-edge overflow-hidden shadow-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-edge">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <div className="flex-1 mx-4"><div className="bg-input rounded-md px-3 py-1 text-xs text-dim text-center">alnakheel-realestate.falz.sa</div></div>
                </div>
                <div className="p-4 border-b border-edge">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/30 flex items-center justify-center text-[8px] font-black text-primary">ن</div>
                      <span className="text-xs font-black text-heading">النخيل العقارية</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-[9px] text-dim">
                      <span className="text-primary">الرئيسية</span><span>العقارات</span><span>الوكلاء</span><span>المدونة</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="bg-primary/[0.06] rounded-xl p-5 mb-4">
                    <p className="text-[10px] text-primary font-bold mb-1">النخيل العقارية</p>
                    <p className="text-sm font-black text-heading mb-1">اكتشف عقارك المثالي</p>
                    <p className="text-[9px] text-dim">+120 عقار متاح</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'شقة', price: '650K', detail: '120م - 3 غرف' },
                      { type: 'فيلا', price: '1.8M', detail: '280م - 4 غرف' },
                      { type: 'دوبلكس', price: '950K', detail: '200م - 3 غرف' },
                    ].map((p, i) => (
                      <motion.div key={i} className="bg-card rounded-lg p-2 border border-edge" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}>
                        <div className="h-10 bg-card-hover rounded mb-1.5 flex items-center justify-center"><IconBuilding className="w-4 h-4 text-dim" /></div>
                        <p className="text-[8px] text-primary font-bold">{p.type}</p>
                        <p className="text-[9px] font-black text-heading">{p.price} ر.س</p>
                        <p className="text-[7px] text-dim">{p.detail}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-3">
                {websiteFeatures.map((f, i) => (
                  <motion.div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-edge bg-card hover:bg-card-hover transition-colors" initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <f.Icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-bold text-sm text-heading">{f.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════ PLATFORM SHOWCASE (CRM + Analytics) ══════════ */}
        <section className="py-24 md:py-32 px-6 bg-alt transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-sm font-bold tracking-[0.3em] text-primary uppercase">CRM + تحليلات</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4 text-heading">تابع عملاءك وبياناتك <span className="text-primary">لحظة بلحظة</span></h2>
              <p className="text-body text-lg max-w-lg mx-auto">إدارة العملاء والتحليلات من لوحة تحكم واحدة.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-elevated rounded-2xl border border-edge overflow-hidden shadow-xl max-w-5xl mx-auto">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-edge">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-4"><div className="bg-input rounded-md px-3 py-1 text-xs text-dim text-center">falz.sa/dashboard</div></div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {platformStats.map((st, i) => (
                    <motion.div key={i} className="bg-card rounded-xl p-4 border border-edge" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                      <div className="flex items-center justify-between mb-2">
                        <st.Icon className="w-4 h-4 text-dim" />
                        <span className="text-[10px] font-bold text-green-500">{st.change}</span>
                      </div>
                      <p className="text-xl font-black text-primary">{st.value}</p>
                      <p className="text-[10px] text-dim mt-0.5">{st.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid md:grid-cols-5 gap-6">
                  <div className="md:col-span-2 bg-card rounded-xl p-4 border border-edge">
                    <p className="text-xs font-bold text-body mb-4">الزوار الشهريون</p>
                    <div className="flex items-end gap-2 h-24">
                      {monthlyData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <motion.div className="w-full rounded-t-sm bg-gradient-to-t from-primary/30 to-primary/60" initial={{ height: 0 }} whileInView={{ height: `${d}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-3 bg-card rounded-xl p-4 border border-edge">
                    <p className="text-xs font-bold text-body mb-4">آخر العملاء المحتملين</p>
                    <div className="space-y-2.5">
                      {platformLeads.map((lead, i) => (
                        <motion.div key={i} className="flex items-center justify-between" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.08 }}>
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-card-hover flex items-center justify-center">
                              <span className="text-[9px] font-black text-dim">{lead.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-heading">{lead.name}</p>
                              <p className="text-[9px] text-dim">{lead.property} / {lead.source}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${lead.color}15`, color: lead.color }}>{lead.status}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════ CHAOS TO SYSTEM ══════════ */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-heading">من الفوضى إلى <span className="text-primary">النظام</span></h2>
              <p className="text-body max-w-md mx-auto">تخلّص من الأدوات المبعثرة واجمع عملياتك في نظام واحد.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl p-6 border border-edge" style={{ background: 'color-mix(in srgb, var(--heading-clr) 4%, var(--page-bg))' }}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-dim" />
                  <span className="font-black text-sm text-dim">قبل Falz</span>
                </div>
                <div className="space-y-3">
                  {beforeItems.map((item, i) => (
                    <motion.div key={i} className="bg-card border border-edge rounded-xl p-3.5 flex items-center gap-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                      <item.Icon className="w-4 h-4 text-dim flex-shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-heading">{item.text}</p>
                        <p className="text-[11px] text-dim">{item.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-primary/[0.04] border border-primary/15 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="font-black text-sm text-primary">بعد Falz</span>
                </div>
                <div className="bg-elevated rounded-xl p-4 border border-edge">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[{ label: 'العقارات', value: '156' }, { label: 'العملاء', value: '847' }, { label: 'الوكلاء', value: '12' }, { label: 'التحويل', value: '6.8%' }].map((st, i) => (
                      <div key={i} className="bg-card rounded-lg p-3 text-center border border-edge">
                        <p className="font-black text-lg text-primary">{st.value}</p>
                        <p className="text-[10px] text-dim">{st.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-end gap-1.5 h-14 mb-4">
                    {[60, 80, 45, 90, 70, 85, 55, 75].map((h, i) => (
                      <motion.div key={i} className="flex-1 bg-primary/40 rounded-t-sm" initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.04 }} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {afterTags.map((tag, i) => (
                      <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════ PRICING ══════════ */}
        <section className="py-24 md:py-32 px-6 bg-alt transition-colors duration-300" id="pricing">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <span className="text-sm font-bold tracking-[0.3em] text-primary uppercase">الأسعار</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4 text-heading">باقات تناسب <span className="text-primary">كل مكتب</span></h2>
              <p className="text-body max-w-md mx-auto">بدون رسوم خفية. إلغاء في أي وقت.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {plans.map((plan, i) => (
                <motion.div key={i} className={`rounded-2xl p-6 relative ${plan.popular ? 'bg-primary/[0.06] border-2 border-primary/30' : 'bg-card border border-edge'}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black px-3 py-0.5 rounded-full">الأكثر طلبا</div>}
                  <p className="text-[10px] tracking-wider text-dim font-bold">{plan.subtitle}</p>
                  <h3 className="font-black text-lg mt-1" style={{ color: plan.color }}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 my-5">
                    <span className="text-4xl font-black" style={{ color: plan.color }}>{plan.price}</span>
                    <span className="text-dim text-sm">ريال/شهريا</span>
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-body">
                        <IconCheck className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup" className={`block w-full text-center font-bold py-3 rounded-lg transition-colors text-sm ${plan.popular ? 'bg-primary text-black hover:bg-primary/90' : 'border border-edge text-heading hover:bg-card-hover'}`}>
                    ابدأ الآن
                  </Link>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs text-dim mt-6">جميع الأسعار شاملة ضريبة القيمة المضافة. الدفع عبر Moyasar أو Stripe.</p>
          </div>
        </section>

        {/* ══════════ FAQ ══════════ */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-heading">الأسئلة الشائعة</h2>
            </motion.div>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <motion.div key={i} className="bg-card border border-edge rounded-xl overflow-hidden" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <button className="w-full flex items-center justify-between p-4 text-right cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="font-bold text-heading">{faq.q}</span>
                    <span className={`flex-shrink-0 mr-3 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                      <IconPlus className="w-4 h-4 text-dim" />
                    </span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <p className="px-4 pb-4 text-body text-sm leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="py-24 md:py-32 px-6 relative overflow-hidden bg-alt transition-colors duration-300" id="contact">
          <div className="glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-heading">ارتقِ بمكتبك العقاري اليوم.</h2>
            <p className="text-body max-w-md mx-auto mb-8">ابدأ مجانا. بدون بطاقة ائتمانية، بدون التزام.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap mb-10">
              <Link href="/auth/signup" className="bg-primary text-black font-bold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-colors">ابدأ مجانا</Link>
              <Link href="/contact" className="border border-edge text-heading font-bold px-8 py-3.5 rounded-lg hover:bg-card-hover transition-colors">تواصل معنا</Link>
            </div>
            <p className="text-xs text-dim">hello@falz.sa</p>
          </motion.div>
        </section>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: 'var(--footer-bg)' }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-black font-black text-sm">F</span>
                </div>
                <span className="text-xl font-black" style={{ color: 'var(--footer-heading)' }}>FAL<span className="text-primary">Z</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--footer-text)' }}>المنصة الرقمية المتكاملة لإدارة المكاتب العقارية المرخصة في المملكة العربية السعودية.</p>
              <div className="space-y-3">
                <a href="mailto:hello@falz.sa" className="flex items-center gap-2 text-sm transition-colors hover:text-primary" style={{ color: 'var(--footer-text)' }}><IconMail className="w-4 h-4" /><span>hello@falz.sa</span></a>
                <a href="tel:+966500000000" className="flex items-center gap-2 text-sm transition-colors hover:text-primary" style={{ color: 'var(--footer-text)' }}><IconPhone className="w-4 h-4" /><span dir="ltr">+966 50 000 0000</span></a>
              </div>
            </div>

            <div>
              <h4 className="font-black text-sm mb-4" style={{ color: 'var(--footer-heading)' }}>المنتج</h4>
              <ul className="space-y-2.5">
                {productLinks.map((link, i) => (
                  <li key={i}><a href={link.href} className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--footer-text)' }}>{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-sm mb-4" style={{ color: 'var(--footer-heading)' }}>الشركة</h4>
              <ul className="space-y-2.5">
                {companyLinks.map((link, i) => (
                  <li key={i}><a href={link.href} className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--footer-text)' }}>{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-sm mb-4" style={{ color: 'var(--footer-heading)' }}>لماذا فلز؟</h4>
              <ul className="space-y-3">
                {[
                  { Icon: IconGlobe, text: 'ثنائي اللغة بالكامل' },
                  { Icon: IconShield, text: 'بيانات مشفرة وآمنة' },
                  { Icon: IconLayout, text: 'تخصيص بدون أكواد' },
                  { Icon: IconChart, text: 'تقارير قابلة للتصدير' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <item.Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-sm" style={{ color: 'var(--footer-text)' }}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-px mb-8" style={{ background: 'var(--footer-border)' }} />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: 'var(--footer-text)' }}>&copy; {new Date().getFullYear()} Falz. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-5">
              {legalLinks.map((link, i) => (
                <a key={i} href={link.href} className="text-xs transition-colors hover:text-primary" style={{ color: 'var(--footer-text)' }}>{link.label}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" style={{ border: '1px solid var(--footer-border)' }}>
                <svg viewBox="0 0 24 24" width={14} height={14} fill="var(--footer-text)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" style={{ border: '1px solid var(--footer-border)' }}>
                <svg viewBox="0 0 24 24" width={14} height={14} fill="var(--footer-text)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" style={{ border: '1px solid var(--footer-border)' }}>
                <svg viewBox="0 0 24 24" width={14} height={14} fill="var(--footer-text)"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
