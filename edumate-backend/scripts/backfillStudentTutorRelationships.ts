import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

async function backfillStudentTutorRelationships() {
  console.log('🔄 Starting backfill of student-tutor relationships...');

  try {
    // Get all enrollments that are 'joined' and don't have corresponding student-tutor relationships
    const enrollments = await prisma.enrollment.findMany({
      where: {
        status: 'joined'
      },
      include: {
        session: {
          select: {
            tutorId: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });

    console.log(`Found ${enrollments.length} enrollments to process`);

    let created = 0;
    let updated = 0;

    // Group enrollments by student-tutor pairs
    const studentTutorMap = new Map();

    for (const enrollment of enrollments) {
      const key = `${enrollment.studentId}-${enrollment.session.tutorId}`;
      
      if (!studentTutorMap.has(key)) {
        studentTutorMap.set(key, {
          studentId: enrollment.studentId,
          tutorId: enrollment.session.tutorId,
          sessions: []
        });
      }

      studentTutorMap.get(key).sessions.push({
        startTime: enrollment.session.startTime,
        endTime: enrollment.session.endTime,
        enrollmentDate: enrollment.joinedAt
      });
    }

    console.log(`Processing ${studentTutorMap.size} unique student-tutor relationships...`);

    // Create or update student-tutor relationships
    for (const [key, data] of studentTutorMap) {
      const sessions = data.sessions.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      const firstSession = sessions[0];
      const lastSession = sessions[sessions.length - 1];

      try {
        const result = await prisma.studentTutor.upsert({
          where: {
            studentId_tutorId: {
              studentId: data.studentId,
              tutorId: data.tutorId
            }
          },
          update: {
            lastSessionDate: lastSession.startTime,
            totalSessions: sessions.length
          },
          create: {
            studentId: data.studentId,
            tutorId: data.tutorId,
            firstSessionDate: firstSession.startTime,
            lastSessionDate: lastSession.startTime,
            totalSessions: sessions.length
          }
        });

        if (result.createdAt === result.updatedAt) {
          created++;
          console.log(`✅ Created relationship: Student ${data.studentId} ↔ Tutor ${data.tutorId} (${sessions.length} sessions)`);
        } else {
          updated++;
          console.log(`🔄 Updated relationship: Student ${data.studentId} ↔ Tutor ${data.tutorId} (${sessions.length} sessions)`);
        }
      } catch (error) {
        console.error(`❌ Error processing relationship Student ${data.studentId} ↔ Tutor ${data.tutorId}:`, error);
      }
    }

    console.log('\n🎉 Backfill completed!');
    console.log(`📊 Results:`);
    console.log(`   - Created: ${created} relationships`);
    console.log(`   - Updated: ${updated} relationships`);
    console.log(`   - Total processed: ${created + updated} relationships`);

    // Verify the results
    const totalRelationships = await prisma.studentTutor.count();
    console.log(`   - Total relationships in database: ${totalRelationships}`);

  } catch (error) {
    console.error('❌ Backfill failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillStudentTutorRelationships();