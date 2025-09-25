

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: params.fileId }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: file.id,
      fileId: file.id,
      filename: file.filename,
      originalName: file.originalName,
      status: file.status,
      uploadedAt: file.uploadedAt,
      processedAt: file.processedAt,
      metadata: file.metadata,
      rowCount: file.rowCount,
      columnCount: file.columnCount
    });
  } catch (error) {
    console.error('Error fetching file status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file status' },
      { status: 500 }
    );
  }
}
