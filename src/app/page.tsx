'use client'

import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  animate,
  AnimatePresence,
} from 'framer-motion'
import {
  Building2,
  Globe,
  BarChart3,
  Palette,
  Shield,
  Zap,
  Mail,
  Phone,
  Fingerprint,
  ShieldCheck,
  Languages,
} from 'lucide-react'
import { FalzLogo } from '@/components/shared/FalzLogo'

/* ═══════════════════════════════════════════
   Data & Constants
   ═══════════════════════════════════════════ */

const floatingProperties = [
  { price: '1.2M', type: 'فيلا', location: 'الرياض', beds: 5, icon: '🏠', top: '12%', side: 'right' as const, offset: '4%' },
  { price: '450K', type: 'شقة', location: 'جدة', beds: 3, icon: '🏢', top: '18%', side: 'left' as const, offset: '3%' },
  { price: '2.8M', type: 'أرض', location: 'الدمام', beds: 0, icon: '🏗️', top: '58%', side: 'right' as const, offset: '6%' },
  { price: '890K', type: 'فيلا', location: 'الخبر', beds: 4, icon: '🏡', top: '22%', side: 'left' as const, offset: '5%' },
  { price: '320K', type: 'شقة', location: 'المدينة', beds: 2, icon: '🏠', top: '55%', side: 'left' as const, offset: '2%' },
]

const stats = [
  { value: 100, prefix: '+', suffix: '', label: 'مكتب عقاري' },
  { value: 2500, prefix: '+', suffix: '', label: 'عقار مُدرج' },
  { value: 15000, prefix: '+', suffix: '', label: 'عميل محتمل' },
  { value: 99, prefix: '', suffix: '.9%', label: 'وقت التشغيل' },
]

const featureCards = [
  { icon: Globe, title: 'موقع إلكتروني احترافي', desc: 'موقع جاهز بهويتك الخاصة مع نطاق مخصص، تصاميم فاخرة، ودعم كامل للعربية والإنجليزية' },
  { icon: Building2, title: 'إدارة العقارات', desc: 'إضافة وإدارة العقارات بسهولة مع صور متعددة، فيديو، جولات 360°، وبيانات تفصيلية' },
  { icon: BarChart3, title: 'تحليلات متقدمة', desc: 'تتبع الزيارات، العملاء المحتملين، مصادر الزيارات، وتقارير شهرية بصيغة PDF' },
  { icon: Shield, title: 'إدارة العملاء', desc: 'نظام CRM متكامل لتتبع العملاء المحتملين من جميع المصادر مع تعيين تلقائي للوكلاء' },
  { icon: Palette, title: 'تخصيص كامل', desc: 'اختر من بين قوالب جاهزة أو خصص الألوان والخطوط لتتناسب مع هوية مكتبك' },
  { icon: Building2, title: 'مدونة متكاملة', desc: 'انشر مقالات ونصائح عقارية لتعزيز ظهورك في محركات البحث وبناء الثقة مع العملاء' },
]

const steps = [
  { step: '1', title: 'سجّل مكتبك', desc: 'أنشئ حسابك وأدخل بيانات مكتبك العقاري ورخصة فال', icon: '📝' },
  { step: '2', title: 'خصّص موقعك', desc: 'اختر القالب، ارفع الشعار، وعدّل الألوان لتتناسب مع هويتك', icon: '🎨' },
  { step: '3', title: 'انطلق!', desc: 'أضف عقاراتك وشارك موقعك مع عملائك — كل شيء جاهز', icon: '🚀' },
]

const dashboardStats = [
  { label: 'العقارات', value: '156' },
  { label: 'الزيارات', value: '2,340' },
  { label: 'العملاء', value: '89' },
  { label: 'الوكلاء', value: '12' },
]

const dashboardTags = ['موقع إلكتروني', 'إدارة عقارات', 'تحليلات', 'CRM']

