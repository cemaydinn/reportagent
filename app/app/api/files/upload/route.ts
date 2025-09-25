
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadFile } from '@/lib/s3';
import { FileProcessor } from '@/lib/file-processor';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to S3
    const cloudStoragePath = await uploadFile(buffer, file.name);

    // Get or create default user
    let defaultUser = await prisma.user.findUnique({
      where: { email: 'admin@reportingagent.com' }
    });
    
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'admin@reportingagent.com',
          name: 'Super Admin'
        }
      });
    }

    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        filename: `file_${Date.now()}_${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        size: BigInt(file.size),
        cloudStoragePath,
        status: 'UPLOADED',
        userId: defaultUser.id,
        metadata: {
          originalSize: file.size,
          uploadTimestamp: new Date().toISOString()
        }
      }
    });

    // Start processing file in background
    processFileInBackground(fileRecord.id);

    return NextResponse.json({
      fileId: fileRecord.id, // Add fileId for compatibility
      id: fileRecord.id,
      filename: fileRecord.filename,
      originalName: fileRecord.originalName,
      size: Number(fileRecord.size),
      status: fileRecord.status,
      uploadedAt: fileRecord.uploadedAt
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

async function processFileInBackground(fileId: string) {
  try {
    // Update status to processing
    await prisma.file.update({
      where: { id: fileId },
      data: { status: 'PROCESSING' }
    });

    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) return;

    // Process file metadata
    const metadata = await FileProcessor.processFile({
      id: file.id,
      fileId: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: Number(file.size),
      status: file.status as any,
      uploadedAt: file.uploadedAt,
      processedAt: file.processedAt || undefined,
      metadata: file.metadata,
      rowCount: file.rowCount || undefined,
      columnCount: file.columnCount || undefined
    });

    // Update file with metadata
    await prisma.file.update({
      where: { id: fileId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        metadata: metadata,
        rowCount: metadata.estimatedRows || null,
        columnCount: metadata.estimatedColumns || null
      }
    });
  } catch (error) {
    console.error('Error processing file:', error);
    await prisma.file.update({
      where: { id: fileId },
      data: { status: 'FAILED' }
    });
  }
}
