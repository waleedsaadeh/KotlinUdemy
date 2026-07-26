import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- Admin user ---
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acg.com' },
    update: {},
    create: {
      email: 'admin@acg.com',
      name: 'ACG Administrator',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log('✔ Admin user ready:', admin.email);

  // --- Categories ---
  const electronics = await prisma.category.upsert({
    where: { id: 'seed-cat-electronics' },
    update: {},
    create: {
      id: 'seed-cat-electronics',
      nameEn: 'Electronics',
      nameAr: 'إلكترونيات',
      description: 'Electronic devices and accessories',
    },
  });
  const office = await prisma.category.upsert({
    where: { id: 'seed-cat-office' },
    update: {},
    create: {
      id: 'seed-cat-office',
      nameEn: 'Office Supplies',
      nameAr: 'مستلزمات مكتبية',
      description: 'Stationery and office equipment',
    },
  });
  console.log('✔ Categories ready');

  // --- Warehouse ---
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { id: 'seed-wh-main' },
    update: {},
    create: {
      id: 'seed-wh-main',
      nameEn: 'Main Warehouse',
      nameAr: 'المستودع الرئيسي',
      location: 'Amman',
    },
  });
  console.log('✔ Warehouse ready');

  // --- Products ---
  const products = [
    {
      id: 'seed-prod-laptop',
      sku: 'ELEC-001',
      nameEn: 'Laptop 15"',
      nameAr: 'حاسوب محمول 15 بوصة',
      unit: 'pcs',
      costPrice: 400,
      salePrice: 550,
      reorderLevel: 5,
      categoryId: electronics.id,
      qty: 25,
    },
    {
      id: 'seed-prod-mouse',
      sku: 'ELEC-002',
      nameEn: 'Wireless Mouse',
      nameAr: 'فأرة لاسلكية',
      unit: 'pcs',
      costPrice: 8,
      salePrice: 15,
      reorderLevel: 20,
      categoryId: electronics.id,
      qty: 120,
    },
    {
      id: 'seed-prod-paper',
      sku: 'OFF-001',
      nameEn: 'A4 Paper Ream',
      nameAr: 'رزمة ورق A4',
      unit: 'ream',
      costPrice: 3,
      salePrice: 5,
      reorderLevel: 50,
      categoryId: office.id,
      qty: 300,
    },
  ];

  for (const p of products) {
    const { qty, ...data } = p;
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: data,
    });
    await prisma.stock.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: mainWarehouse.id,
        },
      },
      update: { quantity: qty },
      create: {
        productId: product.id,
        warehouseId: mainWarehouse.id,
        quantity: qty,
      },
    });
  }
  console.log('✔ Sample products & stock ready');
  console.log('\n🎉 Seed complete. Login with admin@acg.com / Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
