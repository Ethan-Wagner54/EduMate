import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying all users exist in the database...\n');

  try {
    // Get all users with their profiles
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        tutorModules: {
          include: {
            module: true,
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    });

    console.log(`📊 Total users in database: ${users.length}\n`);

    // Group users by role
    const admins = users.filter(u => u.role === 'admin');
    const tutors = users.filter(u => u.role === 'tutor');
    const students = users.filter(u => u.role === 'student');

    console.log('👨‍💼 ADMINS:');
    admins.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    console.log('\n👥 TUTORS:');
    tutors.forEach(user => {
      const modules = user.tutorModules.map(tm => tm.module.code).join(', ');
      const rating = user.profile?.averageRating || 'No rating';
      console.log(`   - ${user.name} (${user.email})`);
      console.log(`     Modules: ${modules || 'None'}`);
      console.log(`     Rating: ${rating}${user.profile?.totalSessions ? ` (${user.profile.totalSessions} sessions)` : ''}`);
    });

    console.log('\n🎓 STUDENTS:');
    students.forEach(user => {
      const sessions = user.profile?.totalSessions || 0;
      console.log(`   - ${user.name} (${user.email})`);
      console.log(`     Sessions: ${sessions}`);
    });

    // Check specific users from MyTutors.jsx
    console.log('\n🔍 VERIFICATION OF MYTUTORS.JSX USERS:');
    const myTutorsUsers = [
      { name: 'Sarah Johnson', email: 'sarah@example.com' },
      { name: 'Michael Chen', email: 'michael@example.com' },
      { name: 'Emily Rodriguez', email: 'emily@example.com' }
    ];

    for (const expectedUser of myTutorsUsers) {
      const user = users.find(u => u.email === expectedUser.email);
      if (user) {
        console.log(`   ✅ ${expectedUser.name} exists with correct email`);
      } else {
        console.log(`   ❌ ${expectedUser.name} NOT FOUND`);
      }
    }

    console.log('\n🔍 VERIFICATION OF GROUP CHAT USERS:');
    const groupChatUsers = [
      { name: 'Mike Chen', email: 'mike.chen@example.com' },
      { name: 'Emily Davis', email: 'emily.davis@example.com' },
      { name: 'Alex Rodriguez', email: 'alex.rodriguez@example.com' }
    ];

    for (const expectedUser of groupChatUsers) {
      const user = users.find(u => u.email === expectedUser.email);
      if (user) {
        console.log(`   ✅ ${expectedUser.name} exists with correct email`);
      } else {
        console.log(`   ❌ ${expectedUser.name} NOT FOUND`);
      }
    }

    console.log('\n✨ Verification complete!');

  } catch (error) {
    console.error('Error verifying users:', error);
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