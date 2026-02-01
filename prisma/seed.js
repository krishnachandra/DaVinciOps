const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Create Users
    const users = [
        { username: 'nkc', password: 'password123', role: 'ADMIN' },
        { username: 'sarada', password: 'password123', role: 'ADMIN' },
        { username: 'rahul', password: 'password123', role: 'USER' },
    ];

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { username: u.username },
            update: {},
            create: {
                username: u.username,
                password: u.password, // In a real app, hash this!
                role: u.role,
            },
        });
        console.log(`Created user: ${user.username}`);
    }

    // Create Projects
    const projectData = [
        { name: 'My Portfolio', description: 'Personal portfolio website' },
        { name: 'EZ Cut Media', description: 'Video editing agency' },
        { name: 'Digital Concierge', description: 'Lifestyle management app' },
    ];

    for (const p of projectData) {
        const project = await prisma.project.create({
            data: {
                name: p.name,
                description: p.description,
                tasks: {
                    create: [
                        { title: 'Setup Repo', status: 'COMPLETED' },
                        { title: 'Design UI', status: 'IN_PROGRESS' },
                        { title: 'Deploy', status: 'TO_START' },
                    ],
                },
            },
        });
        console.log(`Created project: ${project.name}`);

        // Assign Projects to Users
        // nkc & sarada get ALL
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await prisma.project.update({
                where: { id: project.id },
                data: { users: { connect: { id: admin.id } } },
            });
        }

        // rahul gets ONLY "EZ Cut Media"
        if (p.name === 'EZ Cut Media') {
            const rahul = await prisma.user.findUnique({ where: { username: 'rahul' } });
            if (rahul) {
                await prisma.project.update({
                    where: { id: project.id },
                    data: { users: { connect: { id: rahul.id } } },
                });
            }
        }
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
