# Messaging Functionality Test Plan

## What Has Been Fixed

### 1. Backend Conversation Query Logic
- ✅ **Enhanced conversation query** in `src/services/socketService.ts` (lines 232-264)
- ✅ **Added validation** to ensure exactly 2 participants match sender/recipient
- ✅ **Fixed participant filtering** using proper `some` conditions with additional validation

### 2. Frontend Authentication Issues
- ✅ **Added authentication header** to modules service (`edumate-frontend/src/services/modules/modules.ts`)
- ✅ **Consistent auth pattern** across all frontend services

### 3. API Endpoints Enhanced
- ✅ **Added createConversation endpoint** (`POST /conversations`) for starting conversations
- ✅ **Improved conversation controller** with proper participant validation
- ✅ **Socket.IO service** with enhanced message saving logic

## Test Cases to Verify

### 1. Basic Messaging Flow
**Test**: Student sends message to tutor via Socket.IO
```javascript
// Frontend should call:
socketService.sendMessage({
  recipientId: tutorId,
  content: "Hello, I need help with programming",
  messageType: "text"
})
```

**Expected**:
- Message saved in database with proper conversation creation
- Real-time delivery to tutor if online
- Conversation appears in both users' conversation lists

### 2. Conversation Creation
**Test**: REST API conversation creation
```bash
curl -X POST http://localhost:3000/conversations \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{"participantId": <tutor_id>}'
```

**Expected**:
- Creates new conversation with exactly 2 participants
- Returns conversation details
- Idempotent (returns existing conversation if already exists)

### 3. Message History
**Test**: Fetch conversation messages
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/conversations/<conversation_id>/messages
```

**Expected**:
- Returns messages in chronological order
- Proper sender/recipient information
- Correct read status

## How to Test

### Setup
1. ✅ Backend server running on port 3000
2. ✅ Frontend running on port 5173
3. ✅ PostgreSQL database running

### Test Sequence
1. **Login as student** in one browser
2. **Login as tutor** in another browser/incognito
3. **Student**: Navigate to messaging/chat interface
4. **Student**: Send message to tutor
5. **Tutor**: Check if message appears in real-time
6. **Tutor**: Reply to student
7. **Student**: Verify reply received

### Debugging Commands
```bash
# Check backend logs for Socket.IO connections
tail -f server.log

# Check database for conversations
psql -d edumate -c "SELECT * FROM \"Conversation\";"
psql -d edumate -c "SELECT * FROM \"ConversationParticipant\";"
psql -d edumate -c "SELECT * FROM \"ConversationMessage\";"

# Test REST endpoints
curl -H "Authorization: Bearer <token>" http://localhost:3000/conversations
```

## Key Files Modified

### Backend
- `src/services/socketService.ts` - Enhanced conversation query logic
- `src/controllers/conversations.controller.ts` - Added createConversation endpoint
- `src/routes/conversations.ts` - Added POST route for conversation creation

### Frontend
- `edumate-frontend/src/services/modules/modules.ts` - Added authentication header

## Potential Issues to Watch For

1. **Socket.IO Authentication**: Ensure frontend sends proper JWT token
2. **CORS**: Backend allows requests from localhost:5173
3. **Database Schema**: Conversation/ConversationParticipant/ConversationMessage tables exist
4. **User Roles**: Student-tutor messaging restrictions work correctly
5. **Real-time Updates**: Messages appear instantly for online users

## Success Criteria
- ✅ Students can send messages to tutors
- ✅ Tutors can reply to students  
- ✅ Messages persist in database
- ✅ Real-time delivery works
- ✅ Conversation list shows active chats
- ✅ No duplicate conversations created
- ✅ Authentication works for all endpoints