import { PrismaClient } from '@prisma/client';
const { countUpcomingSessions, getAllStudentSessions } = require('../src/utils/sessionHelpers');

const prisma = new PrismaClient();

async function testSessionConsistency() {
  console.log('🔍 Testing session data consistency...\n');

  try {
    // Get all students
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      select: { id: true, name: true, email: true }
    });

    for (const student of students) {
      console.log(`\n👨‍🎓 Testing student: ${student.name} (${student.email})`);
      console.log(`   User ID: ${student.id}`);

      // Test dashboard stats count
      const upcomingCount = await countUpcomingSessions(student.id);
      
      // Test My Sessions page data
      const allSessions = await getAllStudentSessions(student.id);
      const now = new Date();
      const upcomingFromAll = allSessions.filter(e => 
        new Date(e.session.startTime) > now
      ).length;

      console.log(`   📊 Dashboard upcoming count: ${upcomingCount}`);
      console.log(`   📋 My Sessions upcoming count: ${upcomingFromAll}`);
      console.log(`   ✅ Consistent: ${upcomingCount === upcomingFromAll ? 'YES' : 'NO'}`);

      if (upcomingCount !== upcomingFromAll) {
        console.log(`   ❌ MISMATCH DETECTED!`);
        console.log(`   📝 Session details:`);
        allSessions.forEach((enrollment, index) => {
          const session = enrollment.session;
          const isUpcoming = new Date(session.startTime) > now;
          console.log(`      ${index + 1}. ${session.module.code} - ${new Date(session.startTime).toLocaleString()} (${session.status}) - ${isUpcoming ? 'UPCOMING' : 'PAST'}`);
        });
      } else if (upcomingCount > 0) {
        console.log(`   📝 Upcoming sessions:`);
        const upcomingSessions = allSessions.filter(e => 
          new Date(e.session.startTime) > now
        );
        upcomingSessions.forEach((enrollment, index) => {
          const session = enrollment.session;
          console.log(`      ${index + 1}. ${session.module.code} - ${new Date(session.startTime).toLocaleString()}`);
        });
      }
    }

    console.log('\n🎉 Session consistency test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSessionConsistency();