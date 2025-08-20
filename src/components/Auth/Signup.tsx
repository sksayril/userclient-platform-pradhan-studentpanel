import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Phone, ArrowLeft } from 'lucide-react';
import { signupUser, signupSocietyMember } from '../../services/api';

interface SignupProps {
  onSignup: (email: string, userType: 'student' | 'society-member') => void;
  onSwitchToLogin: () => void;
  onBackToUserType: () => void;
  userType: 'student' | 'society-member';
}

const initialStudentFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: ''
  },
  password: '',
  confirmPassword: ''
};

const initialSocietyMemberFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: ''
  },
  password: '',
  confirmPassword: '',
  agentCode: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  }
};

export default function Signup({ onSignup, onSwitchToLogin, onBackToUserType, userType }: SignupProps) {
  const [formData, setFormData] = useState<any>(
    userType === 'student' ? initialStudentFormData : initialSocietyMemberFormData
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let data;
      
      if (userType === 'student') {
        data = await signupUser(formData);
        if (data && data.data && data.data.token && data.data.student) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('student', JSON.stringify(data.data.student));
          localStorage.setItem('userType', 'student');
          console.log('Student signup successful, token and student data stored.');
          onSignup(formData.email, 'student');
          setFormData(initialStudentFormData);
        } else {
          throw new Error('Signup successful but no token was provided.');
        }
      } else {
        // Remove confirmPassword for society member API
        const { confirmPassword, ...societyMemberData } = formData as any;
        data = await signupSocietyMember(societyMemberData);
        if (data && data.data && data.data.token && data.data.member) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('societyMember', JSON.stringify(data.data.member));
          localStorage.setItem('userType', 'society-member');
          console.log('Society member signup successful, token and member data stored.');
          onSignup(formData.email, 'society-member');
          setFormData(initialSocietyMemberFormData);
        } else {
          throw new Error('Signup successful but no token was provided.');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${userType === 'student' ? 'from-green-50 to-emerald-100' : 'from-purple-50 to-indigo-100'} flex items-center justify-center p-4`}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div className="text-center relative">
            <button
              onClick={onBackToUserType}
              className="absolute left-0 top-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`w-16 h-16 ${userType === 'student' ? 'bg-green-600' : 'bg-purple-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600">
              {userType === 'student' ? 'Join us to start learning' : 'Join our society community'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="flex gap-4 mb-4">
                <div className="relative w-1/2">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="relative w-1/2">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative mb-4">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative mb-4">
                <input 
                  type="date" 
                  placeholder="Date of Birth" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative mb-4">
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Street" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  value={formData.address.street}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                  required
                />
              </div>
              <div className="flex gap-4 mb-4">
                <div className="relative w-1/2">
                  <input 
                    type="text" 
                    placeholder="City" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    value={formData.address.city}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    required
                  />
                </div>
                <div className="relative w-1/2">
                  <input 
                    type="text" 
                    placeholder="State" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    value={formData.address.state}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                    required
                  />
                </div>
              </div>
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Pincode" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  value={formData.address.pincode}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 ${userType === 'student' ? 'focus:ring-green-500' : 'focus:ring-purple-500'} focus:border-transparent outline-none transition-all`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Society Member Specific Fields */}
            {userType === 'society-member' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Code (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="agentCode"
                      value={(formData as any).agentCode || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter agent code if you have one"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Emergency Contact Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        value={(formData as any).emergencyContact?.name || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {
                            ...(formData as any).emergencyContact,
                            name: e.target.value
                          }
                        })}
                        required
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Relationship"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        value={(formData as any).emergencyContact?.relationship || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {
                            ...(formData as any).emergencyContact,
                            relationship: e.target.value
                          }
                        })}
                        required
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Emergency Contact Phone"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        value={(formData as any).emergencyContact?.phone || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {
                            ...(formData as any).emergencyContact,
                            phone: e.target.value
                          }
                        })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${userType === 'student' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'} text-white py-3 rounded-xl font-semibold focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className={`${userType === 'student' ? 'text-green-600' : 'text-purple-600'} font-semibold hover:underline`}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}