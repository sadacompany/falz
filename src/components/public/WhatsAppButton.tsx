'use client'

import { usePublicOffice } from './PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { WhatsAppIcon } from './WhatsAppIcon'

export function WhatsAppButton() {
  const { office } = usePublicOffice()
  const { isRtl } = useDirection()

  if (!office.whatsapp) return null

  const whatsappNumber = office.whatsapp.replace(/[^0-9]/g, '')

  function handleClick() {
    fetch('/api/public/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        officeId: office.id,
        eventType: 'whatsapp_click',
        page: window.location.pathname,
        visitorId: getVisitorId(),
      }),
    }).catch(() => {})
  }

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-6 z-50 flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl bg-[#25D366] text-white"
      style={{
        [isRtl ? 'left' : 'right']: '1.5rem',
      }}
      aria-label="واتساب"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('falz_visitor_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('falz_visitor_id', id)
  }
  return id
}
