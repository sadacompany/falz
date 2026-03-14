'use client'

import { useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

interface GoogleMapEmbedProps {
  lat: number
  lng: number
  zoom?: number
  className?: string
  markerTitle?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

export function GoogleMapEmbed({
  lat,
  lng,
  zoom = 15,
  className = 'aspect-[2/1] rounded-xl overflow-hidden',
  markerTitle,
}: GoogleMapEmbedProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const center = { lat, lng }

  const [, setMap] = useState<google.maps.Map | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  if (loadError) {
    return (
      <div className={className}>
        <div className="h-full w-full flex items-center justify-center bg-[#F7F8FA] border border-[#E2E8F0] rounded-xl">
          <p className="text-sm text-[#718096]">Failed to load map</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={className}>
        <div className="h-full w-full flex items-center justify-center bg-[#F7F8FA] border border-[#E2E8F0] rounded-xl animate-pulse">
          <div className="h-6 w-6 rounded-full border-2 border-[#C8A96E] border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        <Marker position={center} title={markerTitle} />
      </GoogleMap>
    </div>
  )
}
