import { useState, useEffect } from 'react';
import { DollarSign, Users, BookOpen, TrendingUp, Calendar, Award, LogOut, User } from 'lucide-react';
import { getStudentProfile } from '../../services/api';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [studentData, setStudentData] = useState({
    name: '',
    totalFeesPaid: 0,
    currentBatch: '',
    currentCourse: '',
    progress: 0,
    nextClass: 'Tomorrow at 10:00 AM', // This can be dynamic later
    profilePhoto: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await getStudentProfile(token);
        if (response && response.data) {
          const student = response.data;
          const latestEnrollment = student.enrollments && student.enrollments.length > 0 ? student.enrollments[0] : null;

          setStudentData({
            name: `${student.firstName} ${student.lastName}`,
            profilePhoto: student.kycDocuments?.profilePhoto || '',
            // Note: The following are placeholders or derived. 
            // The API response for profile doesn't contain all dashboard stats directly.
            totalFeesPaid: 15000, // Placeholder
            currentBatch: latestEnrollment?.batchName || 'No Active Batch',
            currentCourse: latestEnrollment?.courseName || 'No Active Course',
            progress: latestEnrollment?.progress || 0,
            nextClass: 'Tomorrow at 10:00 AM' // Placeholder
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="p-4 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative shadow-md">
            {studentData.profilePhoto ? (
              <img 
                src={`http://localhost:3100${studentData.profilePhoto}`}
                alt="Profile"
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
              />
            ) : null}
            <User className={`w-8 h-8 text-white ${studentData.profilePhoto ? 'hidden' : ''}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {studentData.name.split(' ')[0]}!
            </h1>
            <p className="text-gray-600">Here's your learning progress.</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold p-3 rounded-full flex items-center transition-colors shadow-sm"
        >
          <LogOut className="w-5 h-5" />
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