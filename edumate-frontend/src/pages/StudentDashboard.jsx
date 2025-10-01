// Dashboard.jsx
import { useState, useEffect } from "react";
import sessionService from "../services/sessions/session";
import React from "react";
import { GaugeCircle, Book, Calendar, Users, Star, MessageSquare, Settings, AlertTriangle, CircleCheck, PlayCircle } from "lucide-react"; // ICONS

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await sessionService.getSessions();
        
        if (response.success && response.data) {
          setSessions(response.data);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setSessions([]);
      }
    };

    fetchSessions();
    console.log(sessions);
  }, []);


  return (
    <div className="flex h-screen bg-[#F0F2F5] text-gray-900">
     
      {/* Sidebar */}
      <aside className="w-64 bg-[#6A0DAD] text-white flex flex-col p-4 shadow-lg">
        <div className="flex items-center justify-between p-2">
          <div className="font-bold text-xl">EduMate</div>
        </div>

        {/* User Info */}
        <div className="p-4 flex items-center mb-4 border-b border-[#8A2BE2] pb-6">
          <div className="bg-[#8A2BE2] rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-lg mr-3">
          </div>
          <div>
            <div className="text-sm font-semibold">Student</div>
            <div className="text-xs text-gray-300">42351673</div>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 space-y-2 text-sm">
          <a href="#" className="flex items-center p-3 rounded-md bg-[#8A2BE2] hover:bg-[#8A2BE2] transition-colors duration-200 font-semibold">
            <GaugeCircle className="mr-3" size={18} />
            Dashboard
          </a>
          <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#8A2BE2] transition-colors duration-200">
            <Book className="mr-3" size={18} />
            Browse Sessions
          </a>
          <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#8A2BE2] transition-colors duration-200">
            <Calendar className="mr-3" size={18} />
            My Sessions
          </a>
          <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#8A2BE2] transition-colors duration-200">
            <Users className="mr-3" size={18} />
            My Tutors
          </a>
          <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#8A2BE2] transition-colors duration-200">
            <Star className="mr-3" size={18} />
            Progress
          </a>
          <a href="#" className="flex items-center p-3 rounded-md hover:bg-[#8A2BE2] transition-colors duration-200">
            <MessageSquare className="mr-3" size={18} />
            Session History
          </a>
        </nav>

        <div className="p-4 text-sm text-gray-400 mt-auto">
          <a href="#" className="flex items-center hover:text-gray-200 transition-colors duration-200">
            <Settings className="mr-3" size={18} />
            Settings
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#F0F2F5] p-8 overflow-auto">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, <span className="text-purple-600">Student!</span>
          </h1>
          <p className="text-gray-600">Here's what's happening with your tutoring sessions today.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <h2 className="text-sm text-gray-500 font-medium">Active Tutors</h2>
              <p className="text-3xl font-bold mt-1">4</p>
              <p className="text-xs text-gray-400">Access 4 modules</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
                <Users size={20} className="text-green-500"/>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <h2 className="text-sm text-gray-500 font-medium">Sessions This Month</h2>
              <p className="text-3xl font-bold mt-1">23</p>
              <p className="text-xs text-gray-400">+3 from last month</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
                <Calendar size={20} className="text-blue-500"/>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <h2 className="text-sm text-gray-500 font-medium">Upcoming Sessions</h2>
              <p className="text-3xl font-bold mt-1">2</p>
              <p className="text-xs text-gray-400">This week</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
                <AlertTriangle size={20} className="text-purple-500"/>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <h2 className="text-sm text-gray-500 font-medium">Avg. Session Rating</h2>
              <p className="text-3xl font-bold mt-1">4.8</p>
              <p className="text-xs text-gray-400">Out of 5 stars</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-full">
                <Star size={20} className="text-yellow-500"/>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Sessions</h2>
            {sessions.length > 0 && (
                  <div className="sessions-list">
                    {sessions.map(session => (
                      <div key={session.id} >
                        <div className="border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between">
                            <div className="flex items-start">
                              <div className="bg-[#6A0DAD] rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-lg mr-4 flex-shrink-0">
                                {session.tutor.name.split(' ').map((word) => word.charAt(0)).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{session.module.name}</p>
                                <p className="text-sm text-gray-500">with {session.tutor.name}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                  <Calendar size={12} className="mr-1"/>
                                  <span className="mr-2 font-medium">{session.startTime}</span>
                                  <span className="bg-purple-100 text-[#6A0DAD] px-2 py-1 rounded-full text-xs font-medium">{session.module.code}</span>
                                </div>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-[#6A0DAD] text-white rounded-lg hover:bg-purple-800 transition-colors">Join</button>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
          </div>

          {/* Progress with Tutors */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Progress with Tutors</h2>
            {[
              { name: "Sarah Johnson", subject: "MATH 101", progress: 85, sessions: 8, rating: 4.9, initials: "SJ" },
              { name: "Michael Chen", subject: "CS 201", progress: 70, sessions: 6, rating: 4.8, initials: "MC" },
              { name: "Emily Rodriguez", subject: "CHEM 201", progress: 78, sessions: 8, rating: 4.7, initials: "ER" },
              { name: "David Kim", subject: "PHYS 102", progress: 65, sessions: 4, rating: 4.6, initials: "DK" },
            ].map((tutor, i) => (
              <div key={i} className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#6A0DAD]"></div>
                    <span className="font-medium text-gray-700">{tutor.name}</span>
                    <span className="text-gray-500 text-xs">· {tutor.sessions} sessions</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <span>{tutor.rating}</span>
                    <Star size={14} className="ml-1 text-yellow-400 fill-current"/>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#6A0DAD] h-2 rounded-full"
                    style={{ width: `${tutor.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span><span className="font-semibold text-gray-700">Attended</span> Calculus I - Derivatives with Sarah Johnson</span>
              </div>
              <span className="text-gray-500 text-xs">2 hours ago</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span><span className="font-semibold text-gray-700">Booked</span> Physics II - Kinematics with David Kim</span>
              </div>
              <span className="text-gray-500 text-xs">1 day ago</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span><span className="font-semibold text-gray-700">Completed</span> Chemistry Session Review with Emily Rodriguez</span>
              </div>
              <span className="text-gray-500 text-xs">2 days ago</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}