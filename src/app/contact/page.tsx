'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FalzLogo } from '@/components/shared/FalzLogo'
import { Mail, Phone, MapPin, Send, Check, Loader2, ArrowRight } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الرسالة')
      }

      setStatus('success')
      setForm({ name: '', email: '', phone: '', company: '', message: '' })
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال الرسالة')
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#FFFDF5] text-[#2E2506]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E8DFC4]/80 bg-[#FFFDF5]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <FalzLogo variant="dark" size="sm" />
            <span className="text-xl font-bold tracking-tight text-[#44360E]">FALZ</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#6B5D3A] transition-colors hover:text-[#44360E]"
          >
            الرئيسية
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F9F3E3]/50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-3xl font-bold text-[#44360E] md:text-5xl">تواصل معنا</h1>
          <p className="mx-auto mt-4 max-w-xl text-[#6B5D3A]">
            نسعد بتواصلك معنا. أرسل رسالتك وسنرد عليك في أقرب وقت ممكن
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#44360E] mb-6">معلومات التواصل</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FBF6E1]">
                    <Mail className="h-5 w-5 text-[#B8860B]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#44360E]">البريد الإلكتروني</p>
                    <p className="text-sm text-[#6B5D3A]">info@falz.sa</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FBF6E1]">
                    <Phone className="h-5 w-5 text-[#B8860B]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#44360E]">الهاتف</p>
                    <p className="text-sm text-[#6B5D3A]" dir="ltr">+966 50 000 0000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FBF6E1]">
                    <MapPin className="h-5 w-5 text-[#B8860B]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#44360E]">الموقع</p>
                    <p className="text-sm text-[#6B5D3A]">الرياض، المملكة العربية السعودية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-[#E8DFC4] bg-white p-8 shadow-sm">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <Check className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#44360E]">تم إرسال رسالتك بنجاح</h3>
                  <p className="mt-2 text-[#6B5D3A]">شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 rounded-lg bg-[#B8860B] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9A7209]"
                  >
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#44360E]">
                        الاسم <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-[#E8DFC4] bg-[#FFFDF5] px-4 py-2.5 text-sm text-[#2E2506] placeholder:text-[#9A8E6E] focus:border-[#B8860B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                        placeholder="اسمك الكامل"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#44360E]">
                        البريد الإلكتروني <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-lg border border-[#E8DFC4] bg-[#FFFDF5] px-4 py-2.5 text-sm text-[#2E2506] placeholder:text-[#9A8E6E] focus:border-[#B8860B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#44360E]">
                        رقم الجوال
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full rounded-lg border border-[#E8DFC4] bg-[#FFFDF5] px-4 py-2.5 text-sm text-[#2E2506] placeholder:text-[#9A8E6E] focus:border-[#B8860B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                        placeholder="+966"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#44360E]">
                        اسم الشركة / المكتب
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full rounded-lg border border-[#E8DFC4] bg-[#FFFDF5] px-4 py-2.5 text-sm text-[#2E2506] placeholder:text-[#9A8E6E] focus:border-[#B8860B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                        placeholder="اسم المكتب العقاري"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#44360E]">
                      الرسالة <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-lg border border-[#E8DFC4] bg-[#FFFDF5] px-4 py-2.5 text-sm text-[#2E2506] placeholder:text-[#9A8E6E] focus:border-[#B8860B] focus:outline-none focus:ring-1 focus:ring-[#B8860B] resize-none"
                      placeholder="كيف يمكننا مساعدتك؟"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-500">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B8860B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A7209] disabled:opacity-60"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    إرسال الرسالة
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8DFC4] bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-[#9A8E6E]">
          © {new Date().getFullYear()} FALZ. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  )
}
