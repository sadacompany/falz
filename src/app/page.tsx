'use client'

import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  animate,
} from 'framer-motion'
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  Globe,
  BarChart3,
  Palette,
  Shield,
  UserPlus,
  Settings,
  Rocket,
  Fingerprint,
  ShieldCheck,
  Languages,
  Zap,
  Mail,
  Phone,
} from 'lucide-react'
import { FalzLogo } from '@/components/shared/FalzLogo'

const ease = [0.16, 1, 0.3, 1] as const

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

const staggerGrid = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

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

export default function LandingPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#FFFDF5] text-[#2E2506]">
      <header className="sticky top-0 z-50 border-b border-[#E5DCC6]/80 bg-[#FFFDF5]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <FalzLogo variant="dark" size="sm" />
            <span className="text-xl font-bold tracking-tight text-[#3B2F08]">FALZ</span>
          </div>
          <nav aria-label="القائمة الرئيسية" className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-sm text-[#7A6C4F] transition-colors hover:text-[#3B2F08]"
            >
              تسجيل الدخول
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/signup"
                className="inline-block rounded-lg bg-[#956D00] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#7A5A00]"
              >
                ابدأ الآن
              </Link>
            </motion.div>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7F1E0] via-transparent to-[#F7F1E0]/40" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #3B2F08 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-[#3B2F08]/[0.04] blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-[340px] w-[340px] rounded-full bg-[#956D00]/[0.05] blur-3xl" />

        <motion.div
          className="relative mx-auto max-w-7xl px-6 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#956D00]/30 bg-[#F7F1E0] px-4 py-1.5 text-sm font-medium text-[#7A5A00]"
          >
            <Building2 className="h-4 w-4" />
            البنية الرقمية الاحترافية للمكاتب العقارية
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-display mx-auto max-w-4xl text-[#3B2F08]"
          >
            امنح مكتبك العقاري
            <br />
            <span className="bg-gradient-to-l from-[#956D00] to-[#7A5A00] bg-clip-text text-transparent">
              حضوراً رقمياً استثنائياً
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-lg text-[#7A6C4F] md:text-xl"
          >
            منصة فالز تمكّنك من بناء موقعك الإلكتروني الخاص، إدارة عقاراتك،
            تتبع العملاء المحتملين، وتحليل أدائك — كل ذلك تحت هويتك المستقلة
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 rounded-lg bg-[#956D00] px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-[#7A5A00] hover:shadow-lg"
              >
                أنشئ موقعك الآن
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/dar-al-aseel"
                className="flex items-center gap-2 rounded-lg border border-[#E5DCC6] bg-white px-8 py-3.5 text-base font-semibold text-[#3B2F08] shadow-sm transition-all hover:border-[#956D00]/40 hover:bg-[#F7F1E0]"
              >
                شاهد مثال حي
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="border-y border-[#E5DCC6] bg-white py-14">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease }}
            className="mb-8 text-sm font-medium uppercase tracking-wider text-[#7A6C4F]"
          >
            أكثر من 100 مكتب عقاري يثق بمنصة فالز
          </motion.p>
          <motion.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
            variants={staggerGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              { value: 100, prefix: '+', suffix: '', label: 'مكتب عقاري' },
              { value: 2500, prefix: '+', suffix: '', label: 'عقار مُدرج' },
              { value: 15000, prefix: '+', suffix: '', label: 'عميل محتمل' },
              { value: 99, prefix: '', suffix: '.9%', label: 'وقت التشغيل' },
            ].map((stat, i) => (
              <motion.div key={i} variants={cardVariants}>
                <p className="text-3xl font-bold text-[#3B2F08] md:text-4xl">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-sm text-[#7A6C4F]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[#E5DCC6] bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="text-heading-2 mb-4 text-[#3B2F08]">
              كل ما يحتاجه مكتبك العقاري
            </h2>
            <p className="mx-auto max-w-2xl text-[#7A6C4F]">
              منصة متكاملة صُممت خصيصاً للسوق السعودي — من الموقع الإلكتروني إلى إدارة العملاء
            </p>
          </motion.div>
          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              {
                icon: Globe,
                title: 'موقع إلكتروني احترافي',
                desc: 'موقع جاهز بهويتك الخاصة مع نطاق مخصص، تصاميم فاخرة، ودعم كامل للعربية والإنجليزية',
              },
              {
                icon: Building2,
                title: 'إدارة العقارات',
                desc: 'إضافة وإدارة العقارات بسهولة مع صور متعددة، فيديو، جولات 360°، وبيانات تفصيلية',
              },
              {
                icon: BarChart3,
                title: 'تحليلات متقدمة',
                desc: 'تتبع الزيارات، العملاء المحتملين، مصادر الزيارات، وتقارير شهرية بصيغة PDF',
              },
              {
                icon: Shield,
                title: 'إدارة العملاء',
                desc: 'نظام CRM متكامل لتتبع العملاء المحتملين من جميع المصادر مع تعيين تلقائي للوكلاء',
              },
              {
                icon: Palette,
                title: 'تخصيص كامل',
                desc: 'اختر من بين قوالب جاهزة أو خصص الألوان والخطوط لتتناسب مع هوية مكتبك',
              },
              {
                icon: Building2,
                title: 'مدونة متكاملة',
                desc: 'انشر مقالات ونصائح عقارية لتعزيز ظهورك في محركات البحث وبناء الثقة مع العملاء',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="group rounded-xl border border-[#E5DCC6] bg-white p-6 transition-colors hover:border-[#956D00]/40 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#F7F1E0] transition-colors group-hover:bg-[#956D00]/20">
                  <feature.icon className="h-6 w-6 text-[#956D00]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#3B2F08]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[#7A6C4F]">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[#E5DCC6] bg-[#FFFDF5] py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="text-heading-2 mb-4 text-[#3B2F08]">
              ابدأ في ثلاث خطوات بسيطة
            </h2>
            <p className="mx-auto max-w-xl text-[#7A6C4F]">
              لا تحتاج خبرة تقنية — سجّل وانطلق في دقائق
            </p>
          </motion.div>
          <div className="relative">
            <div className="absolute top-12 right-[16.67%] left-[16.67%] hidden h-px border-t-2 border-dashed border-[#956D00]/30 md:block" />
            <motion.div
              className="grid gap-12 md:grid-cols-3 md:gap-8"
              variants={staggerGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {[
                {
                  step: '1',
                  icon: UserPlus,
                  title: 'سجّل مكتبك',
                  desc: 'أنشئ حسابك وأدخل بيانات مكتبك العقاري ورخصة فال',
                },
                {
                  step: '2',
                  icon: Settings,
                  title: 'خصّص موقعك',
                  desc: 'اختر القالب، ارفع الشعار، وعدّل الألوان لتتناسب مع هويتك',
                },
                {
                  step: '3',
                  icon: Rocket,
                  title: 'انطلق!',
                  desc: 'أضف عقاراتك وشارك موقعك مع عملائك — كل شيء جاهز',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  className="relative text-center"
                >
                  <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#956D00]/30 bg-[#F7F1E0]">
                    <item.icon className="h-8 w-8 text-[#956D00]" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#956D00] text-xs font-bold text-white">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#3B2F08]">{item.title}</h3>
                  <p className="mx-auto max-w-xs text-sm text-[#7A6C4F]">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#E5DCC6] bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="text-heading-2 mb-4 text-[#3B2F08]">
              لماذا فالز؟
            </h2>
            <p className="mx-auto max-w-xl text-[#7A6C4F]">
              صُممت خصيصاً لاحتياجات المكاتب العقارية في المملكة العربية السعودية
            </p>
          </motion.div>
          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              {
                icon: Fingerprint,
                title: 'هوية مستقلة',
                desc: 'موقعك بنطاقك الخاص وهويتك البصرية — بدون ذكر فالز',
              },
              {
                icon: ShieldCheck,
                title: 'متوافق مع فال',
                desc: 'دعم كامل لرخصة الهيئة العامة للعقار ومتطلبات النظام',
              },
              {
                icon: Languages,
                title: 'تصميم عربي أصيل',
                desc: 'واجهة مصممة بالكامل للغة العربية مع تخطيط RTL احترافي',
              },
              {
                icon: Zap,
                title: 'بدون خبرة تقنية',
                desc: 'واجهة سهلة الاستخدام — لا تحتاج مطوّر أو مصمّم',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="rounded-xl border border-[#E5DCC6] bg-[#FFFDF5] p-6 text-center transition-colors hover:border-[#956D00]/40 hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F1E0]">
                  <item.icon className="h-7 w-7 text-[#956D00]" />
                </div>
                <h3 className="mb-2 font-semibold text-[#3B2F08]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#7A6C4F]">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[#E5DCC6] bg-[#FFFDF5] py-28">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease }}
            className="mb-4"
          >
            <h2 className="text-heading-2 text-[#3B2F08]">
              خطط تناسب حجم مكتبك
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
            className="mx-auto mb-4 max-w-xl text-[#7A6C4F]"
          >
            ابدأ مجاناً مع الخطة الأساسية وطوّر حسب نمو مكتبك
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease, delay: 0.15 }}
            className="mx-auto mb-12 text-sm text-[#7A5A00]"
          >
            وفّر مع الاشتراك السنوي — شهرين مجاناً
          </motion.p>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={staggerGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              {
                name: 'أساسي',
                price: 'مجاناً',
                period: '',
                popular: false,
                features: ['10 عقارات', '2 وكلاء', 'موقع إلكتروني', 'مدونة'],
              },
              {
                name: 'احترافي',
                price: '299',
                period: 'ر.س/شهر',
                popular: true,
                features: [
                  '50 عقار',
                  '10 وكلاء',
                  'نطاق مخصص',
                  'تحليلات متقدمة',
                  'تقارير PDF',
                ],
              },
              {
                name: 'مؤسسي',
                price: '799',
                period: 'ر.س/شهر',
                popular: false,
                features: [
                  'عقارات غير محدودة',
                  'وكلاء غير محدود',
                  'كل المميزات',
                  'دعم ذو أولوية',
                  'API',
                ],
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`relative rounded-xl border p-8 transition-colors ${
                  plan.popular
                    ? 'border-[#956D00] bg-white shadow-lg ring-1 ring-[#956D00]/20'
                    : 'border-[#E5DCC6] bg-white shadow-sm hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#956D00] px-4 py-1 text-xs font-bold text-white shadow-sm">
                    الأكثر شيوعاً
                  </div>
                )}
                <h3 className="mb-2 text-xl font-bold text-[#3B2F08]">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-[#956D00]">{plan.price}</span>
                  {plan.period && (
                    <span className="mr-1 text-sm text-[#7A6C4F]">{plan.period}</span>
                  )}
                </div>
                <ul className="mb-8 space-y-3 text-sm text-[#7A6C4F]">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F7F1E0] text-xs text-[#956D00]">
                        &#10003;
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/auth/signup"
                    className={`block rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-[#956D00] text-white shadow-sm hover:bg-[#7A5A00]'
                        : 'border border-[#E5DCC6] text-[#3B2F08] hover:border-[#956D00]/40 hover:bg-[#F7F1E0]'
                    }`}
                  >
                    ابدأ الآن
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#3B2F08] to-[#2E2506] py-28">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-transparent via-[#956D00] to-transparent" />
        <div className="absolute -bottom-20 right-1/3 h-[300px] w-[300px] rounded-full bg-[#956D00]/[0.04] blur-3xl" />

        <motion.div
          className="relative mx-auto max-w-3xl px-6 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-heading-2 mb-6 text-white"
          >
            جاهز لبناء حضورك الرقمي؟
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-10 text-lg text-white/70">
            انضم لأكثر من 100 مكتب عقاري يستخدم فالز لإدارة عقاراته وجذب العملاء
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 rounded-lg bg-[#956D00] px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-[#7A5A00] hover:shadow-lg"
              >
                أنشئ موقعك الآن
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition-all hover:border-white/40 hover:bg-white/10"
              >
                <Mail className="h-5 w-5" />
                تواصل معنا
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <footer className="border-t border-[#2A1F0E] bg-[#362A16] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <FalzLogo variant="light" size="sm" showWordmark={false} />
                <span className="font-bold text-[#C8A96E]">FALZ</span>
              </div>
              <p className="text-sm leading-relaxed text-[#C4B89A]">
                البنية الرقمية الاحترافية للمكاتب العقارية في المملكة العربية السعودية
              </p>
            </div>

            <nav aria-label="روابط سريعة">
              <h4 className="mb-4 text-sm font-semibold text-[#E5DCC6]">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-[#C4B89A]">
                <li>
                  <Link href="/auth/signup" className="transition-colors hover:text-[#C8A96E]">
                    إنشاء حساب
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signin" className="transition-colors hover:text-[#C8A96E]">
                    تسجيل الدخول
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition-colors hover:text-[#C8A96E]">
                    تواصل معنا
                  </Link>
                </li>
                <li>
                  <Link href="/dar-al-aseel" className="transition-colors hover:text-[#C8A96E]">
                    مثال حي
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-[#E5DCC6]">تواصل معنا</h4>
              <ul className="space-y-2 text-sm text-[#C4B89A]">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  info@falz.sa
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">+966 50 000 0000</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-[#5A4A30] pt-6 text-center text-xs text-[#9A8E6E]">
            © {new Date().getFullYear()} FALZ. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  )
}
