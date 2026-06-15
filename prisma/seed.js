const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminPhone = process.env.ADMIN_PHONE;
  if (adminPhone) {
    console.log(`Checking/Creating admin user for phone: ${adminPhone}`);
    const admin = await prisma.user.upsert({
      where: { phone: adminPhone },
      update: { role: 'ADMIN' },
      create: {
        phone: adminPhone,
        name: 'System Admin',
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`Admin user ready: ${JSON.stringify(admin)}`);
  } else {
    console.log('No ADMIN_PHONE environment variable defined. Skipping admin seeding.');
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
