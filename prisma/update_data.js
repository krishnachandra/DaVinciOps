const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Rename "My Portfolio" to "Krishnachandranuti.com"
    try {
        const portfolio = await prisma.project.findFirst({
            where: { name: 'My Portfolio' },
        });

        if (portfolio) {
            await prisma.project.update({
                where: { id: portfolio.id },
                data: { name: 'Krishnachandranuti.com', description: 'Personal portfolio website' },
            });
            console.log('Renamed "My Portfolio" to "Krishnachandranuti.com"');
        } else {
            console.log('"My Portfolio" not found, checking if already renamed...');
        }
    } catch (e) {
        console.error('Error renaming project:', e);
    }

    // 2. Create "Moody Mushrooms" and assign to Admins
    try {
        const existing = await prisma.project.findFirst({
            where: { name: 'Moody Mushrooms' },
        });

        if (!existing) {
            const newProject = await prisma.project.create({
                data: {
                    name: 'Moody Mushrooms',
                    description: 'New project',
                    tasks: {
                        create: [
                            { title: 'Project Setup', status: 'TO_START' },
                        ],
                    },
                },
            });
            console.log('Created project: "Moody Mushrooms"');

            // Assign to Admins (nkc, sarada)
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
            for (const admin of admins) {
                await prisma.project.update({
                    where: { id: newProject.id },
                    data: { users: { connect: { id: admin.id } } },
                });
            }
            console.log('Assigned "Moody Mushrooms" to admins');
        } else {
            console.log('"Moody Mushrooms" already exists.');
        }
    } catch (e) {
        console.error('Error creating Moody Mushrooms:', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
