import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, ChevronLeft, ChevronRight, Sparkles, Star, Award } from 'lucide-react';

interface UserTypeSelectionProps {
  onSelectUserType: (userType: 'student' | 'society-member') => void;
}

export default function UserTypeSelection({ onSelectUserType }: UserTypeSelectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Premium background images for slider
  const backgroundImages = [
    'https://i.pinimg.com/736x/c7/e8/e4/c7e8e482d8fda880f6a0e55da9662f19.jpg',
    'https://i.pinimg.com/1200x/af/89/62/af8962be3473a238936e3137cbbfdc61.jpg',
    'https://i.pinimg.com/736x/c6/a6/72/c6a67254b2594dfcade5e03671d2fbfd.jpg',
    'https://i.pinimg.com/1200x/47/03/a0/4703a02876030b53954e3e397e15a268.jpg', 
  ];

  // Auto-slide images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Background ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/60" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
      
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 group"
      >
        <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Premium Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-purple-300" />
              <span className="text-white/90 font-medium">Welcome to Our Platform</span>
              <Star className="w-5 h-5 text-indigo-300" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              Choose Your
              <span className="block bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Journey
              </span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Select your account type to unlock personalized features and experiences tailored just for you
            </p>
          </div>

          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Option */}
            <div className="group">
              <button
                onClick={() => onSelectUserType('student')}
                className="w-full h-full relative overflow-hidden"
              >
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:bg-white/15 group-hover:border-white/40 group-hover:shadow-2xl">
                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl" />
                  </div>
                  
                  <div className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                      <GraduationCap className="w-12 h-12 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                      Student
                    </h3>
                    
                    <p className="text-white/80 leading-relaxed mb-6">
                      Access comprehensive courses, track your learning progress, and manage your educational journey with advanced tools and insights
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center space-x-2 text-white/70">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-sm">Interactive Learning Modules</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/70">
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        <span className="text-sm">Progress Tracking & Analytics</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/70">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                        <span className="text-sm">Personalized Study Plans</span>
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-6">
                      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300 shadow-lg">
                        <span>Start Learning</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Society Member Option */}
            <div className="group">
              <button
                onClick={() => onSelectUserType('society-member')}
                className="w-full h-full relative overflow-hidden"
              >
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:bg-white/15 group-hover:border-white/40 group-hover:shadow-2xl">
                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-xl" />
                  </div>
                  
                  <div className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors">
                      Society Member
                    </h3>
                    
                    <p className="text-white/80 leading-relaxed mb-6">
                      Join our vibrant community, access exclusive benefits, and connect with like-minded individuals in a supportive environment
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center space-x-2 text-white/70">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-sm">Community Networking</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/70">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        <span className="text-sm">Exclusive Benefits & Services</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/70">
                        <div className="w-2 h-2 bg-teal-400 rounded-full" />
                        <span className="text-sm">Collaborative Opportunities</span>
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-6">
                      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold group-hover:from-green-600 group-hover:to-emerald-700 transition-all duration-300 shadow-lg">
                        <span>Join Community</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <p className="text-white/70 text-sm font-medium">
                Choose the option that best describes your relationship with our platform
              </p>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
