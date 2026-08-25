require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const tables = {
    products: await prisma.product.count(),
    categories: await prisma.category.count(),
    orders: await prisma.order.count(),
    customers: await prisma.customer.count(),
    adminUsers: await prisma.adminUser.count()
  };

  console.log(tables);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
