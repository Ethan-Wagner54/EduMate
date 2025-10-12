import { useState, useEffect } from "react";
import sessionService from "../../services/sessions/session";
import moduleService from "../../services/modules/modules";
import authService from "../../services/auth/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Plus, X, Play, Pause, Users, Video } from "lucide-react";

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSession, setNewSession] = useState({
    moduleId: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: 10,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get current user's ID for filtering tutor's sessions
      const userId = authService.getUserId();
      
      // Fetch sessions and modules simultaneously
      const [sessionResponse, moduleResponse] = await Promise.all([
        userId ? sessionService.getSessions({ tutorId: userId }) : sessionService.getSessions(),
        moduleService.getModules()
      ]);
      
      if (sessionResponse.success) {
        setSessions(sessionResponse.data || []);
      } else {
        showNotification('Failed to load sessions', 'error');
      }
      
      if (moduleResponse.success) {
        setModules(moduleResponse.data || []);
      } else {
        showNotification('Failed to load modules', 'error');
      }
    } catch (error) {
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    // Simple notification implementation - in a real app you'd use a toast library
    const style = type === 'error' ? 'color: red;' : type === 'success' ? 'color: green;' : 'color: blue;';
    // For now, still using alert for user feedback
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else if (type === 'success') {
      alert(`Success: ${message}`);
    }
  };

  const addSession = async () => {
    try {
      // Debug logging to see what values we have
      console.log('Session data before validation:', newSession);
      console.log('moduleId:', newSession.moduleId, 'type:', typeof newSession.moduleId);
      console.log('startTime:', newSession.startTime, 'type:', typeof newSession.startTime);
      console.log('endTime:', newSession.endTime, 'type:', typeof newSession.endTime);
      
      // More specific validation with better error messages
      if (!newSession.moduleId || newSession.moduleId === "") {
        console.log('Validation failed: moduleId is empty');
        showNotification('Please select a module', 'error');
        return;
      }
      
      if (!newSession.startTime || newSession.startTime === "") {
        console.log('Validation failed: startTime is empty');
        showNotification('Please select a start time', 'error');
        return;
      }
      
      if (!newSession.endTime || newSession.endTime === "") {
        console.log('Validation failed: endTime is empty');
        showNotification('Please select an end time', 'error');
        return;
      }

      // Validate end time is after start time
      if (new Date(newSession.endTime) <= new Date(newSession.startTime)) {
        showNotification('End time must be after start time', 'error');
        return;
      }
      
      setCreating(true);
      
      const sessionData = {
        moduleId: parseInt(newSession.moduleId),
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        location: newSession.location || undefined,
        capacity: newSession.capacity || undefined,
        status: 'published' // Make session visible to students immediately
      };
      
      const response = await sessionService.createSession(sessionData);
      if (response.success) {
        // Refresh sessions list
        await fetchData();
        // Reset form
        setNewSession({ moduleId: "", startTime: "", endTime: "", location: "", capacity: 10 });
        showNotification('Session created successfully!', 'success');
      } else {
        showNotification(response.error || 'Failed to create session', 'error');
      }
    } catch (error) {
      showNotification('Error creating session', 'error');
    } finally {
      setCreating(false);
    }
  };

  const removeSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const response = await sessionService.deleteSession(id);
      if (response.success) {
        // Remove from local state immediately for better UX
        setSessions(sessions.filter((s) => s.id !== id));
        showNotification('Session deleted successfully', 'success');
      } else {
        showNotification(response.error || 'Failed to delete session', 'error');
      }
    } catch (error) {
      showNotification('Error deleting session', 'error');
    }
  };

  const toggleSessionStatus = async (sessionId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await sessionService.updateSessionStatus(sessionId, newStatus);
      if (response.success) {
        // Update local state
        setSessions(sessions.map(s => 
          s.id === sessionId ? { ...s, status: newStatus } : s
        ));
        showNotification(`Session ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      } else {
        showNotification(response.error || 'Failed to update session status', 'error');
      }
    } catch (error) {
      showNotification('Error updating session status', 'error');
    }
  };

  const joinSession = async (sessionId) => {
    try {
      const response = await sessionService.joinSession(sessionId);
      if (response.success) {
        showNotification('Joined session successfully! Session link has been copied to clipboard.', 'success');
        // In a real app, you might redirect to a video call interface or copy a meeting link
        // For now, we'll just show success
        if (response.data?.meetingLink) {
          // Copy meeting link to clipboard if available
          navigator.clipboard.writeText(response.data.meetingLink);
        }
      } else {
        showNotification(response.error || 'Failed to join session', 'error');
      }
    } catch (error) {
      showNotification('Error joining session', 'error');
    }
  };

  // Filter active sessions based on status and time
  const getActiveSessions = () => {
    const now = new Date();
    return sessions.filter(session => {
      const sessionStart = new Date(session.startTime);
      const sessionEnd = new Date(session.endTime);
      
      // Consider a session "active" if:
      // 1. Status is 'active' or undefined (backward compatibility)
      // 2. Current time is within session window OR session starts within next 24 hours
      const isActiveStatus = !session.status || session.status === 'active';
      const isInTimeWindow = (now >= sessionStart && now <= sessionEnd) || 
                            (sessionStart > now && sessionStart <= new Date(now.getTime() + 24 * 60 * 60 * 1000));
      
      return isActiveStatus && isInTimeWindow;
    });
  };

  // Check if session is currently running
  const isSessionLive = (session) => {
    const now = new Date();
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    return now >= sessionStart && now <= sessionEnd && session.status === 'active';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card text-card-foreground border border-border shadow-lg rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold">Session Management</CardTitle>
          <CardDescription className="text-sm text-foreground/70">
            Manage and create tutoring sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="new" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="list">
                Active Sessions
              </TabsTrigger>
              <TabsTrigger value="new">
                Create Session
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading sessions...</span>
                </div>
              ) : (
                getActiveSessions().length ? (
                  getActiveSessions().map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground">
                          {s.module?.name || 'Unknown Module'} ({s.module?.code})
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          s.status === 'active' ? 'bg-green-100 text-green-800' : 
                          s.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {s.status || 'scheduled'}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 flex items-center gap-1">
                        <span>📍</span>
                        {s.location || 'Location TBD'}
                      </p>
                      <p className="text-xs text-foreground/50 flex items-center gap-2">
                        <span>🕒 {new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}</span>
                        {s.capacity && (
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            <span>Max: {s.capacity}</span>
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSessionLive(s) && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700"
                          onClick={() => joinSession(s.id)}
                        >
                          <Video className="h-4 w-4 mr-1" /> Join
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center px-3 py-1"
                        onClick={() => toggleSessionStatus(s.id, s.status)}
                      >
                        {s.status === 'active' ? (
                          <><Pause className="h-4 w-4 mr-1" /> Pause</>
                        ) : (
                          <><Play className="h-4 w-4 mr-1" /> Start</>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center px-3 py-1"
                        onClick={() => removeSession(s.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-foreground/60">No active sessions.</p>
                    <p className="text-xs text-foreground/40 mt-1">Sessions appear here when they are scheduled for today or are currently running.</p>
                  </div>
                )
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <Label className="text-foreground font-medium">Module *</Label>
                  <select
                    value={newSession.moduleId}
                    className="bg-input-background text-foreground border border-border rounded-md px-3 py-2 w-full"
                    onChange={(e) =>
                      setNewSession({ ...newSession, moduleId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a module...</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.code} - {module.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <Label className="text-foreground font-medium">Location</Label>
                  <Input
                    value={newSession.location}
                    className="bg-input-background text-foreground border border-border rounded-md px-3 py-2 w-full"
                    onChange={(e) =>
                      setNewSession({ ...newSession, location: e.target.value })
                    }
                    placeholder="e.g., Room 101, Library"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <Label className="text-foreground font-medium">Start Time *</Label>
                    <Input
                      type="datetime-local"
                      value={newSession.startTime}
                      className="bg-input-background text-foreground border border-border rounded-md px-3 py-2 w-full"
                      onChange={(e) =>
                        setNewSession({ ...newSession, startTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <Label className="text-foreground font-medium">End Time *</Label>
                    <Input
                      type="datetime-local"
                      value={newSession.endTime}
                      className="bg-input-background text-foreground border border-border rounded-md px-3 py-2 w-full"
                      onChange={(e) =>
                        setNewSession({ ...newSession, endTime: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <Label className="text-foreground font-medium">Capacity</Label>
                    <Input
                      type="number"
                      value={newSession.capacity}
                      className="bg-input-background text-foreground border border-border rounded-md px-3 py-2 w-full"
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          capacity: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={addSession}
                  disabled={creating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 w-full flex items-center justify-center disabled:opacity-50"
                >
                  {creating ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div> Creating...</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" /> Add Session</>
                  )}
                </Button>
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
