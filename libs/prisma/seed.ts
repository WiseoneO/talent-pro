import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
async function main() {
  const salt = 10;
  const password = 'password';
  const hashPassword = await bcrypt.hash(password, salt);

  await Promise.all([
    prisma.user.createMany({
      data: [
        {
          email: 'stephanie@talentpro.africa',
          username: 'Stephanie',
          password: hashPassword,
          role: Role.SUPER_ADMIN,
          status: 'ACTIVE',
        },
        {
          email: 'ogboroge@talentpro.africa',
          username: 'Wiseone',
          password: hashPassword,
          role: Role.SUPER_ADMIN,
          status: 'ACTIVE',
        },
        {
          email: 'austin@talentpro.africa',
          username: 'Austin',
          password: hashPassword,
          role: Role.ADMIN,
          status: 'ACTIVE',
        },
        {
          email: 'louna@talentpro.africa',
          username: 'Louna',
          password: hashPassword,
          role: Role.RECRUITER,
          status: 'ACTIVE',
        },
        {
          email: 'test@talentpro.africa',
          username: 'user',
          password: hashPassword,
          role: Role.USER,
          status: 'ACTIVE',
        },
      ],
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
