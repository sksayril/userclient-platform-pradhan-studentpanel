import React from 'react';
import { Users, Award, Calendar, TrendingUp, UserCheck, FileText } from 'lucide-react';

interface SocietyMemberDashboardProps {
  onLogout: () => void;
}

export default function SocietyMemberDashboard({ onLogout }: SocietyMemberDashboardProps) {
  const memberData = JSON.parse(localStorage.getItem('societyMember') || '{}');
  const memberEmail = localStorage.getItem('societyMemberEmail') || '';

  const stats = [
    {
      title: 'Member Since',
      value: '2024',
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Referral Code',
      value: memberData.referralCode || 'N/A',
      icon: Award,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Account Status',
      value: memberData.isAccountActive ? 'Active' : 'Inactive',
      icon: UserCheck,
      color: memberData.isAccountActive ? 'bg-green-500' : 'bg-red-500',
      textColor: memberData.isAccountActive ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'KYC Status',
      value: memberData.kycStatus || 'Pending',
      icon: FileText,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      title: 'View Profile',
      description: 'Update your personal information',
      icon: Users,
      action: () => console.log('View Profile clicked'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Society Events',
      description: 'Browse upcoming community events',
      icon: Calendar,
      action: () => console.log('Society Events clicked'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Benefits',
      description: 'Explore member benefits and offers',
      icon: Award,
      action: () => console.log('Benefits clicked'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Community',
      description: 'Connect with other members',
      icon: TrendingUp,
      action: () => console.log('Community clicked'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Society Member Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {memberData.firstName} {memberData.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Member ID</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {memberData.memberAccountNumber || 'N/A'}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className={`text-lg font-semibold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all text-left group"
              >
                <div className={`p-3 rounded-lg ${action.color} w-fit mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  Account activated successfully
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your society member account is now active
                </p>
              </div>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                Today
              </span>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  KYC verification in progress
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your documents are under review
                </p>
              </div>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                2 days ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
