import React, { useState, useEffect } from 'react';
import { BookOpen, Play, Download, Loader, Filter, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getStudentCourses } from '../../services/api';
import { getRazorpayConfig } from '../../config/razorpay';

interface Course {
  _id: string;
  title: string;
  description: string;
  courseType: 'online' | 'offline';
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  thumbnail: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function Courses() {
  const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  
  // Payment related state
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  
  // Razorpay configuration
  const razorpayConfig = getRazorpayConfig();
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = localStorage.getItem('userEmail') || userData.email || '';

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await getStudentCourses(token, {
          courseType: activeTab,
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedLevel && { level: selectedLevel as 'beginner' | 'intermediate' | 'advanced' })
        });
        
        if (response && response.data) {
          setCourses(response.data);
        }
        
      } catch (error: any) {
        setError(error.message || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [activeTab, selectedCategory, selectedLevel]);

  const getInstructorName = (createdBy: Course['createdBy']) => {
    return `${createdBy.firstName} ${createdBy.lastName}`;
  };

  const formatPrice = (price: number, originalPrice?: number) => {
    if (originalPrice && originalPrice > price) {
      return {
        current: price,
        original: originalPrice,
        hasDiscount: true
      };
    }
    return {
      current: price,
      hasDiscount: false
    };
  };

  // Function to create course enrollment order
  const createCourseOrder = async (course: Course) => {
    setProcessingPayment(course._id);
    setPaymentError(null);
    setPaymentSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      console.log('🎓 Creating course enrollment order for:', course.title);
      
      // Create order for course enrollment
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/payment-requests/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course._id,
          amount: course.price
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to create enrollment order`;
        
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Course enrollment order created:', data);
      
      // Handle different possible response formats
      let orderId = null;
      
      if (data && data.success && data.orderId) {
        orderId = data.orderId;
      } else if (data && data.orderId) {
        orderId = data.orderId;
      } else if (data && data.order && data.order.id) {
        orderId = data.order.id;
      } else if (data && data.order_id) {
        orderId = data.order_id;
      } else {
        console.error('❌ Unexpected API response format:', data);
        throw new Error('Failed to create enrollment order - unexpected response format');
      }
      
      if (orderId) {
        console.log('🚀 Initializing Razorpay for course enrollment:', orderId);
        await initializeRazorpayPayment(orderId, course.price, course);
      } else {
        throw new Error('Order ID not found in API response');
      }
    } catch (error) {
      console.error('❌ Failed to create course enrollment order:', error);
      
      let errorMessage = 'Failed to create enrollment order';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: Service temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else {
          errorMessage = error.message;
        }
      }
      
      setPaymentError(errorMessage);
    } finally {
      setProcessingPayment(null);
    }
  };

  // Function to initialize Razorpay payment for course enrollment
  const initializeRazorpayPayment = async (orderId: string, amount: number, course: Course) => {
    try {
      console.log('🎯 Initializing Razorpay for course enrollment:', { orderId, amount, courseTitle: course.title });
      
      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        console.error('❌ Razorpay script not loaded');
        throw new Error('Razorpay payment gateway is not loaded. Please refresh the page and try again.');
      }
      
      console.log('✅ Razorpay script is loaded');

      const userName = userData.name || userData.firstName || 'Student';
      const userContact = userData.phone || userData.mobile || '';
      
      console.log('👤 User details:', { userName, userEmail, userContact });
      
      // Validate Razorpay key format
      if (!razorpayConfig.keyId || !razorpayConfig.keyId.startsWith('rzp_')) {
        throw new Error('Invalid Razorpay Key ID. Please check your configuration.');
      }
      
      const options: RazorpayOptions = {
        key: razorpayConfig.keyId,
        amount: Math.round(amount * 100), // Convert to paise
        currency: razorpayConfig.currency,
        name: razorpayConfig.companyName,
        description: `Course Enrollment - ${course.title}`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          console.log('💳 Payment successful:', response);
          await handlePaymentSuccess(response, course);
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userContact
        },
        notes: {
          address: razorpayConfig.companyName
        },
        theme: {
          color: razorpayConfig.themeColor
        },
        modal: {
          ondismiss: () => {
            console.log('🚪 Payment modal dismissed by user');
            setPaymentError('Payment was cancelled by user');
            setProcessingPayment(null);
          }
        }
      };

      console.log('🔧 Razorpay options configured:', options);

      // Create Razorpay instance and open payment modal
      const razorpay = new (window as any).Razorpay(options);
      
      // Add error handler for payment failures
      razorpay.on('payment.failed', function (response: any) {
        console.log('💥 Payment failed event:', response);
        
        if (response.error && response.error.code === 'BAD_REQUEST_ERROR' && 
            response.error.description === 'Authentication failed') {
          setPaymentError('Razorpay authentication failed. Please contact support.');
          console.error('❌ Razorpay Authentication Error: Invalid API keys');
        } else {
          setPaymentError(response.error?.description || 'Payment failed. Please try again.');
        }
        setProcessingPayment(null);
      });
      
      console.log('🚀 Opening Razorpay payment gateway for course enrollment...');
      razorpay.open();
      
      // Update success message to indicate gateway opened
      setPaymentSuccess('Razorpay payment gateway opened! Complete your payment to enroll in the course.');
      
    } catch (error) {
      console.error('❌ Failed to initialize Razorpay payment:', error);
      
      let errorMessage = 'Failed to initialize payment gateway';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed') || error.message.includes('BAD_REQUEST_ERROR')) {
          errorMessage = 'Razorpay authentication failed. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setPaymentError(errorMessage);
      setProcessingPayment(null);
    }
  };

  // Function to handle successful payment
  const handlePaymentSuccess = async (response: RazorpayResponse, course: Course) => {
    try {
      console.log('✅ Processing successful payment for course:', course.title);
      setPaymentSuccess('Payment successful! Verifying enrollment...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Verify payment and complete enrollment
      const verifyResponse = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/courses/verify-enrollment-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course._id,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify payment and complete enrollment');
      }

      const verifyData = await verifyResponse.json();
      console.log('✅ Enrollment completed:', verifyData);
      
      setPaymentSuccess(`🎉 Successfully enrolled in ${course.title}! You can now access the course content.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setPaymentSuccess(null);
      }, 5000);
      
    } catch (error) {
      console.error('❌ Failed to verify payment:', error);
      setPaymentError('Payment successful but enrollment verification failed. Please contact support.');
    }
  };

  // Function to handle enroll now button click
  const handleEnrollNow = (course: Course) => {
    console.log('🎓 Enroll Now clicked for course:', course.title);
    createCourseOrder(course);
  };

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Courses</h1>
        <p className="text-gray-600">Enhance your skills with our courses</p>
      </div>

      {/* Payment Success Message */}
      {paymentSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Payment Successful!</span>
          </div>
          <p className="text-green-700 text-sm mt-1">{paymentSuccess}</p>
          <button
            onClick={() => setPaymentSuccess(null)}
            className="mt-2 text-green-600 hover:text-green-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Payment Error Message */}
      {paymentError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Payment Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{paymentError}</p>
          <button
            onClick={() => setPaymentError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center mb-3">
          <Filter className="w-4 h-4 text-gray-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="business">Business</option>
              <option value="data-science">Data Science</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        
        {/* Clear Filters */}
        {(selectedCategory || selectedLevel) && (
          <button
            onClick={() => {
              setSelectedCategory('');
              setSelectedLevel('');
            }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Tab Buttons */}
      <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('online')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'online'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Play className="w-4 h-4 mr-2" />
          Online Courses
        </button>
        <button
          onClick={() => setActiveTab('offline')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'offline'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download className="w-4 h-4 mr-2" />
          Offline Courses
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading courses...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-medium mb-2">Failed to load courses</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Course Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No courses available</p>
              <p className="text-gray-400">Check back later for new {activeTab} courses</p>
            </div>
          ) : (
            courses.map((course) => {
              const priceInfo = formatPrice(course.price, course.originalPrice);
              const instructorName = getInstructorName(course.createdBy);
              
              return (
                <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Course Image */}
                  {course.thumbnail && (
                    <img 
                      src={`https://psmw75hs-3500.inc1.devtunnels.ms${course.thumbnail}`}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=300';
                      }}
                    />
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level}
                      </span>
                      {course.discountPercentage && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full">
                          {course.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {instructorName}</p>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span className="capitalize">{course.category}</span>
                      </div>
                      <div className="flex items-center">
                        <Play className="w-4 h-4 mr-1" />
                        <span className="capitalize">{course.courseType}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">₹{priceInfo.current.toLocaleString()}</span>
                        {priceInfo.hasDiscount && priceInfo.original && (
                          <span className="text-sm text-gray-500 line-through">₹{priceInfo.original.toLocaleString()}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleEnrollNow(course)}
                        disabled={processingPayment === course._id}
                        className={`px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          activeTab === 'online' 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600'
                            : 'bg-green-600 text-white hover:bg-green-700 disabled:hover:bg-green-600'
                        }`}
                      >
                        {processingPayment === course._id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Enroll Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}