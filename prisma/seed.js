const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminPhone = process.env.ADMIN_PHONE || '+919890296618';
  console.log(`Checking/Creating admin user for phone: ${adminPhone}`);
  
  // 1. Seed Admin
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
  console.log(`Admin user ready: ${admin.phone}`);

  // 2. Seed Store Owner
  const ownerPhone = '+919999988888';
  console.log(`Creating dummy Store Owner: ${ownerPhone}`);
  const owner = await prisma.user.upsert({
    where: { phone: ownerPhone },
    update: { role: 'STORE_OWNER' },
    create: {
      phone: ownerPhone,
      name: 'Ramesh Kirana Wale',
      role: 'STORE_OWNER',
      isActive: true,
    }
  });

  // 3. Seed Gavran Dhaba (Restaurant)
  const store1 = await prisma.store.create({
    data: {
      name: 'Gavran Dhaba',
      description: 'Authentic local Maharashtrian spices & spicy curries.',
      address: 'Near ST Stand, Main Bazar',
      phone: ownerPhone,
      category: 'Restaurant',
      isOpen: true,
      isApproved: true,
      rating: 4.8,
      ownerId: owner.id,
      products: {
        create: [
          { name: 'Chicken Handi (Half)', description: 'Spicy farm-fresh chicken handi curry.', price: 180.0, category: 'Main Course' },
          { name: 'Shev Bhaji', description: 'Famous spicy red gravy curry topped with shev.', price: 120.0, category: 'Veg Curries' },
          { name: 'Butter Roti', description: 'Tandoori wheat roti glazed with fresh butter.', price: 20.0, category: 'Breads' },
          { name: 'Jeera Rice', description: 'Fragrant basmati rice tossed with cumin.', price: 90.0, category: 'Rice' }
        ]
      }
    }
  });
  console.log(`Seeded Restaurant Store: ${store1.name}`);

  // 4. Seed Aaple Kirana (Grocery)
  const store2 = await prisma.store.create({
    data: {
      name: 'Aaple Kirana Mall',
      description: 'Daily fresh staples, dairy, oil, and packaging goods.',
      address: 'Opposite Gram Panchayat Office',
      phone: ownerPhone,
      category: 'Grocery',
      isOpen: true,
      isApproved: true,
      rating: 4.6,
      ownerId: owner.id,
      products: {
        create: [
          { name: 'Fortune Sunflower Oil (1L)', description: 'Refined sunflower cooking oil.', price: 165.0, category: 'Oils' },
          { name: 'Amul Taaza Milk (1L)', description: 'Pasteurized toned milk pouch.', price: 60.0, category: 'Dairy' },
          { name: 'Aashirvaad Shudh Chakki Atta (5kg)', description: '100% whole wheat flour.', price: 260.0, category: 'Staples' },
          { name: 'Sugar (1kg)', description: 'Pure white crystal sugar.', price: 44.0, category: 'Staples' }
        ]
      }
    }
  });
  console.log(`Seeded Grocery Store: ${store2.name}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
