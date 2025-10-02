import React, { useState } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, UserCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import exampleImage from 'figma:asset/3f73a89fe600cb19cfbcaaba7f20fc15f0f9368d.png';


const mockConversations = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    lastMessage: "Don't forget about tomorrow's assignment deadline",
    timestamp: '2m ago',
    unreadCount: 2,
    isOnline: true,
    userType: 'teacher'
  },
  {
    id: '2',
    name: 'Study Group - Math 101',
    lastMessage: 'Anyone free for study session tonight?',
    timestamp: '15m ago',
    unreadCount: 5,
    isOnline: false,
    userType: 'student'
  },
  {
    id: '3',
    name: 'Academic Advisor',
    lastMessage: 'Your course registration is approved',
    timestamp: '1h ago',
    unreadCount: 0,
    isOnline: true,
    userType: 'admin'
  },
  {
    id: '4',
    name: 'Alex Chen',
    lastMessage: 'Thanks for the notes!',
    timestamp: '2h ago',
    unreadCount: 0,
    isOnline: false,
    userType: 'student'
  },
  {
    id: '5',
    name: 'Prof. Williams',
    lastMessage: 'Great work on your presentation',
    timestamp: '1d ago',
    unreadCount: 1,
    isOnline: false,
    userType: 'teacher'
  }
];

const mockMessages = [
  {
    id: '1',
    sender: 'Dr. Sarah Johnson',
    content: 'Hi everyone! Just a reminder that your research paper is due tomorrow at 11:59 PM.',
    timestamp: '10:30 AM',
    isOwn: false
  },
  {
    id: '2',
    sender: 'You',
    content: 'Thank you for the reminder, Dr. Johnson. I have a quick question about the citation format.',
    timestamp: '10:35 AM',
    isOwn: true
  },
  {
    id: '3',
    sender: 'Dr. Sarah Johnson',
    content: 'Of course! Please use APA format as mentioned in the syllabus. Let me know if you need any clarification.',
    timestamp: '10:37 AM',
    isOwn: false
  },
  {
    id: '4',
    sender: 'You',
    content: "Perfect, that's what I was using. Just wanted to double-check. Thank you!",
    timestamp: '10:40 AM',
    isOwn: true
  },
  {
    id: '5',
    sender: 'Dr. Sarah Johnson',
    content: "Don't forget about tomorrow's assignment deadline",
    timestamp: '11:15 AM',
    isOwn: false
  }
];

const getUserTypeColor = (userType) => {
  switch (userType) {
    case 'teacher':
      return 'bg-purple-100 text-purple-700';
    case 'admin':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-green-100 text-green-700';
  }
};

const getUserTypeBadge = (userType) => {
  switch (userType) {
    case 'teacher':
      return 'Teacher';
    case 'admin':
      return 'Admin';
    default:
      return 'Student';
  }
};

export function MessagingCenter() {
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = mockConversations.find((conv) => conv.id === selectedConversation);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <img src={exampleImage} alt="EduMate" className="w-8 h-8" />
            <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation === conversation.id
                    ? 'bg-purple-50 border-l-4 border-purple-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={getUserTypeColor(conversation.userType)}>
                        {conversation.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="truncate font-medium text-gray-900">{conversation.name}</h3>
                      <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm text-gray-600">{conversation.lastMessage}</p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="text-xs bg-purple-500 text-white">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getUserTypeColor(conversation.userType)}`}
                      >
                        {getUserTypeBadge(conversation.userType)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={getUserTypeColor(currentConversation.userType)}>
                      {currentConversation.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {currentConversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">{currentConversation.name}</h2>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getUserTypeColor(currentConversation.userType)}`}
                    >
                      {getUserTypeBadge(currentConversation.userType)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {currentConversation.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.isOwn ? 'bg-purple-500 text-white' : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div
                        className={`mt-1 text-xs text-gray-500 ${
                          message.isOwn ? 'text-right' : 'text-left'
                        }`}
                      >
                        {message.timestamp}
                      </div>
                    </div>

                    {!message.isOwn && (
                      <Avatar className="order-1 mr-2 h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                          {message.sender
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button variant="ghost" size="sm" type="button">
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />

                <Button
                  type="submit"
                  className="bg-purple-500 text-white hover:bg-purple-600"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <UserCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
