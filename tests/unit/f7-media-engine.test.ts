import { describe, it, expect } from 'vitest'

const MAX_MEDIA_LIMIT = 100
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

interface MediaFile {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO'
  sortOrder: number
}

function processMediaUpload(existing: MediaFile[], newFiles: MediaFile[]): { media: MediaFile[]; error?: string } {
  if (existing.length + newFiles.length > MAX_MEDIA_LIMIT) {
    return {
      media: [...existing, ...newFiles].slice(0, MAX_MEDIA_LIMIT),
      error: 'لا يمكن إرفاق أكثر من 100 صورة لكل عقار.',
    }
  }
  return { media: [...existing, ...newFiles] }
}

function setAsCoverPhoto(mediaList: MediaFile[], index: number): MediaFile[] {
  if (index <= 0 || index >= mediaList.length) return mediaList
  const copy = [...mediaList]
  const [selected] = copy.splice(index, 1)
  copy.unshift(selected)
  return copy.map((item, idx) => ({ ...item, sortOrder: idx }))
}

function moveMedia(mediaList: MediaFile[], fromIndex: number, toIndex: number): MediaFile[] {
  if (fromIndex < 0 || fromIndex >= mediaList.length || toIndex < 0 || toIndex >= mediaList.length) {
    return mediaList
  }
  const copy = [...mediaList]
  const [movedItem] = copy.splice(fromIndex, 1)
  copy.splice(toIndex, 0, movedItem)
  return copy.map((item, idx) => ({ ...item, sortOrder: idx }))
}

function validateFileForUpload(file: { size: number; mimeType: string }): { valid: boolean; error?: string } {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimeType)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimeType)

  if (!isImage && !isVideo) {
    return { valid: false, error: 'INVALID_TYPE' }
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'FILE_TOO_LARGE' }
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: 'FILE_TOO_LARGE' }
  }

  return { valid: true }
}

describe('F7: Media Engine (100-File Limit, Cover Photo, Re-ordering & Upload Validation)', () => {
  it('should enforce 100-file upload limit and return error message when limit is exceeded', () => {
    const existingMedia: MediaFile[] = Array.from({ length: 95 }, (_, i) => ({
      id: `m-${i}`,
      url: `https://example.com/img-${i}.jpg`,
      type: 'IMAGE',
      sortOrder: i,
    }))

    const newFiles: MediaFile[] = Array.from({ length: 10 }, (_, i) => ({
      id: `new-${i}`,
      url: `https://example.com/new-${i}.jpg`,
      type: 'IMAGE',
      sortOrder: 95 + i,
    }))

    const result = processMediaUpload(existingMedia, newFiles)

    expect(result.error).toBe('لا يمكن إرفاق أكثر من 100 صورة لكل عقار.')
    expect(result.media).toHaveLength(100)
  })

  it('should allow uploading when total count is within MAX_MEDIA_LIMIT (100)', () => {
    const existingMedia: MediaFile[] = Array.from({ length: 50 }, (_, i) => ({
      id: `m-${i}`,
      url: `https://example.com/img-${i}.jpg`,
      type: 'IMAGE',
      sortOrder: i,
    }))

    const newFiles: MediaFile[] = Array.from({ length: 20 }, (_, i) => ({
      id: `new-${i}`,
      url: `https://example.com/new-${i}.jpg`,
      type: 'IMAGE',
      sortOrder: 50 + i,
    }))

    const result = processMediaUpload(existingMedia, newFiles)

    expect(result.error).toBeUndefined()
    expect(result.media).toHaveLength(70)
  })

  it('should promote selected item to cover photo at index 0 and reassign sortOrder', () => {
    const mediaList: MediaFile[] = [
      { id: 'img-0', url: 'https://example.com/0.jpg', type: 'IMAGE', sortOrder: 0 },
      { id: 'img-1', url: 'https://example.com/1.jpg', type: 'IMAGE', sortOrder: 1 },
      { id: 'img-2', url: 'https://example.com/2.jpg', type: 'IMAGE', sortOrder: 2 },
    ]

    const updated = setAsCoverPhoto(mediaList, 2)

    expect(updated[0].id).toBe('img-2')
    expect(updated[0].sortOrder).toBe(0)
    expect(updated[1].id).toBe('img-0')
    expect(updated[1].sortOrder).toBe(1)
    expect(updated[2].id).toBe('img-1')
    expect(updated[2].sortOrder).toBe(2)
  })

  it('should correctly re-order position of media items', () => {
    const mediaList: MediaFile[] = [
      { id: 'img-0', url: 'https://example.com/0.jpg', type: 'IMAGE', sortOrder: 0 },
      { id: 'img-1', url: 'https://example.com/1.jpg', type: 'IMAGE', sortOrder: 1 },
      { id: 'img-2', url: 'https://example.com/2.jpg', type: 'IMAGE', sortOrder: 2 },
    ]

    const reordered = moveMedia(mediaList, 0, 2)

    expect(reordered[0].id).toBe('img-1')
    expect(reordered[1].id).toBe('img-2')
    expect(reordered[2].id).toBe('img-0')
    expect(reordered[2].sortOrder).toBe(2)
  })

  it('should validate image size and MIME types correctly', () => {
    expect(validateFileForUpload({ size: 2 * 1024 * 1024, mimeType: 'image/jpeg' }).valid).toBe(true)
    expect(validateFileForUpload({ size: 6 * 1024 * 1024, mimeType: 'image/jpeg' })).toEqual({
      valid: false,
      error: 'FILE_TOO_LARGE',
    })
    expect(validateFileForUpload({ size: 100, mimeType: 'text/plain' })).toEqual({
      valid: false,
      error: 'INVALID_TYPE',
    })
  })

  it('should validate video size and MIME types correctly', () => {
    expect(validateFileForUpload({ size: 20 * 1024 * 1024, mimeType: 'video/mp4' }).valid).toBe(true)
    expect(validateFileForUpload({ size: 60 * 1024 * 1024, mimeType: 'video/mp4' })).toEqual({
      valid: false,
      error: 'FILE_TOO_LARGE',
    })
  })
})