const analyticsSkills = [
  { name: 'الزيارات', value: 92, color: '#D4A843' },
  { name: 'العملاء', value: 85, color: '#60A5FA' },
  { name: 'التحويلات', value: 78, color: '#4ADE80' },
  { name: 'العقارات', value: 95, color: '#FB923C' },
  { name: 'التقييمات', value: 88, color: '#A78BFA' },
]

const leadStages = [
  { stage: 'جديد', date: '٥ أبريل', count: '22', pct: 92, color: '#4ADE80', time: 'آخر ساعة' },
  { stage: 'تم التواصل', date: '٤ أبريل', count: '18', pct: 75, color: '#60A5FA', time: 'اليوم' },
  { stage: 'مؤهل', date: '٣ أبريل', count: '12', pct: 50, color: '#FB923C', time: 'هذا الأسبوع' },
  { stage: 'محوّل', date: '١ أبريل', count: '8', pct: 33, color: '#D4A843', time: 'هذا الشهر' },
]

const leadCategories = [
  { name: 'واتساب', color: '#4ADE80' },
  { name: 'الموقع', color: '#60A5FA' },
  { name: 'اتصال', color: '#FB923C' },
  { name: 'إحالة', color: '#A78BFA' },
]

const profileStats = [
  { label: 'عقار', value: '48', color: '#4ADE80' },
  { label: 'زيارة', value: '1.2K', color: '#60A5FA' },
  { label: 'عميل', value: '34', color: '#D4A843' },
  { label: 'تقييم', value: '4.8', color: '#FB923C' },
]

const profileMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
const profileViews = [65, 80, 55, 90, 75, 95]

const roles = [
  { title: 'مالك المكتب', subtitle: 'OWNER', icon: '👔', color: '#4ADE80', tags: ['لوحة التحكم', 'إدارة العقارات', 'إدارة الوكلاء', 'التقارير', 'الإعدادات', 'الفواتير'], summary: 'تحكم كامل بالمكتب والبيانات' },
  { title: 'مدير المكتب', subtitle: 'MANAGER', icon: '📋', color: '#60A5FA', tags: ['العقارات', 'العملاء', 'التقارير', 'المدونة'], summary: 'إدارة العمليات اليومية' },
  { title: 'الوكيل', subtitle: 'AGENT', icon: '🏠', color: '#A78BFA', tags: ['عقاراتي', 'عملائي', 'الملف الشخصي'], summary: 'إدارة عقاراته وعملائه' },
  { title: 'الزائر', subtitle: 'VISITOR', icon: '👤', color: '#F472B6', tags: ['تصفح العقارات', 'المفضلة', 'التواصل'], summary: 'تصفح العقارات والتواصل' },
]

const whiteLabelColors = [
  { name: 'ذهبي', value: '#D4A843' },
  { name: 'بنفسجي', value: '#8B5CF6' },
  { name: 'أحمر', value: '#DC2626' },
  { name: 'كحلي', value: '#1E3A5F' },
  { name: 'رمادي', value: '#6B7280' },
  { name: 'أخضر', value: '#22C55E' },
]

const whiteLabelFeatures = [
  'ألوان مخصصة تناسب هوية مكتبك',
  'شعار المكتب في كل صفحة',
  'تخصيص الثيم: داكن أو فاتح',
  'نطاق مخصص لموقعك',
]

const beforeItems = [
  { text: 'واتساب للعملاء', detail: '47 رسالة غير مقروءة', icon: '💬' },
  { text: 'إكسل للعقارات', detail: 'آخر تحديث قبل 3 أسابيع', icon: '📊' },
  { text: 'أوراق العقود', detail: 'ناقص بيانات 5 عقارات', icon: '📝' },
  { text: 'رسائل فائتة', detail: '4 أيام بدون رد', icon: '📱' },
]

const afterStats2 = [
  { label: 'العقارات', value: '156' },
  { label: 'العملاء', value: '89' },
  { label: 'الوكلاء', value: '12' },
  { label: 'التحويل', value: '34%' },
]

const afterTags2 = ['موقع احترافي', 'CRM ذكي', 'تحليلات فورية', 'إدارة متكاملة']

