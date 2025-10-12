#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySetup() {
  console.log('🔍 Verifying EduMate Messaging System Setup...\n');

  try {
    // Check users
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });
    
    console.log('👥 USERS:');
    userCounts.forEach(group => {
      console.log(`   ${group.role}: ${group._count.id} users`);
    });

    // Check conversations
    const conversationCounts = await prisma.conversation.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    console.log('\n💬 CONVERSATIONS:');
    conversationCounts.forEach(group => {
      console.log(`   ${group.type}: ${group._count.id} conversations`);
    });

    // Check messages
    const totalMessages = await prisma.conversationMessage.count();
    console.log(`\n📝 MESSAGES: ${totalMessages} total messages`);

    // Check recent messages
    console.log('\n🕐 RECENT MESSAGES:');
    const recentMessages = await prisma.conversationMessage.findMany({
      take: 5,
      orderBy: { sentAt: 'desc' },
      include: {
        sender: { select: { name: true, role: true } },
        conversation: { select: { name: true, type: true } }
      }
    });

    recentMessages.forEach(msg => {
      const convName = msg.conversation.name || `${msg.conversation.type} conversation`;
      console.log(`   ${msg.sender.name} (${msg.sender.role}) in "${convName}": ${msg.content.substring(0, 50)}...`);
    });

    // Check group participants
    const groupParticipants = await prisma.conversation.findMany({
      where: { isGroup: true },
      include: {
        participants: {
          include: { user: { select: { name: true, role: true } } }
        }
      }
    });

    console.log('\n👥 GROUP PARTICIPANTS:');
    groupParticipants.forEach(group => {
      console.log(`   ${group.name || 'Group'}:`);
      group.participants.forEach(participant => {
        console.log(`     - ${participant.user.name} (${participant.user.role})`);
      });
    });

    // Test accounts summary
    console.log('\n🔐 TEST ACCOUNTS FOR MESSAGING:');
    console.log('   Students:');
    console.log('     - student1@edumate.com / StudentPass123! (John Smith)');
    console.log('     - student2@edumate.com / StudentPass123! (Alice Johnson)');
    console.log('     - student3@edumate.com / StudentPass123! (Mohammed Al-Hassan)');
    console.log('\n   Tutors:');
    console.log('     - tutor1@edumate.com / TutorPass123! (Dr. Sarah Mitchell)');
    console.log('     - tutor2@edumate.com / TutorPass123! (Prof. Michael Chen)');
    console.log('     - tutor3@edumate.com / TutorPass123! (Dr. Emma Thompson)');

    console.log('\n✅ Messaging system setup verified successfully!');
    console.log('\n🚀 READY TO TEST:');
    console.log('   1. Start backend server: npm run dev');
    console.log('   2. Start frontend server: npm run dev (in frontend directory)');
    console.log('   3. Login with test accounts and test messaging functionality');
    console.log('   4. Refer to MESSAGING_TEST_GUIDE.md for detailed testing instructions');

  } catch (error) {
    console.error('❌ Error verifying setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();