import prisma from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";
import logger from "../src/lib/logger.js";

async function seed() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@restaurant.com" },
    update: {},
    create: {
      email: "admin@restaurant.com",
      password: adminPassword,
      name: "Admin",
      role: "admin",
    },
  });

  const cat1 = await prisma.category.upsert({
    where: { name: "مشروبات" },
    update: {},
    create: { name: "مشروبات", sortOrder: 1 },
  });
  const cat2 = await prisma.category.upsert({
    where: { name: "مقبلات" },
    update: {},
    create: { name: "مقبلات", sortOrder: 2 },
  });
  const cat3 = await prisma.category.upsert({
    where: { name: "وجبات رئيسية" },
    update: {},
    create: { name: "وجبات رئيسية", sortOrder: 3 },
  });

  await prisma.menuItem.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "شاي",
      price: 5,
      categoryId: cat1.id,
      available: true,
    },
  });
  await prisma.menuItem.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "قهوة",
      price: 8,
      categoryId: cat1.id,
      available: true,
    },
  });
  await prisma.menuItem.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      name: "حمص",
      price: 15,
      categoryId: cat2.id,
      available: true,
    },
  });
  await prisma.menuItem.upsert({
    where: { id: "00000000-0000-0000-0000-000000000004" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000004",
      name: "مقبلات مشكلة",
      price: 25,
      categoryId: cat2.id,
      available: true,
    },
  });
  await prisma.menuItem.upsert({
    where: { id: "00000000-0000-0000-0000-000000000005" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000005",
      name: "دجاج مشوي",
      price: 45,
      categoryId: cat3.id,
      available: true,
    },
  });
  await prisma.menuItem.upsert({
    where: { id: "00000000-0000-0000-0000-000000000006" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000006",
      name: "لحم مع أرز",
      price: 60,
      categoryId: cat3.id,
      available: true,
    },
  });

  for (let i = 1; i <= 8; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: { number: i },
    });
  }

  logger.info("Seed completed successfully");
}

seed()
  .catch((e) => {
    logger.error(e, "Seed failed");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
