'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { SectionItem, SectionType } from '@/types/sections'

interface SectionItemsEditorProps {
  sectionType: SectionType
  items: SectionItem[]
  onChange: (items: SectionItem[]) => void
}

// Define which fields each section type's items have
const ITEM_FIELDS: Record<string, { key: keyof SectionItem; label: string; type: 'text' | 'textarea' | 'number' | 'url' }[]> = {
  testimonials: [
    { key: 'name', label: 'الاسم (إنجليزي)', type: 'text' },
    { key: 'nameAr', label: 'الاسم (عربي)', type: 'text' },
    { key: 'role', label: 'المنصب (إنجليزي)', type: 'text' },
    { key: 'roleAr', label: 'المنصب (عربي)', type: 'text' },
    { key: 'description', label: 'الشهادة (إنجليزي)', type: 'textarea' },
    { key: 'descriptionAr', label: 'الشهادة (عربي)', type: 'textarea' },
    { key: 'photoUrl', label: 'رابط الصورة', type: 'url' },
    { key: 'rating', label: 'التقييم (1-5)', type: 'number' },
  ],
  team: [
    { key: 'name', label: 'الاسم (إنجليزي)', type: 'text' },
    { key: 'nameAr', label: 'الاسم (عربي)', type: 'text' },
    { key: 'role', label: 'المنصب (إنجليزي)', type: 'text' },
    { key: 'roleAr', label: 'المنصب (عربي)', type: 'text' },
    { key: 'photoUrl', label: 'رابط الصورة', type: 'url' },
    { key: 'description', label: 'نبذة (إنجليزي)', type: 'textarea' },
    { key: 'descriptionAr', label: 'نبذة (عربي)', type: 'textarea' },
    { key: 'link', label: 'رابط', type: 'url' },
  ],
  partners: [
    { key: 'name', label: 'الاسم (إنجليزي)', type: 'text' },
    { key: 'nameAr', label: 'الاسم (عربي)', type: 'text' },
    { key: 'logoUrl', label: 'رابط الشعار', type: 'url' },
    { key: 'url', label: 'رابط الموقع', type: 'url' },
  ],
  gallery: [
    { key: 'imageUrl', label: 'رابط الصورة', type: 'url' },
    { key: 'title', label: 'العنوان (إنجليزي)', type: 'text' },
    { key: 'titleAr', label: 'العنوان (عربي)', type: 'text' },
    { key: 'description', label: 'الوصف (إنجليزي)', type: 'text' },
    { key: 'descriptionAr', label: 'الوصف (عربي)', type: 'text' },
  ],
  services: [
    { key: 'title', label: 'العنوان (إنجليزي)', type: 'text' },
    { key: 'titleAr', label: 'العنوان (عربي)', type: 'text' },
    { key: 'description', label: 'الوصف (إنجليزي)', type: 'textarea' },
    { key: 'descriptionAr', label: 'الوصف (عربي)', type: 'textarea' },
    { key: 'icon', label: 'أيقونة', type: 'text' },
  ],
}

export function SectionItemsEditor({ sectionType, items, onChange }: SectionItemsEditorProps) {
  const fields = ITEM_FIELDS[sectionType]
  if (!fields) return null

  const addItem = () => {
    onChange([...items, {}])
  }

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, key: string, value: any) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, [key]: key === 'rating' ? Number(value) || 0 : value } : item
    )
    onChange(updated)
  }

  const moveItem = (idx: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= newItems.length) return
    ;[newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]]
    onChange(newItems)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-[#4A5568] font-semibold">
          العناصر ({items.length})
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="h-7 text-xs gap-1"
        >
          <Plus className="h-3 w-3" />
          إضافة
        </Button>
      </div>

      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] p-3 space-y-2"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <GripVertical className="h-3.5 w-3.5 text-[#A0AEC0]" />
              <span className="text-xs font-medium text-[#718096]">
                عنصر {idx + 1}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {idx > 0 && (
                <button
                  onClick={() => moveItem(idx, 'up')}
                  className="text-[#718096] hover:text-[#2D3748] text-xs px-1"
                >
                  ▲
                </button>
              )}
              {idx < items.length - 1 && (
                <button
                  onClick={() => moveItem(idx, 'down')}
                  className="text-[#718096] hover:text-[#2D3748] text-xs px-1"
                >
                  ▼
                </button>
              )}
              <button
                onClick={() => removeItem(idx)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {fields.map((field) => {
            const value = (item as any)[field.key] ?? ''

            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="space-y-0.5">
                  <Label className="text-[10px] text-[#718096]">{field.label}</Label>
                  <textarea
                    value={value}
                    onChange={(e) => updateItem(idx, field.key, e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-[#E2E8F0] px-2 py-1 text-xs text-[#2D3748] focus:border-[#C8A96E] focus:outline-none resize-none"
                    dir={field.key.endsWith('Ar') ? 'rtl' : 'ltr'}
                  />
                </div>
              )
            }

            if (field.type === 'number') {
              return (
                <div key={field.key} className="space-y-0.5">
                  <Label className="text-[10px] text-[#718096]">{field.label}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={value}
                    onChange={(e) => updateItem(idx, field.key, e.target.value)}
                    className="h-7 text-xs"
                    dir="ltr"
                  />
                </div>
              )
            }

            return (
              <div key={field.key} className="space-y-0.5">
                <Label className="text-[10px] text-[#718096]">{field.label}</Label>
                <Input
                  value={value}
                  onChange={(e) => updateItem(idx, field.key, e.target.value)}
                  className="h-7 text-xs"
                  dir={field.key.endsWith('Ar') ? 'rtl' : field.type === 'url' ? 'ltr' : 'ltr'}
                  placeholder={field.type === 'url' ? 'https://...' : ''}
                />
              </div>
            )
          })}
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-xs text-center text-[#A0AEC0] py-4">
          لا توجد عناصر. اضغط &quot;إضافة&quot; لإضافة عنصر جديد.
        </p>
      )}
    </div>
  )
}
