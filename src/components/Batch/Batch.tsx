import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, BookOpen, Video, Loader2, AlertCircle } from 'lucide-react';
import { getStudentEnrollments } from '../../services/api';

interface BatchSession {
  id: string;
  courseName: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  instructor: string;
  type: 'lecture' | 'practical' | 'test' | 'revision';
  status: 'completed' | 'upcoming' | 'missed';
}

interface BatchInfo {
  batchName: string;
  courseName: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  completedSessions: number;
  instructor: string;
  location: string;
  schedule: string;
}

interface BatchProps {
  studentEmail?: string;
}

export default function Batch({ studentEmail }: BatchProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch enrollment data on component mount
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await getStudentEnrollments(token);
        setEnrollments(response.data || response.enrollments || response);
      } catch (err: any) {
        console.error('Failed to fetch enrollments:', err);
        setError(err.message || 'Failed to fetch enrollment data');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // Mock data - fallback for when API data is not available
  const batchInfo: BatchInfo = {
    batchName: "Physics Batch 12",
    courseName: "Advanced Physics",
    startDate: "01 June 2024",
    endDate: "30 August 2024",
    totalSessions: 48,
    completedSessions: 32,
    instructor: "Dr. Rajesh Kumar",
    location: "Room 205, Science Block",
    schedule: "Mon, Wed, Fri - 10:00 AM to 12:00 PM"
  };

  const sessions: BatchSession[] = [
    // June 2024 Sessions
    {
      id: '1',
      courseName: 'Physics',
      topic: 'Introduction to Quantum Mechanics',
      date: '2024-06-03',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'lecture',
      status: 'completed',
    },
    {
      id: '2',
      courseName: 'Physics',
      topic: 'Wave Functions Lab',
      date: '2024-06-05',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Lab 3',
      instructor: 'Dr. Rajesh Kumar',
      type: 'practical',
      status: 'completed',
    },
    {
      id: '3',
      courseName: 'Physics',
      topic: 'Quantum Mechanics - Wave Functions',
      date: '2024-06-07',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'lecture',
      status: 'completed',
    },
    {
      id: '4',
      courseName: 'Physics',
      topic: 'Practical Lab - Wave Experiments',
      date: '2024-06-10',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Lab 3',
      instructor: 'Dr. Rajesh Kumar',
      type: 'practical',
      status: 'completed',
    },
    {
      id: '5',
      courseName: 'Physics',
      topic: 'Quantum Tunneling',
      date: '2024-06-12',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'lecture',
      status: 'completed',
    },
    {
      id: '6',
      courseName: 'Physics',
      topic: 'Mid-Term Assessment',
      date: '2024-06-14',
      time: '10:00 AM',
      duration: '3 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'test',
      status: 'completed',
    },
    {
      id: '7',
      courseName: 'Physics',
      topic: 'Relativity Theory - Part 1',
      date: '2024-06-17',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'lecture',
      status: 'upcoming',
    },
    {
      id: '8',
      courseName: 'Physics',
      topic: 'Relativity Lab Experiments',
      date: '2024-06-19',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Lab 3',
      instructor: 'Dr. Rajesh Kumar',
      type: 'practical',
      status: 'upcoming',
    },
    {
      id: '9',
      courseName: 'Physics',
      topic: 'Relativity Theory - Part 2',
      date: '2024-06-21',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'lecture',
      status: 'upcoming',
    },
    {
      id: '10',
      courseName: 'Physics',
      topic: 'Revision Session - Quantum Mechanics',
      date: '2024-06-24',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'revision',
      status: 'upcoming',
    },
    {
      id: '11',
      courseName: 'Physics',
      topic: 'Final Assessment Preparation',
      date: '2024-06-26',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'revision',
      status: 'upcoming',
    },
    {
      id: '12',
      courseName: 'Physics',
      topic: 'Final Assessment',
      date: '2024-06-28',
      time: '10:00 AM',
      duration: '3 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'test',
      status: 'upcoming',
    },
    // July 2024 Sessions
    {
      id: '13',
      courseName: 'Physics',
      topic: 'Advanced Topics Review',
      date: '2024-07-01',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Room 205',
      instructor: 'Dr. Rajesh Kumar',
      type: 'lecture',
      status: 'upcoming',
    },
    {
      id: '14',
      courseName: 'Physics',
      topic: 'Practical Final Exam',
      date: '2024-07-03',
      time: '10:00 AM',
      duration: '3 hours',
      location: 'Lab 3',
      instructor: 'Dr. Rajesh Kumar',
      type: 'test',
      status: 'upcoming',
    },
    {
      id: '15',
      courseName: 'Physics',
      topic: 'Course Completion Ceremony',
      date: '2024-07-05',
      time: '10:00 AM',
      duration: '1 hour',
      location: 'Auditorium',
      instructor: 'Dr. Rajesh Kumar',
      type: 'revision',
      status: 'upcoming',
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getSessionsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return sessions.filter(session => session.date === dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return <BookOpen className="w-4 h-4" />;
      case 'practical':
        return <Video className="w-4 h-4" />;
      case 'test':
        return <Calendar className="w-4 h-4" />;
      case 'revision':
        return <Clock className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const renderCalendar = () => {
    const days = [];
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 bg-gray-50"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const daySessions = getSessionsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const hasSessions = daySessions.length > 0;

      // Count session types for this day
      const completedCount = daySessions.filter(s => s.status === 'completed').length;
      const upcomingCount = daySessions.filter(s => s.status === 'upcoming').length;
      const missedCount = daySessions.filter(s => s.status === 'missed').length;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-16 border border-gray-200 p-1 cursor-pointer transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50'}`}
        >
          <div className="text-xs font-medium text-gray-900 mb-1">{day}</div>
          {hasSessions && (
            <div className="space-y-1">
              {/* Session indicators */}
              <div className="flex flex-wrap gap-0.5">
                {daySessions.slice(0, 3).map((session, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      session.status === 'completed' ? 'bg-green-500' :
                      session.status === 'upcoming' ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                    title={`${session.topic} (${session.status})`}
                  />
                ))}
              </div>
              {/* Session count badge */}
              {daySessions.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{daySessions.length - 3} more
                </div>
              )}
              {/* Session type indicators */}
              <div className="flex items-center gap-1">
                {completedCount > 0 && (
                  <div className="text-xs text-green-600 font-medium">{completedCount}✓</div>
                )}
                {upcomingCount > 0 && (
                  <div className="text-xs text-blue-600 font-medium">{upcomingCount}→</div>
                )}
                {missedCount > 0 && (
                  <div className="text-xs text-red-600 font-medium">{missedCount}✗</div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateSessions = getSessionsForDate(selectedDate);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Batch</h1>
            <p className="text-gray-600">Loading your enrollment data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Fetching your batch information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Batch</h1>
            <p className="text-gray-600">Unable to load batch data</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Batch</h1>
          <p className="text-gray-600">
            {studentEmail ? `Batch schedule for ${studentEmail}` : 'Track your batch sessions and progress'}
          </p>
        </div>
      </div>

      {/* Enrollment Data Display */}
      {enrollments.length > 0 ? (
        <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Enrollments</h2>
                <p className="text-sm text-gray-600">Currently enrolled courses and batches</p>
              </div>
              <div className="text-sm text-gray-500">
                {enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {enrollments.map((enrollment, index) => (
              <div key={enrollment.id || enrollment._id || index} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {enrollment.courseName || enrollment.course?.name || enrollment.course?.title || 'Course Name'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {enrollment.batchName || enrollment.batch?.name || enrollment.batchId || 'Batch Information'}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      enrollment.status === 'active' || enrollment.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      enrollment.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status || 'Active'}
                    </span>
                  </div>
                </div>
                
                {/* Enrollment Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* Left Column */}
                  <div className="space-y-2">
                    {(enrollment.startDate || enrollment.enrollmentDate) && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium mr-2">Start Date:</span>
                        <span>{new Date(enrollment.startDate || enrollment.enrollmentDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {enrollment.endDate && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium mr-2">End Date:</span>
                        <span>{new Date(enrollment.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {(enrollment.instructor || enrollment.teacher) && (
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium mr-2">Instructor:</span>
                        <span>{enrollment.instructor || enrollment.teacher}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-2">
                    {(enrollment.location || enrollment.venue) && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium mr-2">Location:</span>
                        <span>{enrollment.location || enrollment.venue}</span>
                      </div>
                    )}
                    {(enrollment.schedule || enrollment.timing) && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium mr-2">Schedule:</span>
                        <span>{enrollment.schedule || enrollment.timing}</span>
                      </div>
                    )}
                    {enrollment.progress !== undefined && (
                      <div className="flex items-center text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium mr-2">Progress:</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar (if progress data available) */}
                {enrollment.progress !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Course Progress</span>
                      <span>{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Additional Info */}
                {(enrollment.description || enrollment.notes) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{enrollment.description || enrollment.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrollments Found</h3>
              <p className="text-gray-600">You are not currently enrolled in any courses or batches.</p>
            </div>
          </div>
        )
      )}

      {/* Batch Info Card */}
      <div className="bg-white px-4 py-6 border-b border-gray-200">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">{batchInfo.batchName}</h2>
              <p className="text-blue-100">{batchInfo.courseName}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{batchInfo.completedSessions}/{batchInfo.totalSessions}</div>
              <div className="text-blue-100 text-sm">Sessions Completed</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{batchInfo.instructor}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{batchInfo.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{batchInfo.schedule}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{batchInfo.startDate} - {batchInfo.endDate}</span>
            </div>
          </div>
                 </div>
       </div>

       {/* Upcoming Sessions Summary */}
       <div className="bg-white px-4 py-4 border-b border-gray-200">
         <div className="flex items-center justify-between mb-3">
           <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
           <span className="text-sm text-blue-600 font-medium">
             {sessions.filter(s => s.status === 'upcoming').length} sessions
           </span>
         </div>
         <div className="grid grid-cols-1 gap-2">
           {sessions
             .filter(session => session.status === 'upcoming')
             .slice(0, 3)
             .map((session) => (
               <div key={session.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                 <div className="flex items-center space-x-3">
                   <div className="p-1.5 rounded-full bg-blue-100">
                     {getTypeIcon(session.type)}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-900">{session.topic}</p>
                     <p className="text-xs text-gray-600">{session.date} • {session.time}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-gray-600">{session.location}</p>
                   <p className="text-xs text-blue-600 font-medium">{session.duration}</p>
                 </div>
               </div>
             ))}
         </div>
       </div>

       {/* Calendar Section */}
       <div className="bg-white px-4 py-6 border-b border-gray-200">
         <div className="flex items-center justify-between mb-4">
           <div>
             <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
             <p className="text-sm text-gray-600">Click on any date to view sessions</p>
           </div>
           <div className="flex items-center space-x-2">
             <button
               onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
               className="p-2 rounded-lg hover:bg-gray-100"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <span className="text-lg font-medium text-gray-900 min-w-[120px] text-center">
               {monthName}
             </span>
             <button
               onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
               className="p-2 rounded-lg hover:bg-gray-100"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
           </div>
         </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span>Upcoming</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>Missed</span>
          </div>
        </div>
      </div>

      {/* Selected Date Sessions */}
      <div className="bg-white">
        <div className="px-4 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sessions for {formatDate(selectedDate)}
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {selectedDateSessions.length > 0 ? (
            selectedDateSessions.map((session) => (
              <div key={session.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(session.status)}`}>
                    {getTypeIcon(session.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{session.topic}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{session.courseName}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{session.time} ({session.duration})</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{session.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No sessions scheduled for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 