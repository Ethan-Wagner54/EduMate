import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Award } from "lucide-react";

export function TutorProfile({ tutorData }) {
  if (!tutorData) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tutorData.name}</CardTitle>
          <CardDescription>{tutorData.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-bold">Modules</h4>
            <ul>
              {tutorData.modules.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold">Achievements</h4>
            <ul>
              {tutorData.achievements.map((a, i) => (
                <li key={i}>
                  <Award className="inline mr-2" /> {a.title} ({a.date})
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold">Qualifications</h4>
            <ul>
              {tutorData.qualifications.map((q, i) => (
                <li key={i}>
                  {q.degree} - {q.institution} ({q.year})
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
