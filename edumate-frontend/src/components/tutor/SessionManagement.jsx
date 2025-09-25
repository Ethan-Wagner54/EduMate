import { useState, useEffect  } from "react";
import { fetchJSON } from "../../services/api";
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
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Plus, Save, X } from "lucide-react";

export function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    date: "",
    capacity: 10,
  });

  useEffect(() => {
    fetchJSON("sessions.json").then(setSessions);
  }, []);

  const addSession = () => {
    setSessions([
      ...sessions,
      { ...newSession, id: Date.now(), enrolled: 0, status: "active" },
    ]);
    setNewSession({ title: "", description: "", date: "", capacity: 10 });
  };

  const removeSession = (id) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Manage and create tutoring sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">Active Sessions</TabsTrigger>
              <TabsTrigger value="new">Create Session</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center p-4 border rounded-lg mb-2"
                >
                  <div>
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="text-sm">{s.description}</p>
                    <p className="text-xs text-gray-500">
                      {s.date} · {s.enrolled}/{s.capacity} students
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSession(s.id)}
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="new">
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newSession.title}
                    onChange={(e) =>
                      setNewSession({ ...newSession, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newSession.description}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newSession.date}
                    onChange={(e) =>
                      setNewSession({ ...newSession, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={newSession.capacity}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        capacity: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <Button onClick={addSession}>
                  <Plus className="h-4 w-4 mr-1" /> Add Session
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
