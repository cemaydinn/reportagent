
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { FileProcessor } from '@/lib/file-processor';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { analysisType = 'FULL_ANALYSIS', options = {} } = await request.json();

    const file = await prisma.file.findUnique({
      where: { id: params.fileId }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    if (file.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'File is not ready for analysis' },
        { status: 400 }
      );
    }

    // Get or create default user (same as upload)
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

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        fileId: file.id,
        userId: defaultUser.id,
        type: analysisType,
        status: 'PROCESSING',
        options
      }
    });

    // Generate analysis in background
    generateAnalysisInBackground(analysis.id, file.id, analysisType);

    return NextResponse.json({
      analysisId: analysis.id,
      status: analysis.status,
      type: analysis.type,
      createdAt: analysis.createdAt
    });
  } catch (error) {
    console.error('Error starting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
}

async function generateAnalysisInBackground(
  analysisId: string,
  fileId: string,
  analysisType: string
) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) return;

    const analysisResult = await FileProcessor.generateAnalysis({
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
      columnCount: file.columnCount || undefined,
      cloudStoragePath: file.cloudStoragePath
    }, analysisType);

    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'COMPLETED',
        completedAt: analysisResult.completedAt,
        summary: analysisResult.summary as any || undefined,
        kpis: analysisResult.kpis as any || undefined,
        trends: analysisResult.trends as any || undefined,
        insights: analysisResult.insights as any || undefined,
        actionItems: analysisResult.actionItems as any || undefined,
        visualizations: analysisResult.visualizations as any || undefined
      }
    });
  } catch (error) {
    console.error('Error generating analysis:', error);
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'FAILED' }
    });
  }
}
