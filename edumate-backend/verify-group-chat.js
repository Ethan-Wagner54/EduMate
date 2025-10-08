const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function checkGroupChatParticipants(sessionId, userId) {
  console.log(`\n=== Checking Group Chat for Session ${sessionId} ===`);
  
  // Find the session
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { 
      module: true,
      tutor: { select: { id: true, name: true } }
    }
  });
  
  if (!session) {
    console.log(`❌ Session ${sessionId} not found`);
    return false;
  }
  
  console.log(`✅ Found Session: ${session.module.code} - ${session.module.name} Session ${sessionId}`);
  console.log(`   Tutor: ${session.tutor.name} (ID: ${session.tutor.id})`);
  
  // Find the group chat conversation
  const conversationName = `${session.module.code} - ${session.module.name} Session ${sessionId}`;
  const conversation = await prisma.conversation.findFirst({
    where: {
      type: 'session_chat',
      name: conversationName
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      },
      messages: {
        orderBy: { sentAt: 'desc' },
        take: 5,
        include: {
          sender: { select: { name: true } }
        }
      }
    }
  });
  
  if (!conversation) {
    console.log(`❌ No group chat conversation found with name: "${conversationName}"`);
    return false;
  }
  
  console.log(`✅ Found Group Chat: "${conversation.name}" (ID: ${conversation.id})`);
  console.log(`   Created: ${conversation.createdAt}`);
  console.log(`   Participants (${conversation.participants.length}):`);
  
  let userFound = false;
  conversation.participants.forEach(participant => {
    const isUser = participant.userId === userId;
    const isTutor = participant.userId === session.tutor.id;
    console.log(`   - ${participant.user.name} (${participant.user.email}) ${isUser ? '← USER' : ''} ${isTutor ? '← TUTOR' : ''}`);
    if (isUser) userFound = true;
  });
  
  console.log(`\n   Recent Messages (${conversation.messages.length}):`);
  conversation.messages.forEach(msg => {
    console.log(`   - ${msg.sender.name}: "${msg.content}"`);
  });
  
  if (userFound) {
    console.log(`\n✅ SUCCESS: User ${userId} is a participant in the group chat!`);
    return true;
  } else {
    console.log(`\n❌ FAILURE: User ${userId} is NOT a participant in the group chat!`);
    return false;
  }
}

async function testJoinAndVerify() {
  const sessionId = 16;
  const testCredentials = {
    email: 'student2@edumate.com', // Using student2 for a fresh test
    password: 'StudentPass123!'
  };
  
  try {
    console.log('=== Join Session and Group Chat Verification ===');
    
    // Step 1: Login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', testCredentials);
    const token = loginResponse.data.token;
    
    // Decode the JWT to get user ID (simple base64 decode)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = payload.userId;
    
    // Get user info from database
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });
    
    console.log(`✅ Logged in as: ${userInfo.name} (ID: ${userInfo.id})`);
    
    // Step 2: Check group chat BEFORE joining
    console.log('\nStep 2: Checking group chat BEFORE joining session...');
    const beforeJoin = await checkGroupChatParticipants(sessionId, userInfo.id);
    
    // Step 3: Join the session
    console.log('\nStep 3: Joining session...');
    const joinResponse = await axios.post(
      `http://localhost:3000/sessions/${sessionId}/join`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (joinResponse.status === 200) {
      console.log('✅ Successfully joined session');
    } else {
      console.log(`❌ Failed to join session: ${joinResponse.status}`);
      return;
    }
    
    // Step 4: Check group chat AFTER joining
    console.log('\nStep 4: Checking group chat AFTER joining session...');
    const afterJoin = await checkGroupChatParticipants(sessionId, userInfo.id);
    
    // Step 5: Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Session ID: ${sessionId}`);
    console.log(`User: ${userInfo.name} (ID: ${userInfo.id})`);
    console.log(`Before Join - In Group Chat: ${beforeJoin ? 'YES' : 'NO'}`);
    console.log(`After Join - In Group Chat: ${afterJoin ? 'YES' : 'NO'}`);
    
    if (!beforeJoin && afterJoin) {
      console.log('✅ SUCCESS: User was added to group chat after joining session!');
    } else if (beforeJoin && afterJoin) {
      console.log('ℹ️ INFO: User was already in group chat (likely already joined before)');
    } else if (!beforeJoin && !afterJoin) {
      console.log('❌ FAILURE: User was NOT added to group chat after joining session!');
    }
    
  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testJoinAndVerify().catch(console.error);