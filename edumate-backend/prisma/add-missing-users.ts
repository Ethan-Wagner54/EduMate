import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding missing users found in frontend mock data...');

  // Hash password for all new users
  const defaultPassword = await bcrypt.hash('DefaultPass123', 10);

  try {
    // 1. Sarah Johnson (Tutor from MyTutors.jsx)
    const sarahJohnson = await prisma.user.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: {
        email: 'sarah@example.com',
        name: 'Sarah Johnson',
        passwordHash: defaultPassword,
        role: Role.tutor,
        phone: '+27 82 555 0001',
      },
    });

    // Create Sarah's profile with specialties and ratings
    await prisma.userProfile.upsert({
      where: { userId: sarahJohnson.id },
      update: {},
      create: {
        userId: sarahJohnson.id,
        bio: 'Experienced mathematics tutor with expertise in calculus, algebra, and statistics. Passionate about helping students achieve their academic goals.',
        specialties: ['Calculus', 'Algebra', 'Statistics'],
        totalSessions: 12,
        completedSessions: 10,
        averageRating: 4.9,
        isOnline: true,
      },
    });

    console.log('✓ Created Sarah Johnson (tutor)');

    // 2. Michael Chen (Tutor from MyTutors.jsx)
    const michaelChen = await prisma.user.upsert({
      where: { email: 'michael@example.com' },
      update: {},
      create: {
        email: 'michael@example.com',
        name: 'Michael Chen',
        passwordHash: defaultPassword,
        role: Role.tutor,
        phone: '+27 82 555 0002',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: michaelChen.id },
      update: {},
      create: {
        userId: michaelChen.id,
        bio: 'Computer Science tutor specializing in programming, data structures, and algorithms. Helping students master complex programming concepts.',
        specialties: ['Programming', 'Data Structures', 'Algorithms'],
        totalSessions: 8,
        completedSessions: 6,
        averageRating: 4.8,
        isOnline: false,
      },
    });

    console.log('✓ Created Michael Chen (tutor)');

    // 3. Emily Rodriguez (Tutor from MyTutors.jsx)
    const emilyRodriguez = await prisma.user.upsert({
      where: { email: 'emily@example.com' },
      update: {},
      create: {
        email: 'emily@example.com',
        name: 'Emily Rodriguez',
        passwordHash: defaultPassword,
        role: Role.tutor,
        phone: '+27 82 555 0003',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: emilyRodriguez.id },
      update: {},
      create: {
        userId: emilyRodriguez.id,
        bio: 'Chemistry tutor with expertise in organic chemistry and laboratory techniques. Dedicated to making chemistry accessible and engaging.',
        specialties: ['Organic Chemistry', 'Lab Techniques'],
        totalSessions: 6,
        completedSessions: 4,
        averageRating: 4.7,
        isOnline: true,
      },
    });

    console.log('✓ Created Emily Rodriguez (tutor)');

    // 4. Mike Chen (Student from groupChatService.ts - different from Michael)
    const mikeChen = await prisma.user.upsert({
      where: { email: 'mike.chen@example.com' },
      update: {},
      create: {
        email: 'mike.chen@example.com',
        name: 'Mike Chen',
        passwordHash: defaultPassword,
        role: Role.student,
        phone: '+27 82 555 0004',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: mikeChen.id },
      update: {},
      create: {
        userId: mikeChen.id,
        bio: 'Computer Science student passionate about learning programming and software development.',
        favoriteSubjects: ['Programming', 'Software Engineering', 'Mathematics'],
        totalSessions: 4,
        completedSessions: 3,
        isOnline: true,
      },
    });

    console.log('✓ Created Mike Chen (student)');

    // 5. Emily Davis (Student from groupChatService.ts)
    const emilyDavis = await prisma.user.upsert({
      where: { email: 'emily.davis@example.com' },
      update: {},
      create: {
        email: 'emily.davis@example.com',
        name: 'Emily Davis',
        passwordHash: defaultPassword,
        role: Role.student,
        phone: '+27 82 555 0005',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: emilyDavis.id },
      update: {},
      create: {
        userId: emilyDavis.id,
        bio: 'Mathematics student with interest in calculus and statistics.',
        favoriteSubjects: ['Mathematics', 'Statistics', 'Calculus'],
        totalSessions: 5,
        completedSessions: 4,
        isOnline: false,
      },
    });

    console.log('✓ Created Emily Davis (student)');

    // 6. Alex Rodriguez (Student from groupChatService.ts)
    const alexRodriguez = await prisma.user.upsert({
      where: { email: 'alex.rodriguez@example.com' },
      update: {},
      create: {
        email: 'alex.rodriguez@example.com',
        name: 'Alex Rodriguez',
        passwordHash: defaultPassword,
        role: Role.student,
        phone: '+27 82 555 0006',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: alexRodriguez.id },
      update: {},
      create: {
        userId: alexRodriguez.id,
        bio: 'Computer Science student interested in data structures and algorithms.',
        favoriteSubjects: ['Computer Science', 'Data Structures', 'Programming'],
        totalSessions: 3,
        completedSessions: 2,
        isOnline: true,
      },
    });

    console.log('✓ Created Alex Rodriguez (student)');

    // 7. Student One (from mock students.json)
    const studentOne = await prisma.user.upsert({
      where: { email: 'student1@example.com' },
      update: {},
      create: {
        email: 'student1@example.com',
        name: 'Student One',
        passwordHash: defaultPassword,
        role: Role.student,
        phone: '+27 82 555 0007',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: studentOne.id },
      update: {},
      create: {
        userId: studentOne.id,
        bio: 'Dedicated student working towards academic excellence.',
        favoriteSubjects: ['General Studies'],
        totalSessions: 2,
        completedSessions: 1,
        isOnline: false,
      },
    });

    console.log('✓ Created Student One');

    // 8. Student Two (from mock students.json)
    const studentTwo = await prisma.user.upsert({
      where: { email: 'student2@example.com' },
      update: {},
      create: {
        email: 'student2@example.com',
        name: 'Student Two',
        passwordHash: defaultPassword,
        role: Role.student,
        phone: '+27 82 555 0008',
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: studentTwo.id },
      update: {},
      create: {
        userId: studentTwo.id,
        bio: 'Enthusiastic student committed to learning and growth.',
        favoriteSubjects: ['General Studies'],
        totalSessions: 3,
        completedSessions: 2,
        isOnline: true,
      },
    });

    console.log('✓ Created Student Two');

    // Create relevant modules for the tutors
    const mathModule101 = await prisma.module.upsert({
      where: { code: 'MATH-101' },
      update: {},
      create: {
        code: 'MATH-101',
        name: 'Mathematics I',
        faculty: 'Natural and Agricultural Sciences',
      },
    });

    const calcModule201 = await prisma.module.upsert({
      where: { code: 'CALC-201' },
      update: {},
      create: {
        code: 'CALC-201',
        name: 'Calculus II',
        faculty: 'Natural and Agricultural Sciences',
      },
    });

    const csModule201 = await prisma.module.upsert({
      where: { code: 'CS-201' },
      update: {},
      create: {
        code: 'CS-201',
        name: 'Data Structures',
        faculty: 'Natural and Agricultural Sciences',
      },
    });

    const csModule301 = await prisma.module.upsert({
      where: { code: 'CS-301' },
      update: {},
      create: {
        code: 'CS-301',
        name: 'Advanced Algorithms',
        faculty: 'Natural and Agricultural Sciences',
      },
    });

    const chemModule201 = await prisma.module.upsert({
      where: { code: 'CHEM-201' },
      update: {},
      create: {
        code: 'CHEM-201',
        name: 'Organic Chemistry',
        faculty: 'Natural and Agricultural Sciences',
      },
    });

    console.log('✓ Created modules');

    // Link tutors to their modules
    await prisma.tutorModule.upsert({
      where: { tutorId_moduleId: { tutorId: sarahJohnson.id, moduleId: mathModule101.id } },
      update: {},
      create: {
        tutorId: sarahJohnson.id,
        moduleId: mathModule101.id,
        approvedByAdmin: true,
      },
    });

    await prisma.tutorModule.upsert({
      where: { tutorId_moduleId: { tutorId: sarahJohnson.id, moduleId: calcModule201.id } },
      update: {},
      create: {
        tutorId: sarahJohnson.id,
        moduleId: calcModule201.id,
        approvedByAdmin: true,
      },
    });

    await prisma.tutorModule.upsert({
      where: { tutorId_moduleId: { tutorId: michaelChen.id, moduleId: csModule201.id } },
      update: {},
      create: {
        tutorId: michaelChen.id,
        moduleId: csModule201.id,
        approvedByAdmin: true,
      },
    });

    await prisma.tutorModule.upsert({
      where: { tutorId_moduleId: { tutorId: michaelChen.id, moduleId: csModule301.id } },
      update: {},
      create: {
        tutorId: michaelChen.id,
        moduleId: csModule301.id,
        approvedByAdmin: true,
      },
    });

    await prisma.tutorModule.upsert({
      where: { tutorId_moduleId: { tutorId: emilyRodriguez.id, moduleId: chemModule201.id } },
      update: {},
      create: {
        tutorId: emilyRodriguez.id,
        moduleId: chemModule201.id,
        approvedByAdmin: true,
      },
    });

    console.log('✓ Linked tutors to modules');

    // Create some sample sessions for the new tutors
    const now = new Date();
    const tomorrowAt2pm = new Date(now);
    tomorrowAt2pm.setDate(now.getDate() + 1);
    tomorrowAt2pm.setHours(14, 0, 0, 0);

    const dayAfterAt4pm = new Date(now);
    dayAfterAt4pm.setDate(now.getDate() + 2);
    dayAfterAt4pm.setHours(16, 0, 0, 0);

    await prisma.session.create({
      data: {
        tutorId: sarahJohnson.id,
        moduleId: mathModule101.id,
        startTime: tomorrowAt2pm,
        endTime: new Date(tomorrowAt2pm.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        location: 'Building E8, Room 203',
        capacity: 15,
        status: 'published',
      },
    });

    await prisma.session.create({
      data: {
        tutorId: michaelChen.id,
        moduleId: csModule201.id,
        startTime: dayAfterAt4pm,
        endTime: new Date(dayAfterAt4pm.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        location: 'Computer Lab A',
        capacity: 12,
        status: 'published',
      },
    });

    console.log('✓ Created sample sessions');

    console.log('\n=== Missing Users Successfully Created! ===');
    console.log('🎉 All frontend mock users now have corresponding database entries');
    console.log('\n=== New User Credentials ===');
    console.log('📧 All new users have password: DefaultPass123');
    console.log('👥 Tutors created:');
    console.log('   - Sarah Johnson: sarah@example.com');
    console.log('   - Michael Chen: michael@example.com');
    console.log('   - Emily Rodriguez: emily@example.com');
    console.log('🎓 Students created:');
    console.log('   - Mike Chen: mike.chen@example.com');
    console.log('   - Emily Davis: emily.davis@example.com');
    console.log('   - Alex Rodriguez: alex.rodriguez@example.com');
    console.log('   - Student One: student1@example.com');
    console.log('   - Student Two: student2@example.com');

  } catch (error) {
    console.error('Error creating missing users:', error);
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