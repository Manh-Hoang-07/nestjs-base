import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'systemadmin@example.com' },
    });
    console.log("User:", user?.email, user?.status);
    if (user && user.password) {
        const isMatch = await bcrypt.compare('12345678', user.password);
        console.log('Match for 12345678:', isMatch);
    } else {
        console.log('No user or no password field');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
