import React, { useState, useEffect } from 'react';
import { BookOpen, Play, Download, Loader, Filter } from 'lucide-react';
import { getStudentCourses } from '../../services/api';

interface Course {
  _id: string;
  title: string;
  description: string;
  courseType: 'online' | 'offline';
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  thumbnail: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export default function Courses() {
  const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await getStudentCourses(token, {
          courseType: activeTab,
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedLevel && { level: selectedLevel as 'beginner' | 'intermediate' | 'advanced' })
        });
        
        if (response && response.data) {
          setCourses(response.data);
        }
        
      } catch (error: any) {
        setError(error.message || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [activeTab, selectedCategory, selectedLevel]);

  const getInstructorName = (createdBy: Course['createdBy']) => {
    return `${createdBy.firstName} ${createdBy.lastName}`;
  };

  const formatPrice = (price: number, originalPrice?: number) => {
    if (originalPrice && originalPrice > price) {
      return {
        current: price,
        original: originalPrice,
        hasDiscount: true
      };
    }
    return {
      current: price,
      hasDiscount: false
    };
  };

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Courses</h1>
        <p className="text-gray-600">Enhance your skills with our courses</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center mb-3">
          <Filter className="w-4 h-4 text-gray-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="business">Business</option>
              <option value="data-science">Data Science</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        
        {/* Clear Filters */}
        {(selectedCategory || selectedLevel) && (
          <button
            onClick={() => {
              setSelectedCategory('');
              setSelectedLevel('');
            }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Clear Filters
          </button>
        )}
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading courses...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-medium mb-2">Failed to load courses</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Course Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No courses available</p>
              <p className="text-gray-400">Check back later for new {activeTab} courses</p>
            </div>
          ) : (
            courses.map((course) => {
              const priceInfo = formatPrice(course.price, course.originalPrice);
              const instructorName = getInstructorName(course.createdBy);
              
              return (
                <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Course Image */}
                  {course.thumbnail && (
                    <img 
                      src={`http://localhost:3100${course.thumbnail}`}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=300';
                      }}
                    />
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level}
                      </span>
                      {course.discountPercentage && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full">
                          {course.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {instructorName}</p>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span className="capitalize">{course.category}</span>
                      </div>
                      <div className="flex items-center">
                        <Play className="w-4 h-4 mr-1" />
                        <span className="capitalize">{course.courseType}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">₹{priceInfo.current.toLocaleString()}</span>
                        {priceInfo.hasDiscount && priceInfo.original && (
                          <span className="text-sm text-gray-500 line-through">₹{priceInfo.original.toLocaleString()}</span>
                        )}
                      </div>
                      <button className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                        activeTab === 'online' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}>
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}