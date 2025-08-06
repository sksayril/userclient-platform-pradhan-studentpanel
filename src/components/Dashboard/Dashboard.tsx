import { DollarSign, Users, BookOpen, TrendingUp, Calendar, Award, LogOut } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const studentData = {
    name: 'John Doe',
    totalFeesPaid: 15000,
    currentBatch: 'Web Development Batch #42',
    currentCourse: 'Full Stack JavaScript',
    progress: 65,
    nextClass: 'Tomorrow at 10:00 AM'
  };

  const stats = [
    {
      title: 'Total Fees Paid',
      value: `₹${studentData.totalFeesPaid.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Current Batch',
      value: studentData.currentBatch,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Current Course',
      value: studentData.currentCourse,
      icon: BookOpen,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Course Progress',
      value: `${studentData.progress}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {studentData.name}!
          </h1>
          <p className="text-gray-600">Here's your learning progress</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-2xl p-4 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
          <Award className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">{studentData.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${studentData.progress}%` }}
            ></div>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Keep going! You're doing great in your {studentData.currentCourse} course.
        </p>
      </div>

      {/* Next Class Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Next Class</h3>
          <Calendar className="w-6 h-6" />
        </div>
        <p className="text-blue-100 mb-2">JavaScript Advanced Concepts</p>
        <p className="text-xl font-bold">{studentData.nextClass}</p>
      </div>
    </div>
  );
}