const whyCards = [
  { role: 'المكتب', subtitle: 'OFFICE', icon: '🏢', color: '#D4A843', items: ['موقع إلكتروني بهويتك', 'لوحة تحكم شاملة', 'تقارير احترافية', 'صورة احترافية حديثة'] },
  { role: 'الوكيل', subtitle: 'AGENT', icon: '🏠', color: '#60A5FA', items: ['إدارة عقاراته بسهولة', 'تتبع عملائه تلقائياً', 'ملف شخصي احترافي', 'إشعارات فورية'] },
  { role: 'العميل', subtitle: 'CLIENT', icon: '👤', color: '#4ADE80', items: ['تصفح سهل وسريع', 'حفظ العقارات المفضلة', 'تواصل مباشر مع الوكيل', 'معلومات دقيقة ومحدثة'] },
  { role: 'المالك', subtitle: 'OWNER', icon: '👔', color: '#A78BFA', items: ['رؤية شاملة للأعمال', 'تقارير الأداء والإيرادات', 'إدارة الفريق', 'قرارات مبنية على بيانات'] },
]

const pricingFeatureRows = [
  ['موقع إلكتروني احترافي بهويتك', 'نظام إدارة عقارات متكامل', 'نظام CRM لتتبع العملاء', 'تحليلات وتقارير متقدمة'],
  ['مدونة لنشر المقالات والنصائح', 'دعم كامل للعربية والإنجليزية', 'تخصيص الألوان والشعار', 'إدارة الوكلاء والصلاحيات'],
  ['جولات 360° وفيديو', 'خرائط جوجل للمواقع', 'إشعارات فورية للعملاء', 'تقارير PDF وCSV'],
  ['تحسين محركات البحث SEO', 'صفحات متعددة وقابلة للتخصيص', 'نظام حجز المواعيد', 'دعم فني متواصل'],
]

const faqs = [
  { q: 'هل فالز مناسب لمكتبي الصغير؟', a: 'نعم! فالز مصمم ليناسب المكاتب العقارية بجميع أحجامها. سواء كان عندك 5 عقارات أو 500 عقار، المنصة تتكيف مع احتياجاتك مع خطط مرنة تناسب ميزانيتك.' },
  { q: 'هل أحتاج خبرة تقنية لاستخدام المنصة؟', a: 'لا! فالز مصمم ليكون سهل الاستخدام بدون أي خبرة تقنية. واجهة بسيطة وواضحة، مع دعم فني متواصل لمساعدتك في أي وقت.' },
  { q: 'هل يمكنني استخدام نطاقي الخاص؟', a: 'نعم! في الخطة الاحترافية والمؤسسية يمكنك ربط نطاقك الخاص. موقعك سيظهر تحت اسم مكتبك بدون أي ذكر لفالز.' },
  { q: 'كيف يعمل نظام إدارة العملاء؟', a: 'نظام CRM ذكي يجمع كل استفسارات العملاء من الموقع والواتساب والاتصالات في مكان واحد. يتم تعيين كل عميل تلقائياً للوكيل المسؤول مع تتبع كامل لحالة كل عميل.' },
  { q: 'هل البيانات آمنة؟', a: 'نعم، نستخدم أعلى معايير الحماية والتشفير. بياناتك محفوظة بشكل آمن ومشفرة بالكامل، ولا نشارك أي بيانات مع أطراف خارجية.' },
  { q: 'هل يمكنني تجربة المنصة قبل الاشتراك؟', a: 'بالطبع! الخطة الأساسية مجانية وتشمل جميع المميزات الأساسية. ابدأ مجاناً واكتشف كيف يمكن لفالز أن يطور مكتبك العقاري.' },
]

const plans = [
  { name: 'أساسي', price: 'مجاناً', period: '', popular: false, features: ['10 عقارات', '2 وكلاء', 'موقع إلكتروني', 'مدونة'] },
  { name: 'احترافي', price: '299', period: 'ر.س/شهر', popular: true, features: ['50 عقار', '10 وكلاء', 'نطاق مخصص', 'تحليلات متقدمة', 'تقارير PDF'] },
  { name: 'مؤسسي', price: '799', period: 'ر.س/شهر', popular: false, features: ['عقارات غير محدودة', 'وكلاء غير محدود', 'كل المميزات', 'دعم ذو أولوية', 'API'] },
]

/* ═══════════════════════════════════════════
   Helper Components
   ═══════════════════════════════════════════ */

function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setDisplay(Math.round(v).toLocaleString('en')),
      })
      return controls.stop
    }
  }, [isInView, count, value])

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  )
}

function RadarChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const cx = 120
  const cy = 120
  const r = 90
  const n = 5
  const startAngle = -Math.PI / 2

  const getPoint = (i: number, scale = 1) => {
    const angle = startAngle + (i * 2 * Math.PI) / n
    return { x: cx + r * scale * Math.cos(angle), y: cy + r * scale * Math.sin(angle) }
  }

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'

  const gridLevels = [0.33, 0.66, 1]
  const outerPoints = Array.from({ length: n }, (_, i) => getPoint(i))
  const dataPoints = analyticsSkills.map((s, i) => getPoint(i, s.value / 100))

  return (
    <div ref={ref} className="relative inline-block">
      <svg width="240" height="240" viewBox="0 0 240 240">
        {gridLevels.map((scale, gi) => (
          <path
            key={gi}
            d={toPath(Array.from({ length: n }, (_, i) => getPoint(i, scale)))}
            fill="none"
            stroke="white"
            strokeOpacity="0.08"
            strokeWidth="1"
          />
        ))}
        {outerPoints.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="white" strokeOpacity="0.08" strokeWidth="1" />
        ))}
        <motion.path
          d={toPath(dataPoints)}
          fill="#D4A84318"
          stroke="#D4A843"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
        />
        {analyticsSkills.map((skill, i) => {
          const p = getPoint(i, 1.28)
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fillOpacity="0.5"
              fontSize="11"
              fontWeight="700"
            >
              {skill.name}
            </text>
          )
        })}
      </svg>
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#D4A843]/15 border border-[#D4A843]/25 text-[#D4A843] text-xs font-bold px-3 py-1 rounded-full"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8 }}
      >
        أداء متميز
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Checkmark SVG
   ═══════════════════════════════════════════ */

