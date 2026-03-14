'use client'

import { useState, type FormEvent } from 'react'
import { usePublicOffice } from './PublicOfficeContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ContactFormProps {
  /** Lead source identifier */
  source: 'CONTACT_FORM' | 'PROPERTY_INQUIRY'
  /** Optional property ID when inquiring about a specific property */
  propertyId?: string
  /** Callback on successful submission */
  onSuccess?: () => void
}

export function ContactForm({ source, propertyId, onSuccess }: ContactFormProps) {
  const { office, dict } = usePublicOffice()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)

    const body = {
      officeId: office.id,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      source,
      propertyId: propertyId || undefined,
    }

    try {
      const res = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitted(true)
      form.reset()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl p-8 text-center bg-white border border-[#E2E8F0]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-[#2D3748]">
          {dict.property.inquirySent}
        </h3>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm mt-4 underline text-[#C8A96E] hover:text-[#B8963E]"
        >
          {dict.common.back}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-[#2D3748]">
          {dict.property.yourName} <span className="text-red-500">*</span>
        </label>
        <Input
          name="name"
          required
          placeholder={dict.property.yourName}
          className="bg-white border-[#E2E8F0] text-[#2D3748] placeholder:text-[#A0AEC0] focus:border-[#C8A96E] focus:ring-[#C8A96E]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-[#2D3748]">
          {dict.property.yourPhone} <span className="text-red-500">*</span>
        </label>
        <Input
          name="phone"
          type="tel"
          required
          dir="ltr"
          placeholder="05xxxxxxxx"
          className="bg-white border-[#E2E8F0] text-[#2D3748] placeholder:text-[#A0AEC0] focus:border-[#C8A96E] focus:ring-[#C8A96E]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-[#2D3748]">
          {dict.property.yourEmail}
        </label>
        <Input
          name="email"
          type="email"
          dir="ltr"
          placeholder="email@example.com"
          className="bg-white border-[#E2E8F0] text-[#2D3748] placeholder:text-[#A0AEC0] focus:border-[#C8A96E] focus:ring-[#C8A96E]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-[#2D3748]">
          {dict.property.yourMessage}
        </label>
        <textarea
          name="message"
          rows={4}
          placeholder={dict.property.interestedIn}
          className="flex w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#A0AEC0] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:border-[#C8A96E] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full h-12 text-base font-semibold rounded-xl bg-[#C8A96E] text-white hover:bg-[#B8963E] border-0"
      >
        {dict.property.sendInquiry}
      </Button>
    </form>
  )
}
