// src/components/BrowseSessions.jsx
import React from 'react';
import { Search, ChevronDown, SlidersHorizontal, MapPin, Calendar, Users, Star, Hourglass } from 'lucide-react';

export default function BrowseSessions() {
  const sessions = [
    {
      id: 1,
      course: 'MATH 101',
      title: 'Calculus I - Integration Techniques',
      tutor: 'Sarah Johnson',
      tutorInitials: 'SJ',
      rating: 4.8,
      isFree: true,
      time: 'Today • 14:00 - 15:30 (90 min)',
      location: 'Library Study Room 3',
      enrolled: '5/8 students enrolled',
      description: 'Focus on integration by parts and substitution methods',
    },
    {
      id: 2,
      course: 'CS 201',
      title: 'Data Structures - Trees and Graphs',
      tutor: 'Michael Chen',
      tutorInitials: 'MC',
      rating: 4.9,
      isFree: true,
      time: 'Tomorrow • 10:00 - 11:30 (90 min)',
      location: 'Computer Lab B',
      enrolled: '8/12 students enrolled',
      description: 'Binary trees, BSTs, and graph traversal algorithms',
    },
    {
      id: 3,
      course: 'CHEM 201',
      title: 'Organic Chemistry - Reactions',
      tutor: 'Emily Rodriguez',
      tutorInitials: 'ER',
      rating: 4.7,
      isFree: true,
      time: 'Wed, Sep 11 • 16:00 - 17:30 (90 min)',
      location: 'Chemistry Building R102',
      enrolled: '4/6 students enrolled',
      description: 'Substitution and elimination reactions mechanisms',
    },
    {
      id: 4,
      course: 'PHYS 102',
      title: 'Physics II - Electromagnetism',
      tutor: 'David Kim',
      tutorInitials: 'DK',
      rating: 4.6,
      isFree: true,
      time: 'Thu, Sep 12 • 13:00 - 14:30 (90 min)',
      location: 'Physics Lab 1',
      enrolled: '7/10 students enrolled',
      description: 'Electric fields, magnetic forces, and Maxwell\'s equations',
    },
  ];

  return (
    <div className="flex-1 bg-[#F0F2F5] p-8 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Search className="mr-3 text-gray-600" size={24}/>
            Find Tutoring Sessions
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search sessions, modules, or tutors"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>All modules</option>
            <option>MATH 101</option>
            <option>CS 201</option>
            <option>CHEM 201</option>
            <option>PHYS 102</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>

        <div className="relative">
          <select className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Any time</option>
            <option>Today</option>
            <option>Tomorrow</option>
            <option>This Week</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">4 Available Sessions</h2>
        <button className="flex items-center text-purple-600 hover:text-purple-800 font-medium">
          <SlidersHorizontal className="mr-2" size={18} />
          More Filters
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(session => (
          <div key={session.id} className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">{session.course}</span>
                {session.isFree && (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Free</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">{session.title}</h3>

              <div className="flex items-center mb-4">
                <div className="bg-[#6A0DAD] rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-sm mr-3 flex-shrink-0">
                  {session.tutorInitials}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{session.tutor}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Star size={14} className="text-yellow-400 fill-current mr-1" /> {session.rating}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-500" /> {session.time}
                </p>
                <p className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-500" /> {session.location}
                </p>
                <p className="flex items-center">
                  <Users size={16} className="mr-2 text-gray-500" /> {session.enrolled}
                </p>
              </div>

              <p className="text-sm text-gray-700 mb-6">{session.description}</p>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <button className="px-5 py-2 bg-[#6A0DAD] text-white rounded-lg hover:bg-purple-800 transition-colors font-medium">
                Join Session
              </button>
              <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <Hourglass size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}