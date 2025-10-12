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
            {tutorData.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {tutorData.phone}
              </div>
            )}
            {tutorData.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {tutorData.location}
              </div>
            )}
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
            {tutorData.modules && tutorData.modules.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tutorData.modules.map((module, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {typeof module === 'string' ? module : `${module.code} - ${module.name}`}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No modules assigned yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            {tutorData.specialties && tutorData.specialties.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tutorData.specialties.map((specialty, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No specialties listed.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Teaching Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tutorData.stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {tutorData.stats.totalSessions || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {tutorData.stats.completedSessions || 0}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {tutorData.stats.averageRating ? tutorData.stats.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {tutorData.stats.upcomingSessions || 0}
                </div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No statistics available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}