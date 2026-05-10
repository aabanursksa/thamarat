import prisma from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";
import logger from "../src/lib/logger.js";

const U = {
  SHAI: "a5e240f1-09d1-418a-800b-8f7ba295f59d",
  QAHWA: "5fb4e080-47fc-4d73-bbc9-df438551a4ca",
  HUMMUS: "62517bd1-3616-433d-be57-a60375d0dd17",
  MIXED: "6a5415bd-7dde-49a4-ae9d-4d670d899c21",
  CHICKEN: "2a08c616-4ac0-4610-b004-e55bde6a0577",
  MEAT: "921956e0-7c5a-4c15-86ae-4c0b04146dcb",
};

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
    where: { id: U.SHAI },
    update: {},
    create: { id: U.SHAI, name: "شاي", price: 5, categoryId: cat1.id, available: true },
  });
  await prisma.menuItem.upsert({
    where: { id: U.QAHWA },
    update: {},
    create: { id: U.QAHWA, name: "قهوة", price: 8, categoryId: cat1.id, available: true },
  });
  await prisma.menuItem.upsert({
    where: { id: U.HUMMUS },
    update: {},
    create: { id: U.HUMMUS, name: "حمص", price: 15, categoryId: cat2.id, available: true },
  });
  await prisma.menuItem.upsert({
    where: { id: U.MIXED },
    update: {},
    create: { id: U.MIXED, name: "مقبلات مشكلة", price: 25, categoryId: cat2.id, available: true },
  });
  await prisma.menuItem.upsert({
    where: { id: U.CHICKEN },
    update: {},
    create: { id: U.CHICKEN, name: "دجاج مشوي", price: 45, categoryId: cat3.id, available: true },
  });
  await prisma.menuItem.upsert({
    where: { id: U.MEAT },
    update: {},
    create: { id: U.MEAT, name: "لحم مع أرز", price: 60, categoryId: cat3.id, available: true },
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
