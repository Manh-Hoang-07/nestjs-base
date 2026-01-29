import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const order = await prisma.order.findUnique({
        where: { id: BigInt(30) },
        include: {
            shipping_method: true,
            payment_method: true,
            payments: {
                include: {
                    payment_method: true
                }
            }
        }
    });

    console.log('Order #30:', JSON.stringify(order, (key, value) => {
        return typeof value === 'bigint' ? value.toString() : value;
    }, 2));

    await prisma.$disconnect();
}

main();
