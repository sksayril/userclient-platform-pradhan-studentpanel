import { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit, Calendar, Award, BookOpen, Save, X } from 'lucide-react';
import { getStudentProfile, updateStudentProfile, getStudentMarksheets, getStudentCertificates } from '../../services/api';

interface ProfileProps {
  studentEmail: string;
}

export default function Profile({ studentEmail }: ProfileProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: studentEmail,
    phone: '',
    dateOfBirth: '',
    address: '',
    firstName: '',
    lastName: '',
    gender: '', 
    studentId: '',
    kycStatus: '',
    isKycApproved: false,
    isAccountActive: false,
    createdAt: '',
    kycApprovedAt: '',
    originalPassword: '',
    aadharNumber: '',
    panNumber: '',
    profilePhoto: '',
    certificates: [] as any[]
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  const [achievements, setAchievements] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [marksheets, setMarksheets] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await getStudentProfile(token);
        
        if (response && response.data) {
          const student = response.data;
          const profileInfo = {
            name: `${student.firstName} ${student.lastName}`,
            email: student.email,
            phone: student.phone || '',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
            address: student.address ? `${student.address.street}, ${student.address.city}, ${student.address.state} - ${student.address.pincode}` : '',
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            gender: student.gender || '',
            studentId: student.studentId || '',
            kycStatus: student.kycStatus || '',
            isKycApproved: student.isKycApproved || false,
            isAccountActive: student.isAccountActive || false,
            createdAt: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '',
            kycApprovedAt: student.kycApprovedAt ? new Date(student.kycApprovedAt).toLocaleDateString() : '',
            originalPassword: student.originalPassword || '',
            aadharNumber: student.kycDocuments?.aadharCard?.number || '',
            panNumber: student.kycDocuments?.panCard?.number || '',
            profilePhoto: student.kycDocuments?.profilePhoto || '',
            certificates: student.certificates || []
          };
          
          setProfileData(profileInfo);
          
          // Set edit form data
          setEditFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            phone: student.phone || '',
            address: {
              street: student.address?.street || '',
              city: student.address?.city || '',
              state: student.address?.state || '',
              pincode: student.address?.pincode || ''
            }
          });
          
          // Set achievements from certificates
          if (student.certificates && student.certificates.length > 0) {
            setAchievements(student.certificates.map((cert: any) => ({
              title: cert.name || 'Certificate',
              date: cert.issuedDate || cert.createdAt,
              type: 'Certificate'
            })));
          }
          
          // Set enrolled courses from enrollments
          if (student.enrollments && student.enrollments.length > 0) {
            setEnrolledCourses(student.enrollments.map((enrollment: any) => ({
              name: enrollment.courseName || enrollment.course?.name || 'Course',
              progress: enrollment.progress || 0,
              status: enrollment.status || 'In Progress'
            })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    const fetchMarksheets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await getStudentMarksheets(token);
        if (response && response.data) {
          setMarksheets(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch marksheets:', error);
        // Optionally set an error state for marksheets
      }
    };

    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await getStudentCertificates(token);
        if (response && response.data) {
          setCertificates(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
      }
    };

    fetchProfileData();
    fetchMarksheets();
    fetchCertificates();
  }, [studentEmail]);

  const handleEditFormChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveMessage(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await updateStudentProfile(token, editFormData);
      
      if (response && response.message) {
        setSaveMessage(response.message);
        // Refresh profile data after successful update
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      
    } catch (error: any) {
      setSaveError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    setEditFormData({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      address: {
        street: profileData.address.split(',')[0] || '',
        city: profileData.address.split(',')[1]?.trim() || '',
        state: profileData.address.split(',')[2]?.trim() || '',
        pincode: profileData.address.split(' - ')[1] || ''
      }
    });
    setIsEditModalOpen(false);
  };



  // Loading state
  if (loading) {
    return (
      <div className="p-4 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading profile</p>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative">
            {profileData.profilePhoto ? (
              <img 
                src={`https://psmw75hs-3500.inc1.devtunnels.ms${profileData.profilePhoto}`}
                alt="Profile"
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={(e) => {
                  // Fallback to User icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <User className={`w-10 h-10 text-white ${profileData.profilePhoto ? 'hidden' : ''}`} />
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
            <p className="text-gray-600">Student ID: {profileData.studentId}</p>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                profileData.isKycApproved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                KYC {profileData.isKycApproved ? 'Approved' : 'Pending'}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                profileData.isAccountActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {profileData.isAccountActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{profileData.email}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{profileData.phone}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="text-gray-900">{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="text-gray-900 capitalize">{profileData.gender || 'Not specified'}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-900">{profileData.address || 'Not provided'}</p>
            </div>
          </div>
        </div>


      </div>

      {/* KYC Documents */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 text-blue-500 mr-2" />
          KYC Documents
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Aadhar Card</h4>
                  <p className="text-sm text-gray-600">{profileData.aadharNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">PAN Card</h4>
                  <p className="text-sm text-gray-600">{profileData.panNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">KYC Status</h4>
                <p className="text-sm text-gray-600 capitalize">{profileData.kycStatus}</p>
                {profileData.kycApprovedAt && (
                  <p className="text-xs text-gray-500 mt-1">Approved on: {profileData.kycApprovedAt}</p>
                )}
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                profileData.isKycApproved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profileData.isKycApproved ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 text-purple-500 mr-2" />
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-1">Account Created</h4>
            <p className="text-sm text-gray-600">{profileData.createdAt || 'Not available'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-1">Account Status</h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              profileData.isAccountActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {profileData.isAccountActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 text-yellow-500 mr-2" />
          Achievements
        </h3>
        <div className="space-y-3">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{achievement.title}</p>
                  <p className="text-sm text-gray-600">{achievement.type}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(achievement.date).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No achievements yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 text-blue-500 mr-2" />
          Enrolled Courses
        </h3>
        <div className="space-y-4">
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{course.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        course.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No enrolled courses yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Certificates & Marksheets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 text-blue-500 mr-2" />
          Certificates & Marksheets
        </h3>
        <div className="space-y-4">
          {(certificates.length > 0 || marksheets.length > 0) ? (
            <>
              {certificates.map((certificate: any, index: number) => (
                <div key={`cert-${index}`} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{certificate.name || 'Certificate'}</h4>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Certificate
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Issued on: {certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString() : 'N/A'}
                    </span>
                    {certificate.courseName && (
                      <span>Course: {certificate.courseName}</span>
                    )}
                  </div>
                </div>
              ))}
              {marksheets.map((marksheet: any, index: number) => (
                <div key={`mark-${index}`} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{marksheet.title || 'Marksheet'}</h4>
                    <a 
                      href={marksheet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                    >
                      View Marksheet
                    </a>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Issued on: {marksheet.issuedDate ? new Date(marksheet.issuedDate).toLocaleDateString() : 'N/A'}
                    </span>
                    {marksheet.courseName && (
                      <span>Course: {marksheet.courseName}</span>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No certificates or marksheets found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[75vh] overflow-y-auto my-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Success/Error Messages */}
              {saveMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm font-medium">{saveMessage}</p>
                </div>
              )}
              
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm font-medium">{saveError}</p>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => handleEditFormChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => handleEditFormChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => handleEditFormChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                  
                  {/* Street */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correspondense Address
                    </label>
                    <input
                      type="text"
                      value={editFormData.address.street}
                      onChange={(e) => handleEditFormChange('address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter Correspondense Address"
                      required
                    />
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={editFormData.address.city}
                        onChange={(e) => handleEditFormChange('address.city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={editFormData.address.state}
                        onChange={(e) => handleEditFormChange('address.state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="State"
                        required
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={editFormData.address.pincode}
                      onChange={(e) => handleEditFormChange('address.pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter pincode"
                      required
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex-1 py-3 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center ${
                      isSaving 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className={`flex-1 py-3 rounded-xl font-semibold focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all flex items-center justify-center ${
                      isSaving 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}