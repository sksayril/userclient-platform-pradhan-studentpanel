import React, { useState, useEffect } from 'react';
import { Users, Award, Calendar, TrendingUp, UserCheck, FileText, CreditCard, DollarSign, Plus, Clock, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface SocietyMemberDashboardProps {
  onLogout: () => void;
}

interface PaymentRequest {
  id: string;
  title: string;
  amount: number;
  status: string;
  date: string;
  description: string;
}

export default function SocietyMemberDashboard({ onLogout }: SocietyMemberDashboardProps) {
  const memberData = JSON.parse(localStorage.getItem('societyMember') || '{}');
  const memberEmail = localStorage.getItem('societyMemberEmail') || '';
  
  // State for payment requests modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for pending payments modal
  const [isPendingPaymentsModalOpen, setIsPendingPaymentsModalOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<PaymentRequest[]>([]);
  const [pendingPaymentsLoading, setPendingPaymentsLoading] = useState(false);
  const [pendingPaymentsError, setPendingPaymentsError] = useState<string | null>(null);

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
      title: 'Payment Request',
      description: 'Submit new payment requests',
      icon: CreditCard,
      action: () => handlePaymentRequestClick(),
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Pending Payments',
      description: 'View and manage pending payments',
      icon: CreditCard,
      action: () => handlePendingPaymentsClick(),
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

  // Mock payment request data - fallback when API fails
  const mockPaymentRequests = [
    {
      id: '1',
      title: 'Monthly Membership Fee',
      amount: 5000,
      status: 'pending',
      date: '2024-06-15',
      description: 'June 2024 membership fee payment'
    },
    {
      id: '2',
      title: 'Event Registration',
      amount: 2500,
      status: 'approved',
      date: '2024-06-10',
      description: 'Annual conference registration fee'
    },
    {
      id: '3',
      title: 'Special Contribution',
      amount: 10000,
      status: 'rejected',
      date: '2024-06-05',
      description: 'Community development fund contribution'
    }
  ];

  // Function to handle payment request click
  const handlePaymentRequestClick = () => {
    setIsPaymentModalOpen(true);
    fetchPaymentRequests();
  };

  // Function to handle pending payments click
  const handlePendingPaymentsClick = () => {
    setIsPendingPaymentsModalOpen(true);
    fetchPendingPayments();
  };

  // Function to fetch payment requests from API
  const fetchPaymentRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3100/api/payment-requests/member/requests', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payment requests');
      }

      const data = await response.json();
      
      if (data && data.data) {
        setPaymentRequests(data.data);
      } else if (data && Array.isArray(data)) {
        setPaymentRequests(data);
      } else {
        // If API response is empty or invalid, use mock data
        setPaymentRequests(mockPaymentRequests);
      }
    } catch (error) {
      console.error('Failed to fetch payment requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch payment requests');
      // Fallback to mock data
      setPaymentRequests(mockPaymentRequests);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch pending payments from API
  const fetchPendingPayments = async () => {
    setPendingPaymentsLoading(true);
    setPendingPaymentsError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3100/api/payment-requests/member/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending payments');
      }

      const data = await response.json();
      
      if (data && data.data) {
        setPendingPayments(data.data);
      } else if (data && Array.isArray(data)) {
        setPendingPayments(data);
      } else {
        // If API response is empty or invalid, use empty array
        setPendingPayments([]);
      }
    } catch (error) {
      console.error('Failed to fetch pending payments:', error);
      setPendingPaymentsError(error instanceof Error ? error.message : 'Failed to fetch pending payments');
      // Set empty array on error
      setPendingPayments([]);
    } finally {
      setPendingPaymentsLoading(false);
    }
  };

  // Function to close payment modal
  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setError(null);
  };

  // Function to close pending payments modal
  const closePendingPaymentsModal = () => {
    setIsPendingPaymentsModalOpen(false);
    setPendingPaymentsError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <UserCheck className="w-4 h-4" />;
      case 'rejected':
        return <FileText className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

        {/* Payment Requests Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Requests
            </h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {mockPaymentRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                      <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {request.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{request.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">{request.status}</span>
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Process Payment
                      </button>
                    )}
                    {request.status === 'rejected' && (
                      <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {mockPaymentRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No payment requests found</p>
              <p className="text-sm">Create your first payment request to get started</p>
            </div>
          )}
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

      {/* Payment Requests Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Payment Requests
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage your payment requests
                  </p>
                </div>
              </div>
              <button
                onClick={closePaymentModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      {error}
                    </span>
                  </div>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                    Showing fallback data. Please try again later.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Fetching payment requests...</p>
                  </div>
                </div>
              )}

              {/* Payment Requests List */}
              {!loading && paymentRequests.length > 0 && (
                <div className="space-y-4">
                  {paymentRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {request.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{request.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(request.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Approve
                              </button>
                              <button className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Reject
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              Process Payment
                            </button>
                          )}
                          {request.status === 'rejected' && (
                            <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && paymentRequests.length === 0 && !error && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Payment Requests</p>
                  <p className="text-sm">You haven't made any payment requests yet.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {paymentRequests.length > 0 && (
                  <span>Total Requests: {paymentRequests.length}</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closePaymentModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={fetchPaymentRequests}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Payments Modal */}
      {isPendingPaymentsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Pending Payments
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage your pending payment obligations
                  </p>
                </div>
              </div>
              <button
                onClick={closePendingPaymentsModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Error Display */}
              {pendingPaymentsError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      {pendingPaymentsError}
                    </span>
                  </div>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                    Unable to fetch pending payments. Please try again later.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {pendingPaymentsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Fetching pending payments...</p>
                  </div>
                </div>
              )}

              {/* Pending Payments List */}
              {!pendingPaymentsLoading && pendingPayments.length > 0 && (
                <div className="space-y-4">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {payment.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {payment.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{payment.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {new Date(payment.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Pay Now
                          </button>
                          <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!pendingPaymentsLoading && pendingPayments.length === 0 && !pendingPaymentsError && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Pending Payments</p>
                  <p className="text-sm">You have no pending payment obligations at the moment.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {pendingPayments.length > 0 && (
                  <span>Total Pending: {pendingPayments.length}</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closePendingPaymentsModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={fetchPendingPayments}
                  disabled={pendingPaymentsLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {pendingPaymentsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
