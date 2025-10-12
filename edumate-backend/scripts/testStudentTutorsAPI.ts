import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStudentTutorsAPI() {
  console.log('🧪 Testing Student-Tutors API endpoint...\n');

  try {
    // Simulate the exact same query that the API endpoint makes
    const userId = 7; // John Smith's ID from our test
    
    console.log(`Testing with User ID: ${userId}`);

    // Get all tutors that this student has had sessions with
    const studentTutors = await prisma.studentTutor.findMany({
      where: {
        studentId: userId
      },
      include: {
        tutor: {
          include: {
            profile: {
              select: {
                bio: true,
                profilePicture: true,
                specialties: true,
                averageRating: true,
                totalSessions: true,
                isOnline: true,
                lastSeen: true
              }
            },
            tutorModules: {
              include: {
                module: {
                  select: {
                    code: true,
                    name: true,
                    faculty: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        lastSessionDate: 'desc' // Most recently interacted tutors first
      }
    });

    console.log(`Found ${studentTutors.length} student-tutor relationships`);

    // Format the response exactly like the API does
    const formattedTutors = studentTutors.map(relationship => {
      const tutor = relationship.tutor;
      
      return {
        relationshipId: relationship.id,
        tutorId: tutor.id,
        name: tutor.name,
        email: tutor.email,
        bio: tutor.profile?.bio || '',
        profilePicture: tutor.profile?.profilePicture,
        specialties: tutor.profile?.specialties || [],
        averageRating: tutor.profile?.averageRating || 0,
        totalSessions: tutor.profile?.totalSessions || 0,
        isOnline: tutor.profile?.isOnline || false,
        lastSeen: tutor.profile?.lastSeen,
        
        // Relationship-specific data
        firstSessionDate: relationship.firstSessionDate,
        lastSessionDate: relationship.lastSessionDate,
        totalSessionsTogether: relationship.totalSessions,
        averageRatingGiven: relationship.averageRating,
        
        // Modules this tutor teaches
        modules: tutor.tutorModules.map(tm => ({
          code: tm.module.code,
          name: tm.module.name,
          faculty: tm.module.faculty
        }))
      };
    });

    console.log('\n📋 Formatted tutors data:');
    formattedTutors.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name} (ID: ${tutor.tutorId})`);
      console.log(`   - Total sessions together: ${tutor.totalSessionsTogether}`);
      console.log(`   - Modules: ${tutor.modules.map(m => m.code).join(', ')}`);
      console.log(`   - Profile exists: ${!!tutor.bio || !!tutor.specialties.length}`);
    });

    const apiResponse = {
      success: true,
      data: {
        tutors: formattedTutors,
        totalCount: formattedTutors.length
      }
    };

    console.log('\n✅ API Response structure:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // Check if any tutors have missing profile data
    const tutorsWithoutProfile = formattedTutors.filter(t => !t.bio && (!t.specialties || t.specialties.length === 0));
    if (tutorsWithoutProfile.length > 0) {
      console.log(`\n⚠️  Warning: ${tutorsWithoutProfile.length} tutors have no profile data`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentTutorsAPI();