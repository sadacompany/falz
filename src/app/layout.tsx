import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
      <body className={`${inter.variable} font-sans antialiased bg-[#FFFDF5] text-[#2E2506]`}>
        {children}
      </body>
    </html>
  )
}
