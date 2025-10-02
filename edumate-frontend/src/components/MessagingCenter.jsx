import React, { useState, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, UserCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { AvatarMedium, AvatarSmall } from './ui/Avatar';
import conversationsService from '../services/conversations/conversations';
import exampleImage from 'figma:asset/3f73a89fe600cb19cfbcaaba7f20fc15f0f9368d.png';



const getUserTypeColor = (userType) => {
  switch (userType) {
    case 'teacher':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'admin':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
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
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await conversationsService.getConversations();
        if (response.success) {
          setConversations(response.data || []);
          // Auto-select first conversation if available
          if (response.data && response.data.length > 0) {
            setSelectedConversation(response.data[0].id);
          }
        } else {
          setError(response.error || 'Failed to load conversations');
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) {
        setMessages([]);
        setCurrentConversation(null);
        return;
      }

      try {
        setMessagesLoading(true);
        
        const [conversationResponse, messagesResponse] = await Promise.all([
          conversationsService.getConversation(selectedConversation),
          conversationsService.getMessages(selectedConversation)
        ]);
        
        if (conversationResponse.success) {
          setCurrentConversation(conversationResponse.data);
        }
        
        if (messagesResponse.success) {
          setMessages(messagesResponse.data || []);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      const response = await conversationsService.sendMessage(selectedConversation, newMessage.trim());
      if (response.success) {
        // Add the new message to the messages list
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
      } else {
        console.error('Failed to send message:', response.error);
        alert('Failed to send message: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background transition-colors duration-200">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-card border-r border-border flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <img src={exampleImage} alt="EduMate" className="w-8 h-8" />
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-xs text-muted-foreground">Loading conversations...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <UserCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <AvatarMedium
                        userId={conversation.userId}
                        userName={conversation.name}
                        userType={conversation.userType}
                        size={48}
                        showOnlineStatus={true}
                        isOnline={conversation.isOnline}
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="truncate font-medium text-foreground">{conversation.name}</h3>
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm text-muted-foreground">{conversation.lastMessage}</p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="text-xs bg-primary text-primary-foreground">
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
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border bg-card p-4 transition-colors duration-200">
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
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-foreground">{currentConversation.name}</h2>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getUserTypeColor(currentConversation.userType)}`}
                    >
                      {getUserTypeBadge(currentConversation.userType)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
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
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-xs text-muted-foreground">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-lg px-4 py-2 transition-colors duration-200 ${
                            message.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'
                          }`}
                        >
                          <p className={`text-sm ${message.isOwn ? '' : 'text-foreground'}`}>{message.content}</p>
                        </div>
                        <div
                          className={`mt-1 text-xs text-muted-foreground ${
                            message.isOwn ? 'text-right' : 'text-left'
                          }`}
                        >
                          {message.timestamp}
                        </div>
                      </div>

                      {!message.isOwn && (
                        <Avatar className="order-1 mr-2 h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {message.sender
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border bg-card p-4 transition-colors duration-200">
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
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!newMessage.trim() || sendingMessage || !selectedConversation}
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-background">
            <div className="text-center">
              <UserCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
