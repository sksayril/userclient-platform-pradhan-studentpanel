import React, { useState } from 'react';
import { BookOpen, Clock, Users, Star, Play, Download } from 'lucide-react';

export default function Courses() {
  const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online');

  const onlineCourses = [
    {
      id: 1,
      title: 'Full Stack JavaScript',
      instructor: 'Sarah Johnson',
      duration: '12 weeks',
      students: 245,
      rating: 4.8,
      price: 15000,
      image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=300',
      level: 'Intermediate'
    },
    {
      id: 2,
      title: 'React Native Development',
      instructor: 'Mike Chen',
      duration: '10 weeks',
      students: 189,
      rating: 4.9,
      price: 18000,
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300',
      level: 'Advanced'
    },
    {
      id: 3,
      title: 'Python for Data Science',
      instructor: 'Dr. Emily Davis',
      duration: '14 weeks',
      students: 312,
      rating: 4.7,
      price: 20000,
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=300',
      level: 'Beginner'
    }
  ];

  const offlineCourses = [
    {
      id: 1,
      title: 'Web Development Bootcamp',
      instructor: 'John Smith',
      duration: '16 weeks',
      students: 25,
      rating: 4.9,
      price: 25000,
      location: 'Tech Hub, Mumbai',
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      instructor: 'Lisa Wang',
      duration: '12 weeks',
      students: 18,
      rating: 4.8,
      price: 22000,
      location: 'Innovation Center, Delhi',
      level: 'Intermediate'
    }
  ];

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Courses</h1>
        <p className="text-gray-600">Enhance your skills with our courses</p>
      </div>

      {/* Tab Buttons */}
      <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('online')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'online'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Play className="w-4 h-4 mr-2" />
          Online Courses
        </button>
        <button
          onClick={() => setActiveTab('offline')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'offline'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download className="w-4 h-4 mr-2" />
          Offline Courses
        </button>
      </div>

      {/* Course Cards */}
      <div className="space-y-4">
        {activeTab === 'online' && onlineCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <img 
              src={course.image} 
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.level}
                </span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900 ml-1">{course.rating}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-3">by {course.instructor}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.students} students
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        ))}

        {activeTab === 'offline' && offlineCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {course.level}
              </span>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900 ml-1">{course.rating}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
            <p className="text-gray-600 text-sm mb-2">by {course.instructor}</p>
            <p className="text-blue-600 text-sm font-medium mb-3">{course.location}</p>
            
            <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {course.duration}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {course.students} students
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
              <button className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors">
                Enroll Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}