import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SessionManagement } from "../components/tutor/SessionManagement";
import { TutorProfile } from "../components/tutor/TutorProfile";
import { Button } from "../components/ui/button";

export default function TutorDashboard() {
  const location = useLocation();
  const userId = location.state?.userId;

  const [tutor, setTutor] = useState(null);

  useEffect(() => {
    if (!userId) return;

    fetch("/tutors.json")
      .then((res) => res.json())
      .then((data) => {
        const matchedTutor = data.find((t) => t.id === userId);
        console.log("Matched tutor:", matchedTutor); // debug
        setTutor(matchedTutor || null);
      })
      .catch((err) => console.error("Failed to load tutor data:", err));
  }, [userId]);

  if (!tutor) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Welcome, {tutor.name}
        </h1>
        <Button variant="secondary" onClick={() => console.log("Logout logic here")}>
          Logout
        </Button>
      </header>

      <TutorProfile tutorData={tutor} />
      <SessionManagement />
    </div>
  );
}
