import { PrismaClient, SessionStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Users (Admin, Tutor, and Students)
  const adminPassword = await bcrypt.hash('AdminPass123', 10);
  const tutorPassword = await bcrypt.hash('TutorPass123', 10);
  const student1Password = await bcrypt.hash('Student1Pass123', 10);
  const student2Password = await bcrypt.hash('Student2Pass123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@edumate.com' },
    update: { passwordHash: adminPassword },
    create: {
      email: 'admin@edumate.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'admin', // Use string 'admin'
    },
  });

  const tutor = await prisma.user.upsert({
    where: { email: 'tutor@edumate.com' },
    update: { passwordHash: tutorPassword },
    create: {
      email: 'tutor@edumate.com',
      name: 'Jane Doe',
      passwordHash: tutorPassword,
      role: 'tutor', // Use string 'tutor'
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@edumate.com' },
    update: { passwordHash: student1Password },
    create: {
      email: 'student1@edumate.com',
      name: 'John Smith',
      passwordHash: student1Password,
      role: 'student', // Use string 'student'
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@edumate.com' },
    update: { passwordHash: student2Password },
    create: {
      email: 'student2@edumate.com',
      name: 'Alice Johnson',
      passwordHash: student2Password,
      role: 'student', // Use string 'student'
    },
  });

  console.log('Created users...');

  // 2. Create Modules
  const compSciModule = await prisma.module.upsert({
    where: { code: 'CMPG-321' },
    update: {},
    create: {
      code: 'CMPG-321',
      name: 'Software Engineering',
      faculty: 'Natural and Agricultural Sciences',
    },
  });

  const accountingModule = await prisma.module.upsert({
    where: { code: 'ACCF-111' },
    update: {},
    create: {
      code: 'ACCF-111',
      name: 'Introduction to Accounting',
      faculty: 'Economic and Management Sciences',
    },
  });

  console.log('Created modules...');

  // 3. Link Tutor to a Module
  await prisma.tutorModule.upsert({
    where: { tutorId_moduleId: { tutorId: tutor.id, moduleId: compSciModule.id } },
    update: {},
    create: {
      tutorId: tutor.id,
      moduleId: compSciModule.id,
      approvedByAdmin: true,
    },
  });

  console.log('Linked tutor to module...');

  // 4. Create a Session hosted by the Tutor
  const session = await prisma.session.create({
    data: {
      tutorId: tutor.id,
      moduleId: compSciModule.id,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Session starts tomorrow
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),   // Session ends one hour after start
      location: 'Building E8, Room 101',
      capacity: 10,
      status: SessionStatus.published,
    },
  });

  console.log('Created a session...');

  // 5. Enroll Students in the Session
  await prisma.enrollment.createMany({
    data: [
      {
        studentId: student1.id,
        sessionId: session.id,
        status: 'joined',
      },
      {
        studentId: student2.id,
        sessionId: session.id,
        status: 'joined',
      },
    ],
  });

  console.log('Enrolled students...');
  console.log('Database seeding complete! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });