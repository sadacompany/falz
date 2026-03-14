/**
 * Client-side logo color extraction and theme suggestion.
 * Uses Canvas API to extract dominant colors from an image.
 */

interface RGB {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): RGB {
  const num = parseInt(hex.replace('#', ''), 16)
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  }
}

function rgbToHex({ r, g, b }: RGB): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
  )
}

/**
 * Extract dominant colors from an image URL.
 * Uses Canvas API to downscale and bucket-quantize colors.
 */
export async function extractDominantColors(imageUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 100
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve([])
        return
      }

      ctx.drawImage(img, 0, 0, size, size)
      const imageData = ctx.getImageData(0, 0, size, size)
      const pixels = imageData.data

      // Bucket quantization (bucket size = 32)
      const bucketSize = 32
      const colorCounts = new Map<string, { color: RGB; count: number }>()

      for (let i = 0; i < pixels.length; i += 4) {
        const r = Math.round(pixels[i] / bucketSize) * bucketSize
        const g = Math.round(pixels[i + 1] / bucketSize) * bucketSize
        const b = Math.round(pixels[i + 2] / bucketSize) * bucketSize
        const a = pixels[i + 3]

        // Skip transparent/near-transparent and near-white/near-black
        if (a < 128) continue
        if (r > 240 && g > 240 && b > 240) continue
        if (r < 15 && g < 15 && b < 15) continue

        const key = `${r},${g},${b}`
        const existing = colorCounts.get(key)
        if (existing) {
          existing.count++
        } else {
          colorCounts.set(key, { color: { r, g, b }, count: 1 })
        }
      }

      // Sort by frequency and return top 5
      const sorted = Array.from(colorCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((entry) => rgbToHex(entry.color))

      resolve(sorted)
    }

    img.onerror = () => resolve([])
    img.src = imageUrl
  })
}

/**
 * Compare extracted logo colors against theme presets to suggest the best match.
 * Returns the preset key with the smallest total distance.
 */
export function suggestThemeFromColors(
  extractedColors: string[],
  presets: { key: string; primary: string; accent: string }[]
): string | null {
  if (!extractedColors.length || !presets.length) return null

  const extractedRgbs = extractedColors.map(hexToRgb)
  let bestKey: string | null = null
  let bestScore = Infinity

  for (const preset of presets) {
    const presetPrimary = hexToRgb(preset.primary)
    const presetAccent = hexToRgb(preset.accent)

    // Find minimum distance from any extracted color to preset primary/accent
    let minPrimaryDist = Infinity
    let minAccentDist = Infinity

    for (const c of extractedRgbs) {
      minPrimaryDist = Math.min(minPrimaryDist, colorDistance(c, presetPrimary))
      minAccentDist = Math.min(minAccentDist, colorDistance(c, presetAccent))
    }

    // Weighted score: primary match is more important
    const score = minPrimaryDist * 1.5 + minAccentDist
    if (score < bestScore) {
      bestScore = score
      bestKey = preset.key
    }
  }

  return bestKey
}
