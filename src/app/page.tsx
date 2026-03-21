import Link from 'next/link'
import {
  ArrowLeft,
  Globe,
  UserPlus,
  Settings,
  Rocket,
  Fingerprint,
  ShieldCheck,
  Languages,
  Zap,
  Check,
  ChevronLeft,
  Mail,
  Phone,
} from 'lucide-react'
import { FalzLogo } from '@/components/shared/FalzLogo'

export default function LandingPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#FFFDF5] text-[#2E2506]">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between border-b border-[#E8DFC4]/60">
            <div className="flex items-center gap-2.5">
              <FalzLogo variant="dark" size="sm" />
              <span className="text-lg font-bold tracking-tight text-[#44360E]">FALZ</span>
            </div>
            <nav className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-[#6B5D3A] transition-colors hover:text-[#44360E]">
                المميزات
              </a>
              <a href="#how-it-works" className="text-sm text-[#6B5D3A] transition-colors hover:text-[#44360E]">
                كيف يعمل
              </a>
              <a href="#pricing" className="text-sm text-[#6B5D3A] transition-colors hover:text-[#44360E]">
                الأسعار
              </a>
            </nav>
            <div className="flex items-center gap-5">
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-[#44360E] transition-colors hover:text-[#B8860B]"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-[4px] bg-[#44360E] px-5 py-2 text-sm font-semibold text-[#FFFDF5] transition-colors hover:bg-[#2E2506]"
              >
                ابدأ الآن
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pb-28 pt-20 md:pb-36 md:pt-28 lg:pb-44 lg:pt-36">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #44360E 0.5px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Geometric accents */}
        <div className="absolute left-16 top-32 hidden h-32 w-32 rotate-45 border border-[#B8860B]/[0.08] lg:block" />
        <div className="absolute bottom-24 left-32 hidden h-20 w-20 rotate-12 border border-[#B8860B]/[0.06] lg:block" />
        <div className="absolute left-[55%] top-1/2 hidden h-[60%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-[#B8860B]/15 to-transparent lg:block" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Label */}
            <div className="animate-fade-in-up stagger-1 mb-10 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B8860B]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8860B]">
                البنية الرقمية للمكاتب العقارية
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up stagger-2 text-[2.75rem] font-bold leading-[1.15] tracking-tight text-[#44360E] md:text-6xl md:leading-[1.1] lg:text-[4.75rem] lg:leading-[1.08]">
              امنح مكتبك العقاري
              <br />
              حضوراً رقمياً
              <br />
              <span className="relative inline-block text-[#B8860B]">
                استثنائياً
                <span className="absolute -bottom-1.5 right-0 h-[3px] w-full rounded-full bg-[#B8860B]/25" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up stagger-3 mt-8 max-w-2xl text-lg leading-relaxed text-[#6B5D3A] md:text-xl">
              موقعك الإلكتروني، إدارة عقاراتك، تتبع العملاء المحتملين، وتحليل أدائك —
              كل ذلك تحت هويتك المستقلة
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up stagger-4 mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-[4px] bg-[#B8860B] px-7 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-[#9A7209] hover:shadow-md"
              >
                أنشئ موقعك الآن
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                href="/dar-al-aseel"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#44360E] transition-colors hover:text-[#B8860B]"
              >
                شاهد مثال حي
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="border-t border-[#B8860B]/20 bg-[#2E2506] py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="animate-on-scroll grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
            {[
              { value: '+100', label: 'مكتب عقاري' },
              { value: '+2,500', label: 'عقار مُدرج' },
              { value: '+15,000', label: 'عميل محتمل' },
              { value: '99.9%', label: 'وقت التشغيل' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`text-center ${i > 0 ? 'md:border-r md:border-[#4A3D20]' : ''}`}
              >
                <p className="text-3xl font-bold tracking-tight text-[#C8A96E] md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-[#A89870]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section heading */}
          <div className="animate-on-scroll mb-20 max-w-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B8860B]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8860B]">
                المميزات
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-tight text-[#44360E] md:text-[2.5rem]">
              كل ما يحتاجه مكتبك العقاري في منصة واحدة
            </h2>
          </div>

          {/* Feature 1 — Hero feature */}
          <div className="animate-on-scroll mb-16 grid items-center gap-10 border-b border-[#E8DFC4] pb-16 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <span className="select-none text-[4rem] font-bold leading-none text-[#E8DFC4]">
                01
              </span>
              <h3 className="-mt-2 text-2xl font-bold text-[#44360E] md:text-3xl">
                موقع إلكتروني احترافي
              </h3>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#6B5D3A]">
                موقع جاهز بهويتك الخاصة مع نطاق مخصص، تصاميم فاخرة، ودعم كامل للعربية والإنجليزية.
                صُمم ليعكس احترافية مكتبك ويجذب العملاء من اليوم الأول.
              </p>
            </div>
            <div className="hidden lg:col-span-2 lg:block">
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#F5EDD5] to-[#EDE3C5]">
                <Globe className="h-16 w-16 text-[#B8860B]/25" />
              </div>
            </div>
          </div>

          {/* Features 2–3 */}
          <div className="mb-16 grid gap-12 border-b border-[#E8DFC4] pb-16 md:grid-cols-2 md:gap-16">
            {[
              {
                num: '02',
                title: 'إدارة العقارات',
                desc: 'إضافة وإدارة العقارات بسهولة مع صور متعددة، فيديو، جولات 360°، وبيانات تفصيلية',
              },
              {
                num: '03',
                title: 'تحليلات متقدمة',
                desc: 'تتبع الزيارات، العملاء المحتملين، مصادر الزيارات، وتقارير شهرية بصيغة PDF',
              },
            ].map((f, i) => (
              <div key={i} className={`animate-on-scroll stagger-${i + 1}`}>
                <span className="select-none text-[3.5rem] font-bold leading-none text-[#E8DFC4]">
                  {f.num}
                </span>
                <h3 className="-mt-1 text-xl font-bold text-[#44360E]">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-[#6B5D3A]">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Features 4–6 */}
          <div className="grid gap-10 md:grid-cols-3 md:gap-12">
            {[
              {
                num: '04',
                title: 'إدارة العملاء',
                desc: 'نظام CRM متكامل لتتبع العملاء المحتملين من جميع المصادر مع تعيين تلقائي للوكلاء',
              },
              {
                num: '05',
                title: 'تخصيص كامل',
                desc: 'اختر من بين قوالب جاهزة أو خصص الألوان والخطوط لتتناسب مع هوية مكتبك',
              },
              {
                num: '06',
                title: 'مدونة متكاملة',
                desc: 'انشر مقالات ونصائح عقارية لتعزيز ظهورك في محركات البحث وبناء الثقة',
              },
            ].map((f, i) => (
              <div key={i} className={`animate-on-scroll stagger-${i + 1}`}>
                <span className="select-none text-[2.5rem] font-bold leading-none text-[#E8DFC4]">
                  {f.num}
                </span>
                <h3 className="text-lg font-semibold text-[#44360E]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B5D3A]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="bg-[#F5EDD5] py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="animate-on-scroll mb-16 max-w-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B8860B]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8860B]">
                كيف يعمل
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-tight text-[#44360E] md:text-[2.5rem]">
              ابدأ في ثلاث خطوات
            </h2>
            <p className="mt-4 text-[#6B5D3A]">
              لا تحتاج خبرة تقنية — سجّل وانطلق في دقائق
            </p>
          </div>

          <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
            {/* Connector line */}
            <div className="absolute left-[16.67%] right-[16.67%] top-8 hidden h-px bg-[#B8860B]/20 md:block" />

            {[
              {
                step: '01',
                icon: UserPlus,
                title: 'سجّل مكتبك',
                desc: 'أنشئ حسابك وأدخل بيانات مكتبك العقاري ورخصة فال',
              },
              {
                step: '02',
                icon: Settings,
                title: 'خصّص موقعك',
                desc: 'اختر القالب، ارفع الشعار، وعدّل الألوان لتتناسب مع هويتك',
              },
              {
                step: '03',
                icon: Rocket,
                title: 'انطلق!',
                desc: 'أضف عقاراتك وشارك موقعك مع عملائك — كل شيء جاهز',
              },
            ].map((item, i) => (
              <div key={i} className={`animate-on-scroll stagger-${i + 1} relative`}>
                <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center border border-[#B8860B]/20 bg-[#FFFDF5]">
                  <item.icon className="h-7 w-7 text-[#B8860B]" />
                  <span className="absolute -right-2.5 -top-2.5 flex h-6 w-6 items-center justify-center bg-[#B8860B] text-[10px] font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#44360E]">{item.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6B5D3A]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Falz ─── */}
      <section className="border-t border-[#E8DFC4] py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="animate-on-scroll mb-16 max-w-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B8860B]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8860B]">
                لماذا فالز
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-tight text-[#44360E] md:text-[2.5rem]">
              صُممت خصيصاً للسوق السعودي
            </h2>
          </div>

          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
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
                title: 'عربي وإنجليزي',
                desc: 'دعم كامل للغتين مع تخطيط RTL احترافي',
              },
              {
                icon: Zap,
                title: 'بدون خبرة تقنية',
                desc: 'واجهة سهلة الاستخدام — لا تحتاج مطوّر أو مصمّم',
              },
            ].map((item, i) => (
              <div key={i} className={`animate-on-scroll stagger-${i + 1}`}>
                <item.icon className="mb-4 h-6 w-6 text-[#B8860B]" />
                <h3 className="mb-2 font-bold text-[#44360E]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B5D3A]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="bg-[#F5EDD5] py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="animate-on-scroll mb-4 max-w-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B8860B]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8860B]">
                الأسعار
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-tight text-[#44360E] md:text-[2.5rem]">
              خطط تناسب حجم مكتبك
            </h2>
          </div>
          <p className="animate-on-scroll mb-3 max-w-xl text-[#6B5D3A]">
            ابدأ مجاناً مع الخطة الأساسية وطوّر حسب نمو مكتبك
          </p>
          <p className="animate-on-scroll mb-14 text-sm text-[#9A7209]">
            وفّر مع الاشتراك السنوي — شهرين مجاناً
          </p>

          <div className="grid gap-6 md:grid-cols-3">
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
              <div
                key={i}
                className={`animate-on-scroll stagger-${i + 1} relative bg-[#FFFDF5] p-8 transition-all ${
                  plan.popular
                    ? 'shadow-lg ring-2 ring-[#B8860B]'
                    : 'border border-[#E8DFC4] hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-px left-0 right-0 h-1 bg-[#B8860B]" />
                )}
                {plan.popular && (
                  <span className="mb-4 inline-block bg-[#B8860B] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    الأكثر شيوعاً
                  </span>
                )}
                <h3 className="mb-1 text-xl font-bold text-[#44360E]">{plan.name}</h3>
                <div className="mb-6 mt-4">
                  <span className="text-4xl font-bold text-[#44360E]">{plan.price}</span>
                  {plan.period && (
                    <span className="mr-1 text-sm text-[#6B5D3A]">{plan.period}</span>
                  )}
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-[#6B5D3A]">
                      <Check className="h-4 w-4 flex-shrink-0 text-[#B8860B]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block py-3 text-center text-sm font-semibold transition-all ${
                    plan.popular
                      ? 'bg-[#B8860B] text-white hover:bg-[#9A7209]'
                      : 'border border-[#E8DFC4] text-[#44360E] hover:border-[#B8860B]/40 hover:bg-[#F5EDD5]'
                  }`}
                >
                  ابدأ الآن
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden bg-[#2E2506] py-24 lg:py-28">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #C8A96E 0.5px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#B8860B]/30 to-transparent" />

        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="animate-on-scroll text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            جاهز لبناء حضورك الرقمي؟
          </h2>
          <p className="animate-on-scroll mt-6 text-lg text-[#A89870]">
            انضم لأكثر من 100 مكتب عقاري يستخدم فالز لإدارة عقاراته وجذب العملاء
          </p>
          <div className="animate-on-scroll mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-[#B8860B] px-8 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-[#9A7209]"
            >
              أنشئ موقعك الآن
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-[#C8A96E]/20 px-8 py-3.5 font-semibold text-[#C8A96E] transition-all hover:bg-[#C8A96E]/10"
            >
              <Mail className="h-4 w-4" />
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#3D3210] bg-[#231D08] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <FalzLogo variant="light" size="sm" showWordmark={false} />
                <span className="font-bold text-[#C8A96E]">FALZ</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-[#8A7E5E]">
                البنية الرقمية الاحترافية للمكاتب العقارية في المملكة العربية السعودية
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-[#C4B89A]">روابط سريعة</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/auth/signup" className="text-[#8A7E5E] transition-colors hover:text-[#C8A96E]">
                    إنشاء حساب
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signin" className="text-[#8A7E5E] transition-colors hover:text-[#C8A96E]">
                    تسجيل الدخول
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[#8A7E5E] transition-colors hover:text-[#C8A96E]">
                    تواصل معنا
                  </Link>
                </li>
                <li>
                  <Link href="/dar-al-aseel" className="text-[#8A7E5E] transition-colors hover:text-[#C8A96E]">
                    مثال حي
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-[#C4B89A]">تواصل معنا</h4>
              <ul className="space-y-2.5 text-sm text-[#8A7E5E]">
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

          <div className="mt-10 border-t border-[#3D3210] pt-6 text-center text-xs text-[#6B5D3A]">
            © {new Date().getFullYear()} FALZ. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>

      {/* ─── Scroll Animation Observer ─── */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var els = document.querySelectorAll('.animate-on-scroll');
              if (!els.length) return;
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                els.forEach(function(el){ el.classList.add('is-visible'); });
                return;
              }
              var observer = new IntersectionObserver(function(entries){
                entries.forEach(function(entry){
                  if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                  }
                });
              }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
              els.forEach(function(el){ observer.observe(el); });
            })();
          `,
        }}
      />
    </div>
  )
}
