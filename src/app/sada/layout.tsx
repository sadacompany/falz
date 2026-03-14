import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Sada — Building meaningful digital products',
  description:
    'We design and build technology that improves lives across the Arab world.',
}

export default function SadaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div dir="ltr" lang="en" className={spaceGrotesk.variable}>
      {children}
    </div>
  )
}
