import { PrismaClient } from '@prisma/client';

//kết nối DB
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

export default prisma;