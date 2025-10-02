import { useState, useEffect } from "react";
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
import { Plus, X } from "lucide-react";

export default function SessionManagement() {
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
      <Card className="bg-card text-card-foreground border border-border shadow-lg rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold">Session Management</CardTitle>
          <CardDescription className="text-sm text-foreground/70">
            Manage and create tutoring sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList className="bg-accent/20 rounded-md border border-border p-1 flex space-x-2">
              <TabsTrigger
                value="list"
                className="px-4 py-2 text-foreground font-medium rounded-md hover:bg-accent/40"
              >
                Active Sessions
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="px-4 py-2 text-foreground font-medium rounded-md hover:bg-accent/40"
              >
                Create Session
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {sessions.length ? (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-1">
                      <h3 className="font-bold text-foreground">{s.title}</h3>
                      <p className="text-sm text-foreground/80">{s.description}</p>
                      <p className="text-xs text-foreground/50">
                        {s.date} · {s.enrolled}/{s.capacity} students
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center px-3 py-1"
                      onClick={() => removeSession(s.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-foreground/60">No active sessions.</p>
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <Label className="text-foreground font-medium">Title</Label>
                  <Input
                    value={newSession.title}
                    className="bg-input-background text-foreground border border-border rounded-md px-3 py-2 w-full"
                    onChange={(e) =>
                      setNewSession({ ...newSession, title: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <Label className="text-foreground font-medium">Description</Label>
                  <Textarea
                    value={newSession.description}
                    className="bg-input-background text-foreground border border-border rounded-md px-3 py-2 w-full"
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <Label className="text-foreground font-medium">Date</Label>
                    <Input
                      type="date"
                      value={newSession.date}
                      className="bg-input-background text-foreground border border-border rounded-md px-3 py-2 w-full"
                      onChange={(e) =>
                        setNewSession({ ...newSession, date: e.target.value })
                      }
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
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 w-full flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Session
                </Button>
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
