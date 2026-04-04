import type { Metadata } from 'next'
import { DM_Sans, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FALZ — البنية الرقمية للمكاتب العقارية',
  description:
    'منصة فالز تمكّن المكاتب العقارية من بناء حضورها الرقمي الاحترافي مع مواقع إلكترونية مخصصة وأدوات إدارة متقدمة',
  keywords: ['عقارات', 'مكاتب عقارية', 'منصة عقارية', 'السعودية', 'FALZ', 'real estate', 'Saudi Arabia'],
  openGraph: {
    title: 'FALZ — Real Estate Digital Infrastructure',
    description: 'Professional digital infrastructure for real estate offices in Saudi Arabia',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${ibmPlexArabic.variable} font-sans antialiased bg-[#FFFDF5] text-[#2E2506]`}>
        {children}
      </body>
    </html>
  )
}
