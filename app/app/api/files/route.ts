

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get default user
    const defaultUser = await prisma.user.findUnique({
      where: { email: 'admin@reportingagent.com' }
    });
    
    if (!defaultUser) {
      return NextResponse.json([]);
    }

    const files = await prisma.file.findMany({
      where: { userId: defaultUser.id },
      orderBy: { uploadedAt: 'desc' },
      take: 50 // Limit to recent files
    });

    return NextResponse.json(files.map(file => ({
      id: file.id,
      fileId: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: Number(file.size),
      status: file.status,
      uploadedAt: file.uploadedAt,
      processedAt: file.processedAt,
      metadata: file.metadata,
      rowCount: file.rowCount,
      columnCount: file.columnCount
    })));
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
