import { Outlet } from "react-router-dom";
import TutorNavigation from "./TutorNavigation";

export default function TutorLayout() {
  return (
    <div className="flex h-screen bg-background/90 text-foreground">
      <TutorNavigation />
      <main className="flex-1 md:ml-64 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
