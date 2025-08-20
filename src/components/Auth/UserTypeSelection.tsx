import React from 'react';
import { GraduationCap, Users } from 'lucide-react';

interface UserTypeSelectionProps {
  onSelectUserType: (userType: 'student' | 'society-member') => void;
}

export default function UserTypeSelection({ onSelectUserType }: UserTypeSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
            <p className="text-gray-600">Choose your account type to continue</p>
          </div>

          <div className="space-y-4">
            {/* Student Option */}
            <button
              onClick={() => onSelectUserType('student')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Student</h3>
                  <p className="text-sm text-gray-600">Access courses, track progress, and manage your learning journey</p>
                </div>
              </div>
            </button>

            {/* Society Member Option */}
            <button
              onClick={() => onSelectUserType('society-member')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Society Member</h3>
                  <p className="text-sm text-gray-600">Join our community, access exclusive benefits, and connect with others</p>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Choose the option that best describes your relationship with our platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
