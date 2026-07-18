'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface MockMapPickerProps {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
  className?: string
}

// Preset locations for searching / auto-populating
const DISTRICT_PRESETS = [
  { name: 'العليا', nameEn: 'Al Olaya', lat: 24.7136, lng: 46.6753 },
  { name: 'الملز', nameEn: 'Al Malaz', lat: 24.6655, lng: 46.7329 },
  { name: 'الياسمين', nameEn: 'Al Yasmin', lat: 24.8183, lng: 46.6433 },
  { name: 'الصحافة', nameEn: 'Al Sahafah', lat: 24.8118, lng: 46.6268 },
  { name: 'القيروان', nameEn: 'Al Qairawan', lat: 24.8519, lng: 46.5925 },
  { name: 'الروضة', nameEn: 'Al Rawdah', lat: 24.7333, lng: 46.7833 },
]

export function MockMapPicker({
  lat,
  lng,
  onChange,
  className = 'rounded-xl overflow-hidden border border-edge bg-elevated',
}: MockMapPickerProps) {
  // Default to Riyadh center if no coords provided
  const currentLat = lat ?? 24.7136
  const currentLng = lng ?? 46.6753

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerInstanceRef = useRef<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<typeof DISTRICT_PRESETS>([])

  // Load Leaflet assets dynamically on client
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Add Leaflet CSS
    const linkId = 'leaflet-css'
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Add Leaflet JS
    const scriptId = 'leaflet-js'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => setLeafletLoaded(true)
      document.body.appendChild(script)
    } else {
      // Script already appended, check if globally available
      if ((window as any).L) {
        setLeafletLoaded(true)
      } else {
        const interval = setInterval(() => {
          if ((window as any).L) {
            setLeafletLoaded(true)
            clearInterval(interval)
          }
        }, 100)
        return () => clearInterval(interval)
      }
    }
  }, [])

  // Initialize and manage the Leaflet map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return
    const L = (window as any).L
    if (!L) return

    // Create map if it doesn't exist
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 13,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      // Fixed marker icon path issue in Leaflet + NextJS/Webpack
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })
      L.Marker.prototype.options.icon = DefaultIcon

      const marker = L.marker([currentLat, currentLng], {
        draggable: true,
      }).addTo(map)

      // Bind drag and click events
      marker.on('dragend', () => {
        const position = marker.getLatLng()
        onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)))
      })

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng)
        onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)))
      })

      mapInstanceRef.current = map
      markerInstanceRef.current = marker
    } else {
      // Map already exists, update marker and center if mismatch
      const map = mapInstanceRef.current
      const marker = markerInstanceRef.current
      const currentMarkerLatLng = marker.getLatLng()

      if (
        Math.abs(currentMarkerLatLng.lat - currentLat) > 0.0001 ||
        Math.abs(currentMarkerLatLng.lng - currentLng) > 0.0001
      ) {
        marker.setLatLng([currentLat, currentLng])
        map.panTo([currentLat, currentLng])
      }
    }
  }, [leafletLoaded, currentLat, currentLng, onChange])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Handle preset search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const filtered = DISTRICT_PRESETS.filter(
      (preset) =>
        preset.name.includes(searchQuery) ||
        preset.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSearchResults(filtered)
  }, [searchQuery])

  const selectPreset = (preset: typeof DISTRICT_PRESETS[0]) => {
    onChange(preset.lat, preset.lng)
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Map Search Presets */}
      <div className="relative p-3 pb-0">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <Input
            placeholder="ابحث عن حي في الرياض (مثال: العليا، الصحافة...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 text-right text-xs bg-page"
            dir="rtl"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute left-3 right-3 top-full z-[1000] mt-1 max-h-40 overflow-y-auto rounded-lg border border-edge bg-elevated shadow-lg divide-y divide-edge">
            {searchResults.map((result) => (
              <button
                key={result.name}
                type="button"
                onClick={() => selectPreset(result)}
                className="w-full px-3 py-2 text-right text-xs hover:bg-card-hover text-heading transition-colors"
              >
                {result.name} ({result.nameEn})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actual Map container */}
      <div className="relative aspect-square w-full bg-alt/10 flex items-center justify-center min-h-[300px]">
        {!leafletLoaded && (
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-dim">جاري تحميل الخريطة المباشرة...</span>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full h-full rounded-lg shadow-inner z-10"
          style={{ display: leafletLoaded ? 'block' : 'none' }}
        />
      </div>

      {/* Coordinate Readout */}
      <div className="grid grid-cols-2 gap-2 p-3 pt-0 border-t border-edge bg-alt/30 text-xs">
        <div className="flex flex-col space-y-1 text-center border-e border-edge">
          <span className="text-[#887B60] font-medium text-[10px]">خط العرض (Latitude)</span>
          <span className="font-bold text-heading font-mono">{currentLat}</span>
        </div>
        <div className="flex flex-col space-y-1 text-center">
          <span className="text-[#887B60] font-medium text-[10px]">خط الطول (Longitude)</span>
          <span className="font-bold text-heading font-mono">{currentLng}</span>
        </div>
      </div>
    </div>
  )
}
