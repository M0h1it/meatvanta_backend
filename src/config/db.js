const { PrismaClient } = require("@prisma/client");

// Single shared instance across the app - don't `new PrismaClient()` anywhere else.
const prisma = new PrismaClient();

module.exports = prisma;
