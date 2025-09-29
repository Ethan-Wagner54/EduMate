// src/components/DashboardContent.jsx
import React from "react";
import { Users, Calendar, AlertTriangle, Star } from "lucide-react";

export default function DashboardContent() {
  return (
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
          <div className="border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-start">
              <div className="bg-[#6A0DAD] rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-lg mr-4 flex-shrink-0">
                SJ
              </div>
              <div>
                <p className="font-medium text-gray-800">Calculus I - Integration Techniques</p>
                <p className="text-sm text-gray-500">with Sarah Johnson</p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Calendar size={12} className="mr-1"/>
                  <span className="mr-2 font-medium">2:00 PM</span>
                  <span className="bg-purple-100 text-[#6A0DAD] px-2 py-1 rounded-full text-xs font-medium">MATH 101</span>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#6A0DAD] text-white rounded-lg hover:bg-purple-800 transition-colors">Join</button>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-start">
              <div className="bg-[#6A0DAD] rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-lg mr-4 flex-shrink-0">
                MC
              </div>
              <div>
                <p className="font-medium text-gray-800">Data Structures - Trees and Graphs</p>
                <p className="text-sm text-gray-500">with Michael Chen</p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Calendar size={12} className="mr-1"/>
                  <span className="mr-2 font-medium">10:00 AM</span>
                  <span className="bg-purple-100 text-[#6A0DAD] px-2 py-1 rounded-full text-xs font-medium">CS 201</span>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#6A0DAD] text-white rounded-lg hover:bg-purple-800 transition-colors">Join</button>
          </div>
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
  );
}