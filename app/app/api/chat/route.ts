
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

export const dynamic = "force-dynamic";

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export async function POST(request: NextRequest) {
  console.log('🔄 Chat API called');
  
  try {
    const { message, reportId, sessionId } = await request.json();
    console.log('📨 Message received:', message);

    if (!message) {
      console.log('❌ No message provided');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check database connection first
    console.log('🔍 Testing database connection...');
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    // Ensure default user exists
    console.log('👤 Ensuring default user exists...');
    const user = await prisma.user.upsert({
      where: { email: 'default@example.com' },
      update: {},
      create: {
        name: 'Default User',
        email: 'default@example.com'
      }
    });
    console.log('✅ User:', user.id);

    // Get or create chat session
    let session;
    if (sessionId) {
      console.log('🔍 Looking for existing session:', sessionId);
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId }
      });
    }

    if (!session) {
      console.log('📝 Creating new chat session...');
      session = await prisma.chatSession.create({
        data: {
          title: `Chat about analysis`,
          userId: user.id
        }
      });
      console.log('✅ New session created:', session.id);
    }

    // Save user message
    console.log('💾 Saving user message...');
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        content: message,
        role: 'USER'
      }
    });
    console.log('✅ User message saved:', userMessage.id);

    // Generate AI response (real AI)
    console.log('🤖 Generating AI response...');
    const aiResponse = await generateAIResponse(message, reportId);
    console.log('✅ AI response generated');

    // Save AI message
    console.log('💾 Saving AI message...');
    const aiMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        content: aiResponse.response,
        role: 'ASSISTANT',
        metadata: {
          suggestions: aiResponse.suggestions,
          charts: aiResponse.charts
        }
      }
    });
    console.log('✅ AI message saved:', aiMessage.id);

    const response = {
      messageId: aiMessage.id,
      sessionId: session.id,
      response: aiResponse.response,
      suggestions: aiResponse.suggestions,
      charts: aiResponse.charts
    };

    console.log('🎉 Sending successful response');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 Error processing chat message:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

async function generateAIResponse(message: string, reportId?: string) {
  try {
    // Get recent analysis data to provide context to AI
    const recentAnalyses = await prisma.analysis.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        file: true
      }
    });

    // Build context from real data
    let dataContext = '';
    if (recentAnalyses.length > 0) {
      dataContext = `\nContext from recent data analyses:\n`;
      recentAnalyses.forEach(analysis => {
        if (analysis.file) {
          dataContext += `- File: ${analysis.file.originalName} (${analysis.file.rowCount || 0} records)\n`;
        }
        if (analysis.summary && typeof analysis.summary === 'object' && 'executive' in analysis.summary) {
          dataContext += `- Summary: ${analysis.summary.executive}\n`;
        }
        if (analysis.kpis && Array.isArray(analysis.kpis) && analysis.kpis.length > 0) {
          dataContext += `- Key KPIs: ${analysis.kpis.slice(0, 3).map((kpi: any) => `${kpi.name}: ${kpi.value}${kpi.unit || ''}`).join(', ')}\n`;
        }
      });
    }

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{
          role: 'user',
          content: `You are a business intelligence analyst specializing in data insights. User asks: "${message}"

${dataContext}

Please provide a comprehensive, professional analysis response that:
1. Directly addresses their question
2. Uses the real data context when available
3. Provides actionable insights
4. Suggests 2-3 relevant follow-up questions
5. Be concise but informative

Respond in Turkish if the user's message is in Turkish, otherwise respond in English.`
        }],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const aiResponse = aiResult.choices?.[0]?.message?.content || 'Üzgünüm, şu anda analiz yapamıyorum. Lütfen daha sonra tekrar deneyin.';

    // Generate smart suggestions based on the context
    const suggestions = [];
    if (message.toLowerCase().includes('trend') || message.toLowerCase().includes('analiz')) {
      suggestions.push("Hangi zaman dilimindeki trendleri daha detaylı incelemek istersiniz?");
      suggestions.push("Belirli bir metrik için karşılaştırmalı analiz yapalım mı?");
      suggestions.push("Bu trendlerin nedenleri hakkında daha derinlemesine bakalım mı?");
    } else if (message.toLowerCase().includes('kpi') || message.toLowerCase().includes('performans')) {
      suggestions.push("KPI'ların tarihsel performansını karşılaştıralım mı?");
      suggestions.push("Hedef belirleme konusunda öneriler ister misiniz?");
      suggestions.push("Bu KPI'ları etkileyen faktörleri inceleyelim mi?");
    } else {
      suggestions.push("Veri setinizde hangi alanları daha detaylı incelemek istersiniz?");
      suggestions.push("Aksiyon planları oluşturmak için yardım ister misiniz?");
      suggestions.push("Başka bir analiz türü denemek ister misiniz?");
    }

    return {
      response: aiResponse,
      suggestions: suggestions.slice(0, 3),
      charts: [] // Charts are handled separately by the analysis system
    };

  } catch (error) {
    console.error('AI response generation error:', error);
    return {
      response: `Analiz sırasında bir hata oluştu. Mevcut verilerinize göre genel bir değerlendirme: Yüklediğiniz dosyalar başarıyla işlendi ve trend analizi için hazır. Daha spesifik sorular sorarak detaylı analizlere ulaşabilirsiniz.`,
      suggestions: [
        "Trend analizi için hangi metriği incelemek istersiniz?",
        "Veri kalitesi hakkında bilgi almak ister misiniz?",
        "KPI karşılaştırması yapmak ister misiniz?"
      ],
      charts: []
    };
  }
}
