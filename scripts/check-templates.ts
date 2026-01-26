import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllTemplates() {
    console.log('🔍 Fetching ALL content templates from DB...\n');

    const templates = await prisma.contentTemplate.findMany({
        where: { deleted_at: null },
    });

    templates.forEach((t, i) => {
        console.log(`[${i + 1}] ID: ${t.id}`);
        console.log(`    Code: ${t.code}`);
        console.log(`    Name: ${t.name}`);
        console.log(`    Subject: ${(t.metadata as any)?.subject}`);
        console.log(`    Content Snippet: ${t.content?.substring(0, 50).replace(/\n/g, ' ')}...`);
        console.log('-'.repeat(40));
    });

    if (templates.length === 0) {
        console.log('❌ No templates found!');
    }

    await prisma.$disconnect();
}

checkAllTemplates()
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
