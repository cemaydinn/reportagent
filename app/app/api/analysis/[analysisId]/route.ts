

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: params.analysisId },
      include: {
        file: true
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: analysis.id,
      analysisId: analysis.id,
      fileId: analysis.fileId,
      type: analysis.type,
      status: analysis.status,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt,
      summary: analysis.summary,
      kpis: analysis.kpis,
      trends: analysis.trends,
      insights: analysis.insights,
      actionItems: analysis.actionItems,
      visualizations: analysis.visualizations
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
