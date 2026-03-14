import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { UploadResult } from '@/types'

// ─── Storage Provider Interface ─────────────────────────────

export interface StorageProvider {
  /**
   * Upload a file buffer to the given path.
   * Returns the public URL of the uploaded file.
   */
  upload(file: Buffer, filePath: string, mimeType: string): Promise<string>

  /**
   * Delete a file at the given path.
   */
  delete(filePath: string): Promise<void>

  /**
   * Get the public URL for a file path.
   */
  getUrl(filePath: string): string
}

// ─── Local Storage Provider ─────────────────────────────────

export class LocalStorageProvider implements StorageProvider {
  private basePath: string
  private baseUrl: string

  constructor() {
    this.basePath = path.join(process.cwd(), 'public', 'uploads')
    this.baseUrl = '/uploads'
  }

  async upload(file: Buffer, filePath: string): Promise<string> {
    const fullPath = path.join(this.basePath, filePath)
    const dir = path.dirname(fullPath)

    await mkdir(dir, { recursive: true })
    await writeFile(fullPath, file)

    return this.getUrl(filePath)
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath)
    try {
      await unlink(fullPath)
    } catch (error: unknown) {
      // Ignore if file doesn't exist
      if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }

  getUrl(filePath: string): string {
    return `${this.baseUrl}/${filePath}`
  }
}

// ─── Cloudflare R2 Storage Provider ─────────────────────────

export class R2StorageProvider implements StorageProvider {
  private bucket: string
  private accountId: string
  private publicUrl: string

  constructor() {
    this.accountId = process.env.R2_ACCOUNT_ID || ''
    this.bucket = process.env.R2_BUCKET_NAME || ''
    this.publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')

    if (!this.bucket || !this.accountId) {
      throw new Error('R2_ACCOUNT_ID and R2_BUCKET_NAME environment variables are required')
    }
    if (!this.publicUrl) {
      throw new Error('R2_PUBLIC_URL environment variable is required (your r2.dev public URL)')
    }
  }

  private async getClient() {
    const { S3Client } = await import('@aws-sdk/client-s3')
    return new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    })
  }

  async upload(file: Buffer, filePath: string, mimeType: string): Promise<string> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = await this.getClient()

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
        Body: file,
        ContentType: mimeType,
      })
    )

    return this.getUrl(filePath)
  }

  async delete(filePath: string): Promise<void> {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const client = await this.getClient()

    await client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      })
    )
  }

  getUrl(filePath: string): string {
    return `${this.publicUrl}/${filePath}`
  }
}

// ─── S3 Storage Provider (stub) ─────────────────────────────

export class S3StorageProvider implements StorageProvider {
  private bucket: string
  private region: string
  private endpoint: string | undefined

  constructor() {
    this.bucket = process.env.S3_BUCKET || ''
    this.region = process.env.S3_REGION || 'me-south-1'
    this.endpoint = process.env.S3_ENDPOINT

    if (!this.bucket) {
      throw new Error('S3_BUCKET environment variable is required')
    }
  }

  async upload(file: Buffer, filePath: string, mimeType: string): Promise<string> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    })
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
        Body: file,
        ContentType: mimeType,
      })
    )

    return this.getUrl(filePath)
  }

  async delete(filePath: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    })
    await client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      })
    )
  }

  getUrl(filePath: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${filePath}`
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filePath}`
  }
}

// ─── Factory ────────────────────────────────────────────────

let storageInstance: StorageProvider | null = null

/**
 * Get the storage provider based on environment configuration.
 * Returns a singleton instance.
 */
export function getStorage(): StorageProvider {
  if (storageInstance) return storageInstance

  const provider = process.env.STORAGE_PROVIDER || 'local'

  switch (provider) {
    case 'r2':
      storageInstance = new R2StorageProvider()
      break
    case 's3':
      storageInstance = new S3StorageProvider()
      break
    case 'local':
    default:
      storageInstance = new LocalStorageProvider()
      break
  }

  return storageInstance
}

// ─── Helper ─────────────────────────────────────────────────

/**
 * Upload a File object to the configured storage provider.
 *
 * @param file - The File (or Blob) to upload.
 * @param directory - Subdirectory under the storage root (e.g., "properties/images").
 * @returns Upload result with URL, path, filename, size, and MIME type.
 */
export async function uploadFile(
  file: File,
  directory: string
): Promise<UploadResult> {
  const storage = getStorage()

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'bin'
  const filename = `${uuidv4()}.${ext}`
  const filePath = `${directory}/${filename}`
  const mimeType = file.type || 'application/octet-stream'

  const url = await storage.upload(buffer, filePath, mimeType)

  return {
    url,
    path: filePath,
    filename,
    size: file.size,
    mimeType,
  }
}
