
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, getBucketConfig } from "./aws-config";

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  try {
    const key = `${folderPrefix}uploads/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: getContentType(fileName)
    });

    await s3Client.send(command);
    return key; // Return full S3 key (cloud_storage_path)
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file');
  }
}

export async function downloadFile(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
  }
}

export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  try {
    // S3 doesn't have a direct rename operation, so we copy and delete
    // For simplicity, we'll return the same key for now
    return oldKey;
  } catch (error) {
    console.error('Error renaming file:', error);
    throw new Error('Failed to rename file');
  }
}

function getContentType(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  const contentTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'csv': 'text/csv',
    'json': 'application/json',
    'txt': 'text/plain'
  };
  
  return contentTypes[extension || ''] || 'application/octet-stream';
}
