# EduMate Messaging System - Testing Guide

## Overview
This guide explains how to test the complete real-time messaging functionality in the EduMate application, including both private conversations and group chats.

## System Architecture

### Backend Components
- **WebSocket Server**: Socket.IO integration with JWT authentication
- **Message Controllers**: Handle REST API endpoints for messaging
- **Database Models**: Conversation, ConversationParticipant, ConversationMessage
- **Real-time Events**: Live message broadcasting and typing indicators

### Frontend Components
- **UnifiedMessaging Component**: Main messaging interface
- **Socket Service**: WebSocket client integration
- **Message Services**: API calls for conversation management

## Test Data Summary

The seed script has created comprehensive test data:

### Users Created
- **1 Admin**: `admin@edumate.com` / `AdminPass123!`
- **5 Tutors**: `tutor1@edumate.com` to `tutor5@edumate.com` / `TutorPass123!`
- **5 Students**: `student1@edumate.com` to `student5@edumate.com` / `StudentPass123!`

### Messaging Test Data
- **4 Session-Based Group Chats**: Linked to specific tutoring sessions
- **3 General Study Groups**: Subject-specific discussion groups
- **5 Direct Conversations**: Private tutor-student conversations
- **60+ Sample Messages**: Pre-populated across all conversation types

## Testing Scenarios

### 1. User Authentication and Socket Connection

**Test Steps:**
1. Open frontend application
2. Login with any test account (e.g., `student1@edumate.com` / `StudentPass123!`)
3. Check browser console for socket connection logs
4. Verify green "Connected" indicator in messaging interface

**Expected Results:**
- Console shows: "Socket connected: [socket-id]"
- WebSocket connection established with JWT authentication
- Real-time connection status displayed in UI

### 2. Private Messaging (Direct Conversations)

**Test Accounts for Private Messaging:**
- John Smith (`student1@edumate.com`) ↔ Dr. Sarah Mitchell (`tutor1@edumate.com`)
- Alice Johnson (`student2@edumate.com`) ↔ Dr. Emma Thompson (`tutor3@edumate.com`)
- Mohammed Al-Hassan (`student3@edumate.com`) ↔ Mr. David Rodriguez (`tutor4@edumate.com`)

**Test Steps:**
1. Login as `student1@edumate.com`
2. Navigate to Messages → Private tab
3. Select conversation with Dr. Sarah Mitchell
4. Observe existing message history
5. Send a new message: "Hello, this is a test message"
6. **In a separate browser/incognito window:**
   - Login as `tutor1@edumate.com`
   - Navigate to Messages
   - Verify real-time message receipt
7. Reply from tutor account
8. Verify real-time delivery to student

**Expected Results:**
- Messages appear instantly without page refresh
- Message timestamps show correctly
- Unread counts update properly
- Typing indicators work (if implemented)

### 3. Group Messaging (Session Chats)

**Test Group: CMPG-321 - Software Engineering Session Chat**
- Participants: Dr. Sarah Mitchell (tutor) + 3 students

**Test Steps:**
1. Login as `student1@edumate.com`
2. Navigate to Messages → Groups tab
3. Select "CMPG-321 - Software Engineering Session Chat"
4. Review existing group conversation
5. Send message: "Quick question about the assignment"
6. **In separate browser windows, login as:**
   - `tutor1@edumate.com` (Dr. Sarah Mitchell)
   - `student3@edumate.com` (Mohammed Al-Hassan)
7. Verify message appears in real-time for all participants
8. Send replies from different accounts
9. Test message ordering and timestamps

**Expected Results:**
- All participants receive messages instantly
- Sender names and roles display correctly
- Crown icon appears for tutor messages
- Participant count shows accurately

### 4. General Study Groups

**Test Group: "Computer Science Study Group"**
- Participants: Dr. Sarah Mitchell, John Smith, Mohammed Al-Hassan

**Test Steps:**
1. Login as different participants in separate browsers
2. Join the "Computer Science Study Group"
3. Have a multi-participant conversation
4. Test message delivery to all members
5. Verify unread counts and last message updates

### 5. Real-time Features Testing

**WebSocket Events to Test:**
- `join-group-chat`: Joining group chat rooms
- `leave-group-chat`: Leaving group chat rooms
- `send-group-message`: Sending group messages
- `new-group-message`: Receiving group messages
- `send-message`: Sending direct messages
- `new-message`: Receiving direct messages

**Test Connection Resilience:**
1. Send messages while connected
2. Disconnect internet briefly
3. Reconnect and verify message synchronization
4. Test reconnection attempts

