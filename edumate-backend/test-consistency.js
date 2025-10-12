const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConsistency() {
  console.log('🔍 Testing session data consistency for student1@edumate.com...\n');
  
  try {
    // Get student 1
    const student = await prisma.user.findUnique({
      where: { email: 'student1@edumate.com' }
    });
    
    if (!student) {
      console.log('Student not found');
      return;
    }
    
    const now = new Date();
    console.log('Current time:', now.toISOString());
    
    // Test dashboard approach (updated with session status filter)
    const user = await prisma.user.findUnique({
      where: { id: student.id },
      include: {
        enrollments: {
          where: { 
            status: 'joined',
            session: {
              status: 'published'
            }
          },
          include: { session: { include: { module: true, tutor: true } } }
        }
      }
    });
    
    const upcomingSessions = user.enrollments.filter(e => 
      new Date(e.session.startTime) > now
    ).length;
    
    // Test My Sessions approach (updated with session status filter)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        status: 'joined',
        session: {
          status: 'published'
        }
      },
      include: {
        session: {
          include: {
            module: { select: { code: true, name: true } },
            tutor: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { session: { startTime: 'asc' } }
    });
    
    const upcomingFromMySessions = enrollments.filter(e => 
      new Date(e.session.startTime) > now
    ).length;
    
    console.log('📊 Dashboard upcoming count:', upcomingSessions);
    console.log('📋 My Sessions upcoming count:', upcomingFromMySessions);
    console.log('✅ Consistent:', upcomingSessions === upcomingFromMySessions ? 'YES' : 'NO');
    
    if (upcomingSessions !== upcomingFromMySessions) {
      console.log('❌ MISMATCH DETECTED!');
    }
    
    console.log('\n📝 All sessions for this student:');
    enrollments.forEach((enrollment, index) => {
      const session = enrollment.session;
      const isUpcoming = new Date(session.startTime) > now;
      console.log(`  ${index + 1}. ${session.module.code} - ${new Date(session.startTime).toLocaleString()} (${session.status}) - ${isUpcoming ? 'UPCOMING' : 'PAST'}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConsistency();