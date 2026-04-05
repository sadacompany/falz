import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FALZ — المنصة الرقمية المتكاملة للمكاتب العقارية'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#070b15',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="#D4AF37"
        >
          <rect x="0" y="0" width="14" height="40" />
          <rect x="24" y="0" width="76" height="14" />
          <rect x="24" y="24" width="52" height="14" />
          <path d="M0 52V100H24V66H14V52Z" />
          <rect x="24" y="66" width="52" height="14" />
        </svg>

        {/* Brand name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0px',
            marginTop: '32px',
          }}
        >
          <span style={{ fontSize: '64px', fontWeight: 900, color: '#ffffff', letterSpacing: '2px' }}>
            FAL
          </span>
          <span style={{ fontSize: '64px', fontWeight: 900, color: '#D4AF37', letterSpacing: '2px' }}>
            Z
          </span>
        </div>

        {/* Tagline in Arabic */}
        <div
          style={{
            fontSize: '28px',
            color: '#9ca3af',
            marginTop: '16px',
            direction: 'rtl',
          }}
        >
          المنصة الرقمية المتكاملة للمكاتب العقارية
        </div>
      </div>
    ),
    { ...size }
  )
}
