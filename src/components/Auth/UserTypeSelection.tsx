import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, ChevronLeft, ChevronRight, Sparkles, Star, Award, Play, Pause } from 'lucide-react';

interface UserTypeSelectionProps {
  onSelectUserType: (userType: 'student' | 'society-member') => void;
}

export default function UserTypeSelection({ onSelectUserType }: UserTypeSelectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Thumbnail images for the carousel
  const thumbnailImages = [
    {
      src: 'https://images.unsplash.com/photo-1523240798132-6b1b6e0b0b0b?w=400&h=300&fit=crop',
      alt: 'Students studying together',
      title: 'Collaborative Learning'
    },
    {
      src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
      alt: 'Online education platform',
      title: 'Digital Education'
    },
    {
      src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
      alt: 'Community building',
      title: 'Community Growth'
    },
    {
      src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
      alt: 'Team collaboration',
      title: 'Team Work'
    },
    {
      src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      alt: 'Professional development',
      title: 'Skill Development'
    }
  ];

  // Auto-slide images every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % thumbnailImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, thumbnailImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % thumbnailImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + thumbnailImages.length) % thumbnailImages.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section with Carousel */}
      <div className="relative bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-200 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-purple-800 font-medium">Welcome to Our Platform</span>
              <Star className="w-5 h-5 text-indigo-600" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Choose Your
              <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Journey
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Select your account type to unlock personalized features and experiences tailored just for you
            </p>
          </div>

          {/* Carousel Section */}
          <div className="relative max-w-4xl mx-auto mb-16">
            {/* Main Carousel Image */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              <img
                src={thumbnailImages[currentImageIndex].src}
                alt={thumbnailImages[currentImageIndex].alt}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{thumbnailImages[currentImageIndex].title}</h3>
                <p className="text-white/90">Discover amazing opportunities</p>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-300 group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-300 group"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            {/* Auto-play Toggle */}
            <button
              onClick={toggleAutoPlay}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* Thumbnail Navigation */}
            <div className="mt-6 flex justify-center space-x-3">
              {thumbnailImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-purple-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Option */}
            <div className="group">
              <button
                onClick={() => onSelectUserType('student')}
                className="w-full h-full relative overflow-hidden"
              >
                <div className="relative bg-white shadow-xl border border-gray-100 rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-purple-200">
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
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      Student
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Access comprehensive courses, track your learning progress, and manage your educational journey with advanced tools and insights
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-sm">Interactive Learning Modules</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        <span className="text-sm">Progress Tracking & Analytics</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
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
                <div className="relative bg-white shadow-xl border border-gray-100 rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-green-200">
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
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                      Society Member
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Join our vibrant community, access exclusive benefits, and connect with like-minded individuals in a supportive environment
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-sm">Community Networking</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        <span className="text-sm">Exclusive Benefits & Services</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
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
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-3 shadow-lg">
              <Award className="w-5 h-5 text-yellow-500" />
              <p className="text-gray-700 text-sm font-medium">
                Choose the option that best describes your relationship with our platform
              </p>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
