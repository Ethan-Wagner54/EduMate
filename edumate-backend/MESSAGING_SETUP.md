# EduMate Messaging Feature Setup Guide

This guide contains step-by-step instructions to enable the real-time messaging features in your EduMate backend.

## Overview

The messaging system includes:
- Real-time WebSocket communication using Socket.IO
- Complete REST API for message operations
- File attachment support
- Message search functionality
- Conversation management
- Online user tracking
- Message read receipts and typing indicators

## Prerequisites

Before enabling messaging, install the required dependencies:

```bash
npm install socket.io multer express-validator
npm install @types/multer --save-dev
```

## Step-by-Step Setup

### 1. Database Schema Updates

Add messaging models to your Prisma schema:

1. Open `prisma/schema.prisma`
2. Copy the models from `src/config/messaging-schema.prisma` and add them to your schema
3. Add the message relations to your existing User model
4. Run the migration:
   ```bash
   npx prisma migrate dev --name add-messaging
   npx prisma generate
   ```

### 2. Enable Socket.IO Service

1. Open `src/services/socketService.js`
2. Uncomment all the code in the file (remove the `/*` and `*/` blocks)
3. Remove the TODO export at the bottom

### 3. Enable Message API Routes

1. Open `src/routes/messageRoutes.js`
2. Uncomment all the code in the file
3. Remove the TODO export at the bottom

### 4. Update Server Configuration

1. Open `src/server.ts`
2. Uncomment the Socket.IO integration block:
   ```typescript
   import { createServer } from 'http';
   import socketService from './services/socketService';
   
   const server = createServer(app);
   socketService.initialize(server);
   
   server.listen(env.PORT, () => {
     logger.info("server_listen", { port: env.PORT, socketIO: true });
     console.log(`Server with Socket.IO is listening on port ${env.PORT}`);
   });
   ```
3. Comment out or remove the original `app.listen()` call

### 5. Update App Routes

1. Open `src/app.ts`
2. Uncomment the messaging route imports:
   ```typescript
   import messageApiRoutes from "./routes/messageRoutes";
   ```
3. Uncomment the messaging route:
   ```typescript
   app.use("/api/messaging", messageApiRoutes);
   ```

### 6. Create Upload Directory

Create the directory for file uploads:
```bash
mkdir -p uploads/messages
```

### 7. Environment Variables

Add these optional environment variables to your `.env` file:
```
FRONTEND_URL=http://localhost:5174
MAX_FILE_SIZE=10485760
```

## API Endpoints

Once enabled, the following endpoints will be available:

### Conversations
- `GET /api/messaging/conversations` - Get user's conversations
- `GET /api/messaging/conversations/:id/messages` - Get messages in a conversation

### Messages
- `POST /api/messaging/messages/send` - Send a new message
- `PATCH /api/messaging/messages/read` - Mark messages as read
- `DELETE /api/messaging/messages/:id` - Delete a message
- `GET /api/messaging/messages/search` - Search messages

### Files
- `POST /api/messaging/messages/upload` - Upload file attachment

### Users
- `GET /api/messaging/users/online` - Get online users

## Frontend Integration

Your frontend WebSocket service is already configured to work with these endpoints. The service will automatically connect to the Socket.IO server once enabled.

## Testing

After enabling the messaging features:

1. Start your backend server
2. Check the console for "Socket.IO initialized" message
3. Test the API endpoints using your frontend or a tool like Postman
4. Verify real-time messaging works between different browser windows

## Security Considerations

- File uploads are limited to 10MB by default
- Only authenticated users can access messaging endpoints
- Users can only delete their own messages
- File types are restricted to safe formats
- All Socket.IO connections are authenticated using JWT tokens

## Troubleshooting

### Common Issues:

1. **Socket.IO connection fails**: Check that your frontend URL is correctly set in CORS configuration
2. **File uploads fail**: Ensure the `uploads/messages` directory exists and has write permissions
3. **Database errors**: Make sure you've run the Prisma migrations
4. **Authentication errors**: Verify that your JWT middleware is working correctly

### Logs to Check:
- Socket.IO connection/disconnection logs
- Database query logs
- File upload logs
- Authentication logs

## Future Enhancements

The current implementation provides a solid foundation. Future enhancements could include:

- Message encryption
- Voice/video calling
- Message reactions/emojis
- Group chat functionality
- Message forwarding
- Advanced search with filters
- Message scheduling
- Push notifications

## Support

If you encounter any issues during setup, check:
1. Console logs in both frontend and backend
2. Network tab in browser developer tools
3. Database connection status
4. File permissions in upload directory

All messaging features are designed to be backward-compatible and won't affect your existing functionality when properly enabled.