### 6. UI/UX Testing

**Message Interface Features:**
- Conversation list with last messages and timestamps
- Online status indicators
- Unread message counters
- Message search functionality
- Mobile responsive design
- Dark/light theme compatibility

**Test Different Screen Sizes:**
- Desktop (1920x1080)
- Tablet (768px width)
- Mobile (375px width)

## API Endpoints Testing

### Group Chat Endpoints (Base: `/group-chats`)
```bash
# Get all group chats
GET /group-chats/groups

# Get group chat messages
GET /group-chats/{conversationId}/messages

# Send group message
POST /group-chats/{conversationId}/messages
{
  "content": "Test message",
  "messageType": "text"
}

# Mark messages as read
POST /group-chats/{conversationId}/mark-read
{
  "messageIds": [1, 2, 3]
}
```

### Private Conversation Endpoints (Base: `/conversations`)
```bash
# Get all conversations
GET /conversations

# Get conversation messages
GET /conversations/{conversationId}/messages

# Send private message
POST /conversations/{conversationId}/messages
{
  "content": "Test private message"
}

# Create new conversation
POST /conversations
{
  "participantId": 2
}
```

## Database Verification

### Check Message Storage
```sql
-- Count messages by conversation type
SELECT 
  c.type,
  COUNT(cm.id) as message_count
FROM conversation c
LEFT JOIN conversation_message cm ON c.id = cm.conversation_id
GROUP BY c.type;

-- Recent messages
SELECT 
  c.name,
  u.name as sender,
  cm.content,
  cm.sent_at
FROM conversation_message cm
JOIN conversation c ON cm.conversation_id = c.id
JOIN user u ON cm.sender_id = u.id
ORDER BY cm.sent_at DESC
LIMIT 10;
```

### Verify Group Participants
```sql
-- Group chat participants
SELECT 
  c.name as conversation_name,
  u.name as participant_name,
  u.role,
  cp.unread_count
FROM conversation c
JOIN conversation_participant cp ON c.id = cp.conversation_id
JOIN user u ON cp.user_id = u.id
WHERE c.is_group = true
ORDER BY c.name, u.name;
```

## Troubleshooting

### Common Issues

**1. Socket Connection Fails**
- Check JWT token validity
- Verify backend server is running on correct port
- Check CORS configuration
- Review browser console for authentication errors

**2. Messages Not Appearing in Real-time**
- Verify socket connection status
- Check if users are in correct rooms
- Review backend logs for socket events
- Test with browser refresh

**3. Database Issues**
- Run `npx prisma db push` to sync schema
- Run `npx prisma db seed` to reset test data
- Check PostgreSQL connection

**4. Frontend API Errors**
- Verify API base URL in config
- Check authentication headers
- Review network tab in developer tools

### Debug Commands

```bash
# Backend
npm run dev  # Start development server with hot reload

# Database
npx prisma studio  # Open database browser
npx prisma db seed  # Reset test data

# Frontend (in frontend directory)
npm run dev  # Start frontend development server
```

## Performance Testing

### Message Load Testing
1. Send 50+ messages rapidly
2. Verify UI remains responsive
3. Check memory usage in browser
4. Test with multiple conversations open

### Concurrent Users
1. Open 5+ browser windows with different users
2. Have simultaneous conversations
3. Monitor server performance
4. Check for message delivery issues

## Security Testing

### Authentication
- Test with expired JWT tokens
- Verify unauthorized users cannot access conversations
- Check message privacy between different user pairs

### Data Validation
- Send empty messages (should be rejected)
- Test with very long messages
- Verify SQL injection protection

## Success Criteria

✅ **Real-time Messaging Works**
- Messages appear instantly across all connected clients
- No page refresh required for new messages

✅ **Group Chats Function Properly**
- Multiple participants can chat simultaneously
- Messages delivered to all group members

✅ **Private Conversations Work**
- One-on-one messaging between tutors and students
- Message privacy maintained

✅ **UI is Responsive and Intuitive**
- Clean, modern interface
- Works on mobile and desktop
- Loading states and error handling

✅ **Database Consistency**
- Messages stored correctly
- Conversation states maintained
- Unread counts accurate

## Next Steps

After successful testing:
1. Session creation and joining functionality
2. Automatic group chat creation when students join sessions  
3. File/image sharing in messages
4. Message editing and deletion
5. Push notifications for mobile
6. Message encryption for enhanced security

---

**Note**: This messaging system is now fully functional with real-time capabilities. The seed data provides comprehensive test scenarios covering all major use cases for tutoring platform messaging.