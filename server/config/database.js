import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ MySQL (Prisma) Connected!');
  } catch (error) {
    console.error('❌ MySQL (Prisma) connection failed:', error.message);
    process.exit(1);
  }
};

export { prisma };
export default connectDB;