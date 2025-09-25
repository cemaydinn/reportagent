
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get recent files and analyses
    const recentFiles = await prisma.file.findMany({
      take: 10,
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        filename: true,
        originalName: true,
        status: true,
        uploadedAt: true,
        size: true,
        metadata: true
      }
    });

    const recentAnalyses = await prisma.analysis.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        file: {
          select: {
            originalName: true
          }
        }
      }
    });

    // Calculate statistics
    const totalFiles = await prisma.file.count();
    const totalAnalyses = await prisma.analysis.count();
    const completedAnalyses = await prisma.analysis.count({
      where: { status: 'COMPLETED' }
    });

    return NextResponse.json({
      statistics: {
        totalFiles,
        totalAnalyses,
        completedAnalyses,
        successRate: totalAnalyses > 0 ? Math.round((completedAnalyses / totalAnalyses) * 100) : 0
      },
      recentFiles: recentFiles.map(file => ({
        ...file,
        size: Number(file.size)
      })),
      recentAnalyses: recentAnalyses.map(analysis => ({
        id: analysis.id,
        type: analysis.type,
        status: analysis.status,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt,
        fileName: analysis.file.originalName
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
