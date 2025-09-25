
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDatabase() {
  try {
    console.log('=== Files ===');
    const files = await prisma.file.findMany({
      orderBy: { uploadedAt: 'desc' },
      take: 5
    });
    console.log(JSON.stringify(files, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2));
    
    console.log('\n=== Analyses ===');
    const analyses = await prisma.analysis.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        file: {
          select: {
            originalName: true
          }
        }
      }
    });
    console.log(JSON.stringify(analyses, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();