function CheckSvg({ color = '#D4A843' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <path d="M2 7L5.5 10.5L12 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState(0)
  const [isDark, setIsDark] = useState(true)
  const { scrollYProgress } = useScroll()

  return (
    <div dir="rtl" className="dark-landing min-h-screen bg-[#0a0f1a] text-white">

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FalzLogo variant="light" size="sm" />
            <span className="text-xl font-bold tracking-tight">
              FAL<span className="text-[#D4A843]">Z</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#platform" className="hover:text-white transition-colors">المنصة</a>
            <a href="#features" className="hover:text-white transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-white transition-colors">الأسعار</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:inline">
              تسجيل الدخول
            </Link>
            <Link href="/auth/signup" className="bg-[#D4A843] text-black font-bold text-sm px-6 py-2 rounded-full hover:bg-[#D4A843]/90 transition-colors">
              ابدأ الآن
            </Link>
          </div>
        </div>

        <motion.div className="h-0.5 bg-[#D4A843] origin-right" style={{ scaleX: scrollYProgress }} />
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4A843]/5 rounded-full blur-[120px] pointer-events-none" />

        {floatingProperties.map((prop, i) => (
          <motion.div
            key={i}
            className="absolute hidden lg:block"
            style={{
              top: prop.top,
              ...(prop.side === 'right' ? { right: prop.offset } : { left: prop.offset }),
            }}
            animate={{ y: [0, -15, 0, 10, 0], rotate: [0, 2, 0, -2, 0] }}
            transition={{ duration: 6 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm w-44 opacity-50 hover:opacity-90 transition-opacity duration-500">
              <div className="text-xl mb-1">{prop.icon}</div>
              <p className="text-sm font-bold text-[#D4A843]">{prop.price} ر.س</p>
              <p className="text-xs text-gray-400">{prop.type} · {prop.location}</p>
              {prop.beds > 0 && <p className="text-xs text-gray-500 mt-0.5">{prop.beds} غرف نوم</p>}
            </div>
          </motion.div>
        ))}

        <motion.div
          className="text-center max-w-3xl mx-auto z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/20 text-[#D4A843] text-sm px-4 py-1.5 rounded-full mb-8">
            <span>✦</span>
            <span>البنية الرقمية للمكاتب العقارية</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            كل مكتب عقاري
            <br />
            له قصة.
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            موقع إلكتروني احترافي، إدارة عقارات متكاملة، نظام CRM ذكي، وتحليلات متقدمة — كل ما تحتاجه تحت هوية مكتبك المستقلة.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/signup" className="bg-[#D4A843] text-black font-bold text-lg px-8 py-3.5 rounded-full hover:bg-[#D4A843]/90 transition-colors">
              أنشئ موقعك الآن
            </Link>
            <Link href="/dar-al-aseel" className="border border-white/20 text-white font-bold text-lg px-8 py-3.5 rounded-full hover:border-white/40 transition-colors">
              شاهد مثال حي ▶
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 text-gray-500 text-sm flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>اسحب للأسفل</span>
          <span>↓</span>
        </motion.div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-sm font-medium uppercase tracking-wider text-gray-500 mb-8"
          >
            أكثر من 100 مكتب عقاري يثق بمنصة فالز
          </motion.p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <p className="text-3xl font-black text-[#D4A843] md:text-4xl">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="py-24 md:py-32 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-[#D4A843] uppercase">FEATURES</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">
              كل ما يحتاجه <span className="text-[#D4A843]">مكتبك العقاري</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              منصة متكاملة صُممت خصيصاً للسوق السعودي — من الموقع الإلكتروني إلى إدارة العملاء
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4A843]/10">
                  <feature.icon className="h-6 w-6 text-[#D4A843]" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ STEPS ══════════ */}
      <section className="py-24 md:py-32 px-6" id="platform">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-[#D4A843] uppercase">HOW IT WORKS</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">
              ابدأ في ثلاث <span className="text-[#D4A843]">خطوات بسيطة</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              لا تحتاج خبرة تقنية — سجّل وانطلق في دقائق
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#D4A843] text-xs font-black text-black">
                    {item.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ DASHBOARD PREVIEW ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-[#D4A843] uppercase">DASHBOARD</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">
              لوحة تحكم <span className="text-[#D4A843]">شاملة</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              كل بيانات مكتبك العقاري في مكان واحد — العقارات، العملاء، التحليلات، والتقارير.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Browser mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 mx-4">
                  <div className="bg-white/5 rounded-md px-3 py-1 text-xs text-gray-500 text-center">
                    falz.sa/dashboard
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <FalzLogo variant="gold" size="sm" />
                  <div>
                    <h3 className="font-black text-lg">دار الأصيل العقارية</h3>
                    <p className="text-xs text-gray-500">لوحة التحكم</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {dashboardStats.map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="font-black text-lg text-[#D4A843]">{s.value}</p>
                      <p className="text-[10px] text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-end gap-2 h-16">
                  {[60, 80, 45, 90, 70, 85, 55, 75].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-[#D4A843]/40 rounded-t-sm"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {dashboardTags.map((tag, i) => (
                    <span key={i} className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#D4A843]/10 text-[#D4A843]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Feature list */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                { icon: '📊', text: 'إحصائيات شاملة لجميع العقارات والعملاء' },
                { icon: '📈', text: 'تقارير أداء شهرية قابلة للتصدير PDF' },
                { icon: '🔔', text: 'إشعارات فورية عند تسجيل عميل جديد' },
                { icon: '🗺️', text: 'خريطة تفاعلية لمواقع العقارات' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                >
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-lg font-bold">{f.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ ANALYTICS ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-[#D4A843] uppercase">ANALYTICS</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">
              تحليلات تبني <span className="text-[#D4A843]">قرارات ذكية</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              تتبع كل زيارة، كل عميل، كل تحويل. بيانات حقيقية تساعدك تنمّي مكتبك.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <RadarChart />
            </motion.div>

            <div className="space-y-5">
              {analyticsSkills.map((skill, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-gray-300">{skill.name}</span>
                    <span className="text-sm font-black" style={{ color: skill.color }}>
                      {skill.value}
                    </span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: skill.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              ))}
              <motion.div
                className="flex items-center gap-2 text-[#D4A843] text-sm font-bold pt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                <span>↑</span>
                <span>نمو 47% مقارنة بالشهر الماضي</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ LEAD PIPELINE ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-[#D4A843] uppercase">CRM</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">
              تتبع كل عميل <span className="text-[#D4A843]">بسهولة</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              نظام CRM ذكي يجمع استفسارات العملاء من كل المصادر. تعيين تلقائي، تتبع الحالة، ومتابعة شاملة.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {leadStages.map((s, i) => (
                <motion.div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{s.stage}</span>
                      <span className="text-gray-500 text-sm">{s.date}</span>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${s.color}18`, color: s.color }}
                    >
                      {s.count} عميل
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <span>{s.time}</span>
                    <span>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: s.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="flex flex-wrap gap-3 justify-center md:justify-start md:pt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {leadCategories.map((c, i) => (
                <motion.span
                  key={i}
                  className="text-sm font-bold px-5 py-2.5 rounded-full border"
                  style={{ borderColor: `${c.color}35`, color: c.color, backgroundColor: `${c.color}0D` }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {c.name}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ OFFICE WEBSITE PREVIEW ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-[#D4A843] uppercase">OFFICE WEBSITE</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">
              موقع مكتب <span className="text-blue-400">حقيقي</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              لكل مكتب موقع إلكتروني احترافي يعرض عقاراته، فريقه، ومدونته. تجربة تشبه المواقع العالمية — لكن بهويتك.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 mx-4">
                  <div className="bg-white/5 rounded-md px-3 py-1 text-xs text-gray-500 text-center">
                    falz.sa/dar-al-aseel
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4A843]/20 flex items-center justify-center text-xl">
                    🏢
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg">دار الأصيل العقارية</h3>
                    <p className="text-xs text-gray-500">مكتب عقاري مرخص · الرياض</p>
                  </div>
                  <div className="bg-[#D4A843]/20 text-[#D4A843] font-black text-xl px-3 py-1 rounded-lg">
                    4.8
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {profileStats.map((s, i) => (
                    <div key={i} className="text-center bg-white/5 rounded-lg py-3">
                      <p className="font-black text-lg" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 mb-3">الزيارات الشهرية</p>
                  <div className="flex items-end gap-2 h-20">
                    {profileViews.map((val, i) => (
                      <motion.div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          className="w-full bg-[#D4A843]/60 rounded-t-sm"
                          initial={{ height: 0 }}
                          whileInView={{ height: `${val}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                        />
                        <span className="text-[8px] text-gray-600">{profileMonths[i]}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <polygon points="50,10 90,40 75,85 25,85 10,40" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
                    <polygon points="50,25 78,42 68,75 32,75 22,42" fill="#D4A84320" stroke="#D4A843" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-3 justify-center md:justify-start"
            >
              {['موقع إلكتروني', 'عقارات مميزة', 'فريق العمل', 'المدونة', 'تواصل معنا'].map((tag, i) => (
                <motion.span
                  key={i}
                  className="text-sm font-bold px-5 py-2.5 rounded-full border border-white/15 text-gray-300 hover:border-[#D4A843]/40 hover:text-[#D4A843] transition-colors cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ ROLES ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-pink-400 uppercase">ROLES & PERMISSIONS</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">صلاحيات لكل دور</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              كل شخص يرى فقط ما يخصه. المالك يدير كل شيء. المدير يدير العمليات. الوكيل يدير عقاراته. نظام صلاحيات ذكي ومرن.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              {roles.map((role, i) => (
                <motion.div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{role.icon}</span>
                    <div>
                      <h3 className="font-black">{role.title}</h3>
                      <p className="text-[10px] tracking-wider text-gray-500">{role.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.tags.map((tag, j) => (
                      <span
                        key={j}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${role.color}15`, color: role.color }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-5 pt-4"
            >
              {roles.map((role, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                  <div>
                    <span className="font-bold">{role.title}: </span>
                    <span className="text-gray-400">{role.summary}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ WHITE LABEL ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-orange-400 uppercase">WHITE LABEL</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">
              هويتك التجارية <span className="text-orange-400">في كل مكان</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              خصّص المنصة بشعار مكتبك وألوانه. اسم المكتب يظهر في كل صفحة. تجربة احترافية تعكس هويتك.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {whiteLabelFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-white/5"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="text-orange-400">🎨</span>
                  <span className="text-lg font-bold">{f}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h3 className="font-black text-lg mb-6">معاينة التخصيص</h3>

              <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center mb-6 hover:border-white/25 transition-colors cursor-pointer">
                <span className="text-3xl block mb-2">📤</span>
                <p className="text-sm font-bold text-gray-400">شعار مكتبك</p>
                <p className="text-xs text-gray-600 mt-1">SVG أو PNG</p>
              </div>

              <p className="text-sm font-bold text-gray-400 mb-3">الألوان</p>
              <div className="flex gap-3 mb-6">
                {whiteLabelColors.map((c, i) => (
                  <button
                    key={i}
                    className={`w-10 h-10 rounded-full transition-all cursor-pointer ${
                      selectedColor === i ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0f1a] scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setSelectedColor(i)}
                  />
                ))}
              </div>

              <p className="text-sm font-bold text-gray-400 mb-3">الثيم</p>
              <div className="flex gap-3">
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                    !isDark ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                  onClick={() => setIsDark(false)}
                >
                  فاتح
                </button>
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                    isDark ? 'bg-[#D4A843] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                  onClick={() => setIsDark(true)}
                >
                  داكن
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ CHAOS TO SYSTEM ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-red-400 uppercase">FROM CHAOS TO SYSTEM</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">
              ودّع <span className="text-red-400">الفوضى</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              المكتب يعمل بأدوات مبعثرة. فالز يجمع كل شيء في نظام واحد.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <h3 className="font-black text-red-400">قبل FALZ</h3>
              </div>
              <div className="space-y-3">
                {beforeItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="bg-red-950/30 border border-red-500/10 rounded-xl p-4 flex items-center gap-3"
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-sm">{item.text}</p>
                      <p className="text-xs text-red-400/70">{item.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-green-950/20 border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <h3 className="font-black text-green-400">بعد FALZ</h3>
              </div>

              <div className="bg-[#111827] rounded-xl p-4 border border-white/10">
                <p className="text-xs font-bold text-gray-400 mb-3">لوحة التحكم</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {afterStats2.map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="font-black text-lg text-[#D4A843]">{s.value}</p>
                      <p className="text-[10px] text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-2 h-16 mb-4">
                  {[60, 80, 45, 90, 70, 85, 55, 75].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-[#D4A843]/40 rounded-t-sm"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {afterTags2.map((tag, i) => (
                    <span key={i} className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#D4A843]/10 text-[#D4A843]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="hidden md:flex justify-center -mt-[280px] pointer-events-none relative z-10">
            <motion.div
              className="w-12 h-12 rounded-full bg-[#0a0f1a] border border-white/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-[#D4A843] text-lg">←</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ WHY FALZ ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-[#D4A843] uppercase">WHY FALZ</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">لماذا فالز؟</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              كل شخص في المكتب يستفيد، من المالك إلى العميل.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyCards.map((card, i) => (
              <motion.div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-3xl block mb-3">{card.icon}</span>
                <h3 className="font-black text-lg mb-1" style={{ color: card.color }}>
                  {card.role}
                </h3>
                <p className="text-[10px] tracking-wider text-gray-600 mb-4">{card.subtitle}</p>
                <ul className="space-y-2">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-1 flex-shrink-0" style={{ color: card.color }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <section className="py-24 md:py-32 px-6" id="pricing">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-[#D4A843] uppercase">PRICING</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 mb-6">
              خطط تناسب <span className="text-[#D4A843]">حجم مكتبك</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-2">
              ابدأ مجاناً مع الخطة الأساسية وطوّر حسب نمو مكتبك
            </p>
            <p className="text-sm text-[#D4A843]">
              وفّر مع الاشتراك السنوي — شهرين مجاناً
            </p>
          </motion.div>

          {/* Plan cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                className={`relative rounded-2xl border p-8 backdrop-blur-sm ${
                  plan.popular
                    ? 'border-[#D4A843] bg-white/5 shadow-lg ring-1 ring-[#D4A843]/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D4A843] px-4 py-1 text-xs font-black text-black shadow-sm">
                    الأكثر شيوعاً
                  </div>
                )}
                <h3 className="mb-2 text-xl font-black">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-black text-[#D4A843]">{plan.price}</span>
                  {plan.period && <span className="mr-1 text-sm text-gray-400">{plan.period}</span>}
                </div>
                <ul className="mb-8 space-y-3 text-sm text-gray-400">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <CheckSvg />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block rounded-full py-3 text-center text-sm font-bold transition-colors ${
                    plan.popular
                      ? 'bg-[#D4A843] text-black hover:bg-[#D4A843]/90'
                      : 'border border-white/20 text-white hover:border-white/40 hover:bg-white/5'
                  }`}
                >
                  ابدأ الآن
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Feature grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {pricingFeatureRows.map((row, i) => (
              <div key={i} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {row.map((feature, j) => (
                  <motion.div
                    key={j}
                    className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/5"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i * 4 + j) * 0.03 }}
                  >
                    <CheckSvg />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">كل ما تحتاج معرفته قبل البدء</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-right cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-lg">{faq.q}</span>
                  <span
                    className={`w-8 h-8 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 mr-4 transition-transform ${
                      openFaq === i ? 'rotate-45' : ''
                    }`}
                  >
                    <span className="text-lg leading-none">+</span>
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-gray-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CONTACT ══════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-sm font-bold tracking-[0.3em] text-[#D4A843] uppercase">CONTACT US</span>

            <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8">
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 resize-none h-32 focus:outline-none focus:border-[#D4A843]/40 transition-colors"
                placeholder="كيف نقدر نساعدك؟ اكتب رسالتك هنا..."
              />
              <button className="w-full bg-[#D4A843] text-black font-black text-lg py-4 rounded-full mt-4 hover:bg-[#D4A843]/90 transition-colors cursor-pointer">
                إرسال الرسالة
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>info@falz.sa</span>
              <span>•</span>
              <span>رسالتك مهمة ومشفرة</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D4A843]/8 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            جاهز لبناء
            <br />
            <span className="text-[#D4A843]">حضورك الرقمي؟</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            انضم لأكثر من 100 مكتب عقاري يستخدم فالز لإدارة عقاراته وجذب العملاء. ابدأ اليوم مجاناً.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block border-2 border-[#D4A843] text-[#D4A843] font-bold text-lg px-10 py-4 rounded-full hover:bg-[#D4A843] hover:text-black transition-colors"
          >
            ابدأ الآن
          </Link>
        </motion.div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FALZ. جميع الحقوق محفوظة.</p>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              <span>info@falz.sa</span>
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">+966 50 000 0000</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-black text-white text-sm">
              FAL<span className="text-[#D4A843]">Z</span>
            </span>
            <Link href="/contact" className="hover:text-white transition-colors">
              تواصل معنا
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/auth/signin" className="hover:text-white transition-colors">
              تسجيل الدخول
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/auth/signup" className="hover:text-white transition-colors">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
