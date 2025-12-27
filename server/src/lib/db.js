import {PrismaClient} from '@prisma/client';

// const globalForPrisma = globalThis 
// const prisma = new PrismaClient();

// if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// export default prisma;

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
