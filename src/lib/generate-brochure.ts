'use client'

import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface BrochureProperty {
  title: string
  titleAr: string | null
  description: string | null
  price: string
  currency: string
  dealType: string
  propertyType: string
  category: string
  city: string | null
  district: string | null
  area: number | null
  builtArea: number | null
  bedrooms: number | null
  bathrooms: number | null
  borderNorth: number | null
  borderSouth: number | null
  borderEast: number | null
  borderWest: number | null
  streetWidth: string | null
  age: number | null
  facing: string | null
  deedNumber: string | null
  slug: string
  officeSlug: string
  officeName: string
  officeFalLicense: string | null
}

const dealTypeAr: Record<string, string> = {
  SALE: 'للبيع',
  RENT: 'للإيجار',
}

const categoryAr: Record<string, string> = {
  RESIDENTIAL: 'سكني',
  COMMERCIAL: 'تجاري',
  AGRICULTURAL: 'زراعي',
}

export function generatePropertyBrochure(property: BrochureProperty) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPos = margin

  // Helper for RTL Arabic text - jsPDF has limited RTL support
  // We reverse display for visual alignment
  const addArabicText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, { align: 'right', ...options })
  }

  // ── Header Banner ──
  doc.setFillColor(30, 58, 95) // #1E3A5F
  doc.rect(0, 0, pageWidth, 40, 'F')
  doc.setFillColor(200, 169, 110) // #C8A96E accent
  doc.rect(0, 40, pageWidth, 3, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  addArabicText(property.officeName, pageWidth - margin, 18)
  doc.setFontSize(10)
  if (property.officeFalLicense) {
    addArabicText(`رخصة فال: ${property.officeFalLicense}`, pageWidth - margin, 30)
  }

  yPos = 55

  // ── Property Title ──
  doc.setTextColor(30, 58, 95)
  doc.setFontSize(18)
  addArabicText(property.titleAr || property.title, pageWidth - margin, yPos)
  yPos += 10

  // ── Deal Type & Category Badge ──
  doc.setFontSize(11)
  doc.setTextColor(200, 169, 110)
  const badgeText = `${dealTypeAr[property.dealType] || property.dealType} | ${categoryAr[property.category] || property.category}`
  addArabicText(badgeText, pageWidth - margin, yPos)
  yPos += 12

  // ── Divider ──
  doc.setDrawColor(200, 169, 110)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // ── Price ──
  doc.setTextColor(30, 58, 95)
  doc.setFontSize(14)
  const priceNum = parseInt(property.price).toLocaleString('en-US')
  addArabicText(`السعر: ${priceNum} ر.س`, pageWidth - margin, yPos)
  yPos += 12

  // ── Location ──
  if (property.city || property.district) {
    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    const locationParts = [property.city, property.district].filter(Boolean).join(' - ')
    addArabicText(`الموقع: ${locationParts}`, pageWidth - margin, yPos)
    yPos += 10
  }

  // ── Specs Table ──
  yPos += 5
  const specsData: string[][] = []

  if (property.area) specsData.push(['المساحة الإجمالية', `${property.area} م²`])
  if (property.builtArea) specsData.push(['مسطح البناء', `${property.builtArea} م²`])
  if (property.bedrooms && property.bedrooms > 0) specsData.push(['غرف النوم', `${property.bedrooms}`])
  if (property.bathrooms && property.bathrooms > 0) specsData.push(['دورات المياه', `${property.bathrooms}`])
  if (property.facing) specsData.push(['الواجهة', property.facing])
  if (property.streetWidth) specsData.push(['عرض الشارع', `${property.streetWidth} م`])
  if (property.age !== null && property.age !== undefined) specsData.push(['عمر العقار', property.age === 0 ? 'جديد' : `${property.age} سنة`])
  if (property.deedNumber) specsData.push(['رقم الصك', property.deedNumber])

  // Border dimensions
  if (property.borderNorth) specsData.push(['الحد الشمالي', `${property.borderNorth} م`])
  if (property.borderSouth) specsData.push(['الحد الجنوبي', `${property.borderSouth} م`])
  if (property.borderEast) specsData.push(['الحد الشرقي', `${property.borderEast} م`])
  if (property.borderWest) specsData.push(['الحد الغربي', `${property.borderWest} م`])

  if (specsData.length > 0) {
    doc.setFontSize(13)
    doc.setTextColor(30, 58, 95)
    addArabicText('المواصفات', pageWidth - margin, yPos)
    yPos += 6

    ;(doc as any).autoTable({
      startY: yPos,
      body: specsData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 4,
        halign: 'right',
        textColor: [45, 55, 72],
        lineColor: [226, 232, 240],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: [250, 250, 247] },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // ── Description ──
  if (property.description) {
    doc.setFontSize(13)
    doc.setTextColor(30, 58, 95)
    addArabicText('الوصف', pageWidth - margin, yPos)
    yPos += 7
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    const descLines = doc.splitTextToSize(property.description, pageWidth - 2 * margin)
    doc.text(descLines, pageWidth - margin, yPos, { align: 'right' })
    yPos += descLines.length * 5 + 10
  }

  // ── Footer ──
  const footerY = pageHeight - 20
  doc.setFillColor(30, 58, 95)
  doc.rect(0, footerY - 5, pageWidth, 25, 'F')
  doc.setFillColor(200, 169, 110)
  doc.rect(0, footerY - 5, pageWidth, 2, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  addArabicText(property.officeName, pageWidth - margin, footerY + 5)
  doc.setFontSize(8)
  doc.setTextColor(200, 200, 200)
  addArabicText('تم إنشاء هذا الكتيب تلقائياً عبر منصة FALZ', pageWidth - margin, footerY + 12)

  // Save
  const fileName = `${property.titleAr || property.title} - بروشور.pdf`
  doc.save(fileName)
}
