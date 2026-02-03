const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Create Users
    const users = [
        { username: 'nkc', password: 'password123', role: 'ADMIN', name: 'N K C' },
        { username: 'sarada', password: 'password123', role: 'USER', name: 'Sarada' },
        { username: 'rahul', password: 'password123', role: 'USER', name: 'Rahul' },
    ];

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { username: u.username },
            update: {
                name: u.name,
                role: u.role,
            },
            create: {
                username: u.username,
                password: u.password, // In a real app, hash this!
                role: u.role,
                name: u.name,
            },
        });
        console.log(`Synced user: ${user.username}`);
    }

    // 1. Handle Renaming (Restore 1am state)
    // If "My Portfolio" exists, it should be "Krishnachandranuti.com"
    const portfolio = await prisma.project.findFirst({ where: { name: 'My Portfolio' } });
    if (portfolio) {
        await prisma.project.update({
            where: { id: portfolio.id },
            data: {
                name: 'Krishnachandranuti.com',
                description: 'Personal portfolio website showcasing my latest work and skills.',
                imageUrl: '/portfolio-logo.png'
            }
        });
        console.log('Renamed "My Portfolio" to "Krishnachandranuti.com"');
    }

    // 2. Define All 7 Projects (1am State)
    const projectData = [
        {
            name: 'Krishnachandranuti.com',
            description: 'Personal portfolio website showcasing my latest work and skills.',
            imageUrl: '/portfolio-logo.png',
            tasks: [
                { title: 'Setup Repo', status: 'COMPLETED' },
                { title: 'Design UI', status: 'IN_PROGRESS' },
                { title: 'Deploy to Vercel', status: 'TO_START' },
            ]
        },
        {
            name: 'EZ Cut Media',
            description: 'Video editing agency platform for managing client reels and projects.',
            imageUrl: '/ez-logo.png',
            tasks: [
                { title: 'Mobile UI Refinement', status: 'IN_PROGRESS' },
                { title: 'Add Contact Button', status: 'COMPLETED' },
                { title: 'Fix Reel Inventory', status: 'TO_START' },
            ]
        },
        {
            name: 'Digital Concierge',
            description: 'Lifestyle management app for tracking expenses and personal tasks.',
            imageUrl: '/file.svg',
            tasks: [
                { title: 'Fix Firebase Saving', status: 'IN_PROGRESS' },
                { title: 'Refine Dashboard Tasks', status: 'COMPLETED' },
                { title: 'Add Expense Filters', status: 'TO_START' },
            ]
        },
        {
            name: 'AtomiqWorks',
            description: 'Digital Agency Portfolio. Premium, minimalist design with a globe motif.',
            imageUrl: '/globe.svg',
            tasks: [
                { title: 'Design Hero Section', status: 'COMPLETED' },
                { title: 'Create Animated Logo', status: 'IN_PROGRESS' },
                { title: 'Implement Dark Mode', status: 'TO_START' },
            ]
        },
        {
            name: 'Vendor Intelligence',
            description: 'Internal Bloomberg-style vendor intelligence feed for category managers.',
            imageUrl: '/window.svg',
            tasks: [
                { title: 'Wireframe Dashboard', status: 'COMPLETED' },
                { title: 'Connect to API', status: 'TO_START' },
                { title: 'Setup News Feed', status: 'TO_START' },
            ]
        },
        {
            name: 'Subreddit Search',
            description: 'Web utility to search and filter specific subreddits efficiently.',
            imageUrl: '/file.svg',
            tasks: [
                { title: 'Implement Search Bar', status: 'COMPLETED' },
                { title: 'Fetch Reddit API', status: 'IN_PROGRESS' },
                { title: 'Style Results Grid', status: 'TO_START' },
            ]
        },
        {
            name: 'Moody Mushrooms',
            description: 'Premium mushroom e-commerce brand.',
            imageUrl: '/moody-logo.png',
            tasks: [
                { title: 'Project Setup', status: 'COMPLETED' },
                { title: 'Design Brand Identity', status: 'IN_PROGRESS' },
            ]
        },
    ];

    for (const p of projectData) {
        // Project name is not unique in schema, so we can't use upsert by name directly.
        // We find first by name.
        let project = await prisma.project.findFirst({
            where: { name: p.name }
        });

        if (project) {
            // Update existing project details
            project = await prisma.project.update({
                where: { id: project.id },
                data: {
                    description: p.description,
                    imageUrl: p.imageUrl,
                    // We don't overwrite tasks here to preserve potential user edits,
                    // but we could if we wanted a hard reset. For now, we update metadata.
                }
            });
            console.log(`Updated project details: ${project.name}`);

            // Ensure tasks exist
            for (const t of p.tasks) {
                const existingTask = await prisma.task.findFirst({
                    where: {
                        projectId: project.id,
                        title: t.title
                    }
                });

                if (!existingTask) {
                    await prisma.task.create({
                        data: {
                            title: t.title,
                            status: t.status,
                            projectId: project.id
                        }
                    });
                    console.log(`  + Restored task: ${t.title}`);
                }
            }
        } else {
            // Create new project
            project = await prisma.project.create({
                data: {
                    name: p.name,
                    description: p.description,
                    imageUrl: p.imageUrl,
                    tasks: {
                        create: p.tasks
                    },
                },
            });
            console.log(`Created project: ${project.name}`);
        }

        // Assign Projects to Users
        // nkc & sarada get ALL
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            // Check connection
            const count = await prisma.project.count({
                where: {
                    id: project.id,
                    users: { some: { id: admin.id } }
                }
            });

            if (count === 0) {
                await prisma.project.update({
                    where: { id: project.id },
                    data: { users: { connect: { id: admin.id } } },
                });
            }
        }

        // rahul gets ONLY "EZ Cut Media"
        if (p.name === 'EZ Cut Media') {
            const rahul = await prisma.user.findUnique({ where: { username: 'rahul' } });
            if (rahul) {
                const count = await prisma.project.count({
                    where: {
                        id: project.id,
                        users: { some: { id: rahul.id } }
                    }
                });

                if (count === 0) {
                    await prisma.project.update({
                        where: { id: project.id },
                        data: { users: { connect: { id: rahul.id } } },
                    });
                }
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
