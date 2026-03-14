'use client'

import { useEffect } from 'react'
import type { PageSectionConfig } from '@/types/sections'
import type { ThemeConfig } from '@/lib/theme'

interface PreviewModeListenerProps {
  onSectionsUpdate: (sections: PageSectionConfig[]) => void
  onThemeUpdate?: (theme: ThemeConfig) => void
}

export function PreviewModeListener({ onSectionsUpdate, onThemeUpdate }: PreviewModeListenerProps) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only accept messages from same origin (dashboard iframe parent)
      if (event.origin !== window.location.origin) return

      if (event.data?.type === 'falz-preview-update' && Array.isArray(event.data.sections)) {
        onSectionsUpdate(event.data.sections)
      }

      if (event.data?.type === 'falz-theme-update' && event.data.theme) {
        onThemeUpdate?.(event.data.theme)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSectionsUpdate, onThemeUpdate])

  return null
}
