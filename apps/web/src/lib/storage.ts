import { Client as MinioClient } from 'minio'

const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_USER || '',
  secretKey: process.env.MINIO_PASSWORD || '',
})

const bucketName = process.env.MINIO_BUCKET || 'condominios-uploads'

export { minioClient }

export async function ensureBucketExists(): Promise<void> {
  const exists = await minioClient.bucketExists(bucketName)
  if (!exists) {
    await minioClient.makeBucket(bucketName, 'us-east-1')
  }
}

export async function uploadFile(
  objectName: string,
  buffer: Buffer,
  metadata: { 'Content-Type': string }
): Promise<string> {
  await ensureBucketExists()
  await minioClient.putObject(bucketName, objectName, buffer, buffer.length, metadata)
  return `/${bucketName}/${objectName}`
}

export async function deleteFile(objectName: string): Promise<void> {
  await minioClient.removeObject(bucketName, objectName)
}

export async function getFileUrl(objectName: string, expirySeconds = 3600): Promise<string> {
  return await minioClient.presignedGetObject(bucketName, objectName, expirySeconds)
}
