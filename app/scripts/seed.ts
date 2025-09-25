
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@reportingagent.com' },
    update: {},
    create: {
      email: 'admin@reportingagent.com',
      name: 'Super Anna',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create some sample analysis templates
  const templates = [
    {
      name: 'Financial Analysis',
      description: 'Comprehensive financial report analysis with KPI extraction',
      template: {
        sections: ['summary', 'kpis', 'trends', 'insights', 'actions'],
        kpiTypes: ['revenue', 'profit', 'growth', 'efficiency'],
        chartTypes: ['line', 'bar', 'pie']
      },
      isDefault: true
    },
    {
      name: 'Sales Performance',
      description: 'Sales data analysis focusing on performance metrics',
      template: {
        sections: ['summary', 'kpis', 'trends', 'comparison'],
        kpiTypes: ['sales', 'conversion', 'customer_acquisition'],
        chartTypes: ['line', 'bar']
      },
      isDefault: false
    },
    {
      name: 'Operational Metrics',
      description: 'Operational efficiency and performance analysis',
      template: {
        sections: ['summary', 'kpis', 'insights', 'actions'],
        kpiTypes: ['efficiency', 'quality', 'productivity'],
        chartTypes: ['line', 'radar', 'bar']
      },
      isDefault: false
    }
  ];

  for (const template of templates) {
    const existing = await prisma.analysisTemplate.findFirst({
      where: { name: template.name }
    });
    
    if (!existing) {
      await prisma.analysisTemplate.create({
        data: template,
      });
      console.log(`✅ Created template: ${template.name}`);
    } else {
      console.log(`⚠️  Template already exists: ${template.name}`);
    }
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
