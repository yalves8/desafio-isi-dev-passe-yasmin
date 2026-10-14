import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const users = [
  {
    name: 'Administrador',
    email: 'admin@teste.com',
    password: 'Admin@123',
    role: Role.ADMIN,
  },
  {
    name: 'Usuário Comum',
    email: 'usuario@teste.com',
    password: 'Usuario@123',
    role: Role.USER,
  },
];

const rooms = [
  { name: 'Sala 101', capacity: 10 },
  { name: 'Auditório', capacity: 80 },
];

async function main() {
  for (const { password, ...user } of users) {
    const exists = await prisma.user.findFirst({
      where: { email: user.email, active: true },
    });
    if (exists) continue;
    await prisma.user.create({
      data: { ...user, passwordHash: await bcrypt.hash(password, 10) },
    });
  }

  if ((await prisma.room.count()) === 0) {
    await prisma.room.createMany({ data: rooms });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
