import Link from 'next/link'
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

export default function LandingPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#110F0D] text-[#E8E0D0]">
      {/* ───── Header ───── */}
      <header className="sticky top-0 z-50 border-b border-[#C8A96E]/10 bg-[#110F0D]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <FalzLogo variant="gold" size="sm" />
            <span className="text-xl font-bold tracking-tight text-[#C8A96E]">FALZ</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-sm text-[#8A7E5E] transition-colors hover:text-[#E8E0D0]"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-[#C8A96E] px-5 py-2 text-sm font-semibold text-[#110F0D] shadow-sm transition-all hover:bg-[#D4B87A] hover:shadow-md"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </header>

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C8A96E]/[0.03] via-transparent to-[#C8A96E]/[0.02]" />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #C8A96E 0.5px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Floating orbs */}
        <div className="animate-orb absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-[#C8A96E]/[0.04] blur-3xl" />
        <div className="animate-orb-reverse absolute -bottom-24 left-1/4 h-[340px] w-[340px] rounded-full bg-[#C8A96E]/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up stagger-1 mb-6 inline-flex items-center gap-2 rounded-full border border-[#C8A96E]/20 bg-[#C8A96E]/[0.08] px-4 py-1.5 text-sm font-medium text-[#C8A96E]">
            <Building2 className="h-4 w-4" />
            البنية الرقمية الاحترافية للمكاتب العقارية
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up stagger-2 mx-auto max-w-4xl text-4xl font-bold leading-tight text-[#E8E0D0] md:text-6xl md:leading-tight lg:text-7xl lg:leading-tight">
            امنح مكتبك العقاري
            <br />
            <span className="text-[#C8A96E]">
              حضوراً رقمياً استثنائياً
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up stagger-3 mx-auto mt-6 max-w-2xl text-lg text-[#8A7E5E] md:text-xl">
            منصة فالز تمكّنك من بناء موقعك الإلكتروني الخاص، إدارة عقاراتك،
            تتبع العملاء المحتملين، وتحليل أدائك — كل ذلك تحت هويتك المستقلة
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up stagger-4 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-lg bg-[#C8A96E] px-8 py-3.5 text-base font-semibold text-[#110F0D] shadow-md transition-all hover:bg-[#D4B87A] hover:shadow-lg hover:shadow-[#C8A96E]/10"
            >
              أنشئ موقعك الآن
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link
              href="/dar-al-aseel"
              className="flex items-center gap-2 rounded-lg border border-[#2D2822] bg-[#1A1714] px-8 py-3.5 text-base font-semibold text-[#E8E0D0] shadow-sm transition-all hover:border-[#C8A96E]/30 hover:bg-[#252119]"
            >
              شاهد مثال حي
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Social Proof Strip ───── */}
      <section className="border-y border-[#2D2822] bg-[#0D0C0A] py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="animate-on-scroll mb-8 text-sm font-medium uppercase tracking-wider text-[#5A5040]">
            أكثر من 100 مكتب عقاري يثق بمنصة فالز
          </p>
          <div className="animate-on-scroll grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '+100', label: 'مكتب عقاري' },
              { value: '+2,500', label: 'عقار مُدرج' },
              { value: '+15,000', label: 'عميل محتمل' },
              { value: '99.9%', label: 'وقت التشغيل' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-[#C8A96E] md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-[#6B5D3A]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Features Grid ───── */}
      <section className="border-t border-[#2D2822] bg-[#161411] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="animate-on-scroll mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#E8E0D0] md:text-4xl">
              كل ما يحتاجه مكتبك العقاري
            </h2>
            <p className="mx-auto max-w-2xl text-[#8A7E5E]">
              منصة متكاملة صُممت خصيصاً للسوق السعودي — من الموقع الإلكتروني إلى إدارة العملاء
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
              <div
                key={i}
                className={`animate-on-scroll stagger-${i + 1} group rounded-xl border border-[#2D2822] bg-[#1A1714] p-6 transition-all duration-300 hover:border-[#C8A96E]/30 hover:shadow-lg hover:shadow-[#C8A96E]/5`}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#C8A96E]/[0.08] transition-colors group-hover:bg-[#C8A96E]/[0.15]">
                  <feature.icon className="h-6 w-6 text-[#C8A96E]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#E8E0D0]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[#8A7E5E]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="border-t border-[#2D2822] bg-[#110F0D] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="animate-on-scroll mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#E8E0D0] md:text-4xl">
              ابدأ في ثلاث خطوات بسيطة
            </h2>
            <p className="mx-auto max-w-xl text-[#8A7E5E]">
              لا تحتاج خبرة تقنية — سجّل وانطلق في دقائق
            </p>
          </div>
          <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
            {/* Connector line (desktop) */}
            <div className="absolute top-12 right-[16.67%] left-[16.67%] hidden h-px border-t-2 border-dashed border-[#C8A96E]/20 md:block" />

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
              <div
                key={i}
                className={`animate-on-scroll stagger-${i + 1} relative text-center`}
              >
                <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#C8A96E]/20 bg-[#1A1714]">
                  <item.icon className="h-8 w-8 text-[#C8A96E]" />
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#C8A96E] text-xs font-bold text-[#110F0D]">
                    {item.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#E8E0D0]">{item.title}</h3>
                <p className="mx-auto max-w-xs text-sm text-[#8A7E5E]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Why Falz ───── */}
      <section className="border-t border-[#2D2822] bg-[#161411] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="animate-on-scroll mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#E8E0D0] md:text-4xl">
              لماذا فالز؟
            </h2>
            <p className="mx-auto max-w-xl text-[#8A7E5E]">
              صُممت خصيصاً لاحتياجات المكاتب العقارية في المملكة العربية السعودية
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
              <div
                key={i}
                className={`animate-on-scroll stagger-${i + 1} rounded-xl border border-[#2D2822] bg-[#1A1714] p-6 text-center transition-all duration-300 hover:border-[#C8A96E]/30 hover:shadow-md hover:shadow-[#C8A96E]/5`}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#C8A96E]/[0.08]">
                  <item.icon className="h-7 w-7 text-[#C8A96E]" />
                </div>
                <h3 className="mb-2 font-semibold text-[#E8E0D0]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#8A7E5E]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Pricing ───── */}
      <section className="border-t border-[#2D2822] bg-[#110F0D] py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="animate-on-scroll mb-4">
            <h2 className="text-3xl font-bold text-[#E8E0D0] md:text-4xl">
              خطط تناسب حجم مكتبك
            </h2>
          </div>
          <p className="animate-on-scroll mx-auto mb-4 max-w-xl text-[#8A7E5E]">
            ابدأ مجاناً مع الخطة الأساسية وطوّر حسب نمو مكتبك
          </p>
          <p className="animate-on-scroll mx-auto mb-12 text-sm text-[#C8A96E]">
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
                className={`animate-on-scroll stagger-${i + 1} relative rounded-xl border p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'border-[#C8A96E] bg-[#1A1714] shadow-lg shadow-[#C8A96E]/10 ring-1 ring-[#C8A96E]/20'
                    : 'border-[#2D2822] bg-[#1A1714] shadow-sm hover:border-[#C8A96E]/20 hover:shadow-md hover:shadow-[#C8A96E]/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#C8A96E] px-4 py-1 text-xs font-bold text-[#110F0D] shadow-sm">
                    الأكثر شيوعاً
                  </div>
                )}
                <h3 className="mb-2 text-xl font-bold text-[#E8E0D0]">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-[#C8A96E]">{plan.price}</span>
                  {plan.period && (
                    <span className="mr-1 text-sm text-[#8A7E5E]">{plan.period}</span>
                  )}
                </div>
                <ul className="mb-8 space-y-3 text-sm text-[#8A7E5E]">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C8A96E]/10 text-xs text-[#C8A96E]">
                        &#10003;
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block rounded-lg py-3 text-center text-sm font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-[#C8A96E] text-[#110F0D] shadow-sm hover:bg-[#D4B87A]'
                      : 'border border-[#2D2822] text-[#E8E0D0] hover:border-[#C8A96E]/30 hover:bg-[#252119]'
                  }`}
                >
                  ابدأ الآن
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="relative overflow-hidden bg-[#0A0908] py-20">
        {/* Gold accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#C8A96E]/30 to-transparent" />
        {/* Subtle orb */}
        <div className="animate-orb absolute -bottom-20 right-1/3 h-[300px] w-[300px] rounded-full bg-[#C8A96E]/[0.04] blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="animate-on-scroll mb-6 text-3xl font-bold text-[#E8E0D0] md:text-4xl">
            جاهز لبناء حضورك الرقمي؟
          </h2>
          <p className="animate-on-scroll mb-10 text-lg text-[#6B5D3A]">
            انضم لأكثر من 100 مكتب عقاري يستخدم فالز لإدارة عقاراته وجذب العملاء
          </p>
          <div className="animate-on-scroll flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-lg bg-[#C8A96E] px-8 py-3.5 text-base font-semibold text-[#110F0D] shadow-md transition-all hover:bg-[#D4B87A] hover:shadow-lg hover:shadow-[#C8A96E]/10"
            >
              أنشئ موقعك الآن
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-lg border border-[#C8A96E]/20 px-8 py-3.5 text-base font-semibold text-[#C8A96E] transition-all hover:border-[#C8A96E]/40 hover:bg-[#C8A96E]/10"
            >
              <Mail className="h-5 w-5" />
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-[#1A1714] bg-[#0A0908] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <FalzLogo variant="light" size="sm" showWordmark={false} />
                <span className="font-bold text-[#C8A96E]">FALZ</span>
              </div>
              <p className="text-sm leading-relaxed text-[#6B5D3A]">
                البنية الرقمية الاحترافية للمكاتب العقارية في المملكة العربية السعودية
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-[#8A7E5E]">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-[#6B5D3A]">
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
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-[#8A7E5E]">تواصل معنا</h4>
              <ul className="space-y-2 text-sm text-[#6B5D3A]">
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

          <div className="mt-10 border-t border-[#1A1714] pt-6 text-center text-xs text-[#4A4235]">
            © {new Date().getFullYear()} FALZ. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>

      {/* ───── Scroll Animation Observer ───── */}
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
