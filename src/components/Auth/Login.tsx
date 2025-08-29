import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { loginUser, loginSocietyMember } from '../../services/api';

interface LoginProps {
  onLogin: (email: string, userType: 'student' | 'society-member') => void;
  onSwitchToSignup: () => void;
  onBackToUserType: () => void;
  userType: 'student' | 'society-member';
}

export default function Login({ onLogin, onSwitchToSignup, onBackToUserType, userType }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memberId, setMemberId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'accountNumber'>('email');

  // Reset form fields when login method changes
  useEffect(() => {
    if (userType === 'society-member') {
      setEmail('');
      setMemberId('');
    }
  }, [loginMethod, userType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let formData;
      let data;
      
      if (userType === 'student') {
        formData = { email, password };
        data = await loginUser(formData);
        if (data && data.data && data.data.token && data.data.student) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('student', JSON.stringify(data.data.student));
          localStorage.setItem('userType', 'student');
          console.log('Student login successful, token and student data stored.');
          onLogin(formData.email, 'student');
        } else {
          throw new Error('Login successful but no token was provided.');
        }
             } else {
         // For society members, send data based on login method
         if (loginMethod === 'email') {
           formData = { email, password, memberId };
         } else {
           formData = { accountNumber: memberId, password, memberId };
         }
         data = await loginSocietyMember(formData);
         if (data && data.data && data.data.token && data.data.member) {
           localStorage.setItem('token', data.data.token);
           localStorage.setItem('societyMember', JSON.stringify(data.data.member));
           localStorage.setItem('userType', 'society-member');
           console.log('Society member login successful, token and member data stored.');
           onLogin(loginMethod === 'email' ? email : memberId, 'society-member');
         } else {
           throw new Error('Login successful but no token was provided.');
         }
       }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred.');
      }
      // Clear fields on failed login
      setEmail('');
      setPassword('');
      if (userType === 'society-member') {
        setMemberId('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div className="text-center relative">
            <button
              onClick={onBackToUserType}
              className="absolute left-0 top-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`w-16 h-16 ${userType === 'student' ? 'bg-blue-600' : 'bg-green-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600">
              {userType === 'student' ? 'Login to your student account' : 'Login to your society member account'}
            </p>
          </div>

                     <form onSubmit={handleSubmit} className="space-y-4">
             {userType === 'society-member' && (
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Login Method
                 </label>
                 <div className="flex space-x-2">
                   <button
                     type="button"
                     onClick={() => setLoginMethod('email')}
                     className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                       loginMethod === 'email'
                         ? 'bg-green-600 text-white border-green-600'
                         : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                     }`}
                   >
                     Email Address
                   </button>
                   <button
                     type="button"
                     onClick={() => setLoginMethod('accountNumber')}
                     className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                       loginMethod === 'accountNumber'
                         ? 'bg-green-600 text-white border-green-600'
                         : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                     }`}
                   >
                     Account Number
                   </button>
                 </div>
               </div>
             )}

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 {userType === 'society-member' && loginMethod === 'accountNumber' ? 'Account Number' : 'Email Address'}
               </label>
               <div className="relative">
                 {userType === 'student' || (userType === 'society-member' && loginMethod === 'email') ? (
                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                 ) : null}
                 <input
                   type={userType === 'society-member' && loginMethod === 'accountNumber' ? 'text' : 'email'}
                   value={userType === 'society-member' && loginMethod === 'accountNumber' ? memberId : email}
                   onChange={(e) => {
                     if (userType === 'society-member' && loginMethod === 'accountNumber') {
                       setMemberId(e.target.value);
                     } else {
                       setEmail(e.target.value);
                     }
                   }}
                   className={`w-full ${userType === 'society-member' && loginMethod === 'accountNumber' ? 'px-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder-gray-500`}
                   placeholder={userType === 'society-member' && loginMethod === 'accountNumber' ? 'Enter your account number' : 'Enter your email'}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${userType === 'student' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'} text-white py-3 rounded-xl font-semibold focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className={`${userType === 'student' ? 'text-blue-600' : 'text-green-600'} font-semibold hover:underline`}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}