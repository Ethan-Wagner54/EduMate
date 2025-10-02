import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Award, Phone, MapPin, BookOpen } from "lucide-react";

export function TutorProfile({ tutorData }) {
  if (!tutorData) return <div className="p-8 text-center">Loading tutor profile...</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                {tutorData.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            {tutorData.name}
          </CardTitle>
          <CardDescription className="text-lg">{tutorData.bio}</CardDescription>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {tutorData.phone}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {tutorData.location}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tutorData.modules.map((module, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                >
                  {module}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Qualifications */}
        <Card>
          <CardHeader>
            <CardTitle>Qualifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tutorData.qualifications.map((qualification, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {qualification.degree}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {qualification.institution} • {qualification.year}
                </p>
                <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  {qualification.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tutorData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {achievement.description}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {achievement.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}