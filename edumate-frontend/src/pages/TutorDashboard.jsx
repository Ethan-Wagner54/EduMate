import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SessionManagement } from "../components/tutor/SessionManagement";
import { TutorProfile } from "../components/tutor/TutorProfile";
import { Button } from "../components/ui/button";
import { LuMessageSquareText } from "react-icons/lu"; //for the message icon
import { useNavigate } from "react-router-dom";
import { LuCalendarClock } from "react-icons/lu";

export default function TutorDashboard() {
  const location = useLocation();
  const userId = location.state?.userId;

  const [tutor, setTutor] = useState(null);

  //Initialize navigation for messages
  const navigate = useNavigate();

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

           {/*Message icon and logout button */}
        <div className="flex gap-4 items-center">
          <Button variant="ghost" onClick={() => navigate("/create-session")} className="flex items-center gap-2  text-gray-800 dark:text-gray-100">
            <LuCalendarClock size={20} color = "white" />
            Sessions
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/messages")} //Navigate to messages page
            className="flex items-center gap-2 text-gray-800 dark:text-gray-100"
          >
            <LuMessageSquareText size={22} />
            Messages
          </Button>

          <Button variant="secondary" onClick={() => console.log("Logout logic here")}>
            Logout
          </Button>
        </div>

        {/*<Button variant="secondary" onClick={() => console.log("Logout logic here")}>
          Logout
        </Button>*/}
      </header>

      <TutorProfile tutorData={tutor} />
      <SessionManagement />
    </div>
  );
}
