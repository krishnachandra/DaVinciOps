const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.user.update({
            where: { username: 'nkc' },
            data: { name: 'Krishna Chandra' },
        });
        console.log('Updated nkc');
    } catch (e) { }

    try {
        await prisma.user.update({
            where: { username: 'rahul' },
            data: { name: 'Rahul Bhagi' },
        });
        console.log('Updated rahul');
    } catch (e) { }

    try {
        await prisma.user.update({
            where: { username: 'sarada' },
            data: { name: 'Sarada Bhagi' },
        });
        console.log('Updated sarada');
    } catch (e) { }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
