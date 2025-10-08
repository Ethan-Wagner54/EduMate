import React, { useState, useEffect } from 'react';
import { MessageSquare, Flag, Trash2, AlertTriangle, Eye, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import adminService from '../../services/admin/adminService';

export default function ChatModeration() {
  const [allChats, setAllChats] = useState([]);
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterChats();
  }, [allChats, searchTerm, filterType]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [allChatsRes, flaggedMessagesRes] = await Promise.all([
        adminService.getAllChats(),
        adminService.getFlaggedMessages()
      ]);

      if (allChatsRes.success) setAllChats(allChatsRes.data || []);
      if (flaggedMessagesRes.success) setFlaggedMessages(flaggedMessagesRes.data || []);
    } catch (err) {
      setError('Failed to fetch chat data');
    } finally {
      setLoading(false);
    }
  };

  const filterChats = () => {
    let filtered = allChats;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        chat.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.receiverName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(chat => chat.type === filterType);
    }

    setFilteredChats(filtered);
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      try {
        const response = await adminService.deleteMessage(messageId);
        if (response.success) {
          fetchData(); // Refresh data
        } else {
          alert('Failed to delete message: ' + response.error);
        }
      } catch (error) {
        alert('Error deleting message');
      }
    }
  };

  const handleFlagMessage = async (messageId) => {
    const reason = prompt('Please provide a reason for flagging this message:');
    if (reason) {
      try {
        const response = await adminService.flagMessage(messageId, reason);
        if (response.success) {
          fetchData(); // Refresh data
        } else {
          alert('Failed to flag message: ' + response.error);
        }
      } catch (error) {
        alert('Error flagging message');
      }
    }
  };

  const handleUnflagMessage = async (messageId) => {
    try {
      const response = await adminService.unflagMessage(messageId);
      if (response.success) {
        fetchData(); // Refresh data
      } else {
        alert('Failed to unflag message: ' + response.error);
      }
    } catch (error) {
      alert('Error unflagging message');
    }
  };

  const handleWarnUser = async (userId, userName) => {
    const reason = prompt(`Provide a warning reason for ${userName}:`);
    if (reason) {
      try {
        const response = await adminService.warnUser(userId, reason);
        if (response.success) {
          alert('Warning sent to user successfully');
        } else {
          alert('Failed to warn user: ' + response.error);
        }
      } catch (error) {
        alert('Error sending warning');
      }
    }
  };

  const MessageCard = ({ message, isFlagged = false }) => {
    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <Card className={`mb-4 hover:shadow-md transition-shadow ${isFlagged ? 'border-red-200 bg-red-50/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isFlagged ? 'bg-red-100' : 'bg-primary/10'}`}>
                  <MessageSquare className={`w-4 h-4 ${isFlagged ? 'text-red-600' : 'text-primary'}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    {message.senderName} → {message.receiverName || 'Group Chat'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
                {isFlagged && message.flagReason && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(message.severity)}`}>
                    {message.flagReason}
                  </span>
                )}
                {message.type === 'group' && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Group
                  </span>
                )}
              </div>
              
              <div className="mb-3 p-3 bg-background border rounded-lg">
                <p className="text-sm">{message.content}</p>
              </div>

              {message.attachments && message.attachments.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="text-xs bg-muted px-2 py-1 rounded">
                      📎 {attachment.name || `Attachment ${index + 1}`}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Chat ID: {message.chatId || 'N/A'}</span>
                <span>Session: {message.sessionId || 'N/A'}</span>
                {message.warningCount > 0 && (
                  <span className="text-orange-600">
                    ⚠️ User has {message.warningCount} warnings
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 ml-4">
              {!isFlagged ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleFlagMessage(message.id)}
                >
                  <Flag className="w-4 h-4 mr-1" />
                  Flag
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleUnflagMessage(message.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Unflag
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleWarnUser(message.senderId, message.senderName)}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Warn User
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleDeleteMessage(message.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Chat Moderation</h1>
          <p className="text-muted-foreground">Monitor conversations and prevent platform abuse</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            All Messages ({allChats.length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged Messages ({flaggedMessages.length})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="mt-6 mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Search Messages</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by content, sender, or receiver..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <label className="text-sm font-medium mb-2 block">Message Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="direct">Direct Messages</SelectItem>
                    <SelectItem value="group">Group Messages</SelectItem>
                    <SelectItem value="session">Session Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                All Messages ({filteredChats.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredChats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {allChats.length === 0 ? 'No messages found' : 'No messages match your filters'}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredChats.map(message => (
                    <MessageCard key={message.id} message={message} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Flagged Messages ({flaggedMessages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No flagged messages</p>
              ) : (
                <div className="space-y-4">
                  {flaggedMessages.map(message => (
                    <MessageCard key={message.id} message={message} isFlagged={true} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{allChats.length}</div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{flaggedMessages.length}</div>
            <div className="text-sm text-muted-foreground">Flagged Messages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {flaggedMessages.filter(m => m.severity === 'high').length}
            </div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(((allChats.length - flaggedMessages.length) / Math.max(allChats.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Clean Messages</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}