import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding users found in studentFeedback.json...');

  // Hash password for all new users
  const defaultPassword = await bcrypt.hash('DefaultPass123', 10);

  try {
    // From studentFeedback.json
    // 1. John Doe (different from existing John Smith)
    const johnDoe = await prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        passwordHash: defaultPassword,
        role: Role.student,
        phone: '+27 82 555 0009',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: johnDoe.id },
      update: {},
      create: {
        userId: johnDoe.id,
        bio: 'Mathematics student with strong interest in calculus and derivatives.',
        favoriteSubjects: ['Mathematics', 'Calculus', 'Algebra'],
        totalSessions: 3,
        completedSessions: 3,
        isOnline: false,
      },
    });

    console.log('✓ Created John Doe (student)');

    // 2. Mary Smith
    const marySmith = await prisma.user.upsert({
      where: { email: 'mary.smith@example.com' },
      update: {},
      create: {
        email: 'mary.smith@example.com',
        name: 'Mary Smith',
        passwordHash: defaultPassword,
        role: Role.student,
        phone: '+27 82 555 0010',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: marySmith.id },
      update: {},
      create: {
        userId: marySmith.id,
        bio: 'Statistics student focused on statistical analysis and data interpretation.',
        favoriteSubjects: ['Statistics', 'Mathematics', 'Data Analysis'],
        totalSessions: 4,
        completedSessions: 4,
        isOnline: true,
      },
    });

    console.log('✓ Created Mary Smith (student)');

    // 3. David Wilson
    const davidWilson = await prisma.user.upsert({
      where: { email: 'david.wilson@example.com' },
      update: {},
      create: {
        email: 'david.wilson@example.com',
        name: 'David Wilson',
        passwordHash: defaultPassword,
        role: Role.student,
        phone: '+27 82 555 0011',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: davidWilson.id },
      update: {},
      create: {
        userId: davidWilson.id,
        bio: 'Advanced mathematics student seeking more challenging practice problems.',
        favoriteSubjects: ['Advanced Mathematics', 'Problem Solving', 'Mathematical Theory'],
        totalSessions: 2,
        completedSessions: 2,
        isOnline: false,
      },
    });

    console.log('✓ Created David Wilson (student)');

    // Create relevant modules if they don't exist
    const mathModule111 = await prisma.module.upsert({
      where: { code: 'MATH-111' },
      update: {},
      create: {
        code: 'MATH-111',
        name: 'Mathematics 111',
        faculty: 'Natural and Agricultural Sciences',
      },
    });

    const statModule141 = await prisma.module.upsert({
      where: { code: 'STAT-141' },
      update: {},
      create: {
        code: 'STAT-141',
        name: 'Statistics 141',
        faculty: 'Natural and Agricultural Sciences',
      },
    });

    const mathModule141 = await prisma.module.upsert({
      where: { code: 'MATH-141' },
      update: {},
      create: {
        code: 'MATH-141',
        name: 'Mathematics 141',
        faculty: 'Natural and Agricultural Sciences',
      },
    });

    console.log('✓ Created additional modules');

    console.log('\n=== Additional Users Successfully Created! ===');
    console.log('🎉 Students from feedback data added to database');
    console.log('\n=== New User Credentials ===');
    console.log('📧 All new users have password: DefaultPass123');
    console.log('🎓 Additional students created:');
    console.log('   - John Doe: john.doe@example.com');
    console.log('   - Mary Smith: mary.smith@example.com');
    console.log('   - David Wilson: david.wilson@example.com');

  } catch (error) {
    console.error('Error creating feedback users:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });