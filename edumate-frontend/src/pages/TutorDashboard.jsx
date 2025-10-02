import { useState, useEffect } from "react";
import SessionManagement from "../components/tutor/SessionManagement";
import { TutorProfile } from "../components/tutor/TutorProfile";
import { Button } from "../components/ui/button";

export default function TutorDashboard() {
  const userId = 1; // Or get from context/state/router

  const [tutor, setTutor] = useState(null);

  useEffect(() => {
    if (!userId) return;

    fetch("/tutors.json")
      .then((res) => res.json())
      .then((data) => {
        const matchedTutor = data.find((t) => t.id === userId);
        setTutor(matchedTutor || null);
      })
      .catch((err) => console.error("Failed to load tutor data:", err));
  }, [userId]);

  if (!tutor) return <p className="text-foreground">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar is rendered via TutorLayout */}
      <main className="flex-1 p-6 md:p-10 space-y-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {tutor.name}
          </h1>
          <Button
            variant="secondary"
            onClick={() => console.log("Logout logic here")}
          >
            Logout
          </Button>
        </header>

        <section className="space-y-6">
          <TutorProfile tutorData={tutor} />
          <SessionManagement />
        </section>
      </main>
    </div>
  );
}
