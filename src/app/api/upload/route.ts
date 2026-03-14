import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile } from '@/lib/storage'

// Allowed MIME types and their corresponding max sizes
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file')
    const directory = (formData.get('directory') as string) || 'uploads'

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'NO_FILE', message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const mimeType = file.type.toLowerCase()
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_TYPE',
          message: `File type "${mimeType}" is not supported. Allowed: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return NextResponse.json(
        {
          success: false,
          error: 'FILE_TOO_LARGE',
          message: `File size exceeds the ${maxSizeMB}MB limit`,
        },
        { status: 400 }
      )
    }

    // Upload file using the storage abstraction
    const result = await uploadFile(file, directory)

    return NextResponse.json(
      {
        success: true,
        data: {
          url: result.url,
          path: result.path,
          filename: result.filename,
          size: result.size,
          mimeType: result.mimeType,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'UPLOAD_FAILED',
        message: 'Upload failed. Please try again.',
      },
      { status: 500 }
    )
  }
}
