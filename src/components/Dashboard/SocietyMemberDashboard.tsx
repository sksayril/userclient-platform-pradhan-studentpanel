import React, { useState, useEffect } from 'react';
import { Users, Award, Calendar, TrendingUp, UserCheck, FileText, CreditCard , Plus, Clock, X, Loader2, AlertCircle, RefreshCw, Gem, GraduationCap, AlertTriangle, User, CheckCircle, XCircle } from 'lucide-react';
import LoanApplication from './LoanApplication';

interface SocietyMemberDashboardProps {
  onLogout: () => void;
}

interface PaymentRequest {
  id?: string;
  requestId?: string;
  paymentType?: string;
  amount?: number;
  totalAmount?: number;
  dueDate?: string;
  status?: string;
  paymentMethod?: string;
  description?: string;
  isOverdue?: boolean;
  lateFee?: number;
  maturityDate?: string;
  duration?: number;
  // Legacy fields for backward compatibility
  title?: string;
  name?: string;
  date?: string;
  reason?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  updatedAt?: string;
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
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  
  // State for payment processing
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  
  // State for payment verification
  const [verifyingPayment, setVerifyingPayment] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
  
  // State for UPI payment
  const [processingUpiPayment, setProcessingUpiPayment] = useState<string | null>(null);
  const [upiPaymentError, setUpiPaymentError] = useState<string | null>(null);
  const [upiPaymentSuccess, setUpiPaymentSuccess] = useState<string | null>(null);
  
  // State for profile data
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // State for update profile modal
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] = useState(false);
  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  const [updateProfileError, setUpdateProfileError] = useState<string | null>(null);
  const [updateProfileSuccess, setUpdateProfileSuccess] = useState<string | null>(null);
  
  // State for change password modal
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  
  // State for membership data
  const [membershipData, setMembershipData] = useState<any>(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  
  // State for referrals data
  const [referralsData, setReferralsData] = useState<any>(null);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState<string | null>(null);
  
  // State for agent codes data
  const [agentCodesData, setAgentCodesData] = useState<any>(null);
  const [agentCodesLoading, setAgentCodesLoading] = useState(false);
  const [agentCodesError, setAgentCodesError] = useState<string | null>(null);
  const [isAgentCodesModalOpen, setIsAgentCodesModalOpen] = useState(false);
  
  // State for loan application modal
  const [isLoanApplicationModalOpen, setIsLoanApplicationModalOpen] = useState(false);
  
  // State for loans data
  const [loansData, setLoansData] = useState<any>(null);
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansError, setLoansError] = useState<string | null>(null);
  const [isLoansModalOpen, setIsLoansModalOpen] = useState(false);

  // State for individual loan details
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [loanDetails, setLoanDetails] = useState<any>(null);
  const [loanDetailsLoading, setLoanDetailsLoading] = useState(false);
  const [loanDetailsError, setLoanDetailsError] = useState<string | null>(null);
  const [isLoanDetailsModalOpen, setIsLoanDetailsModalOpen] = useState(false);

  // Debug loans modal state changes
  useEffect(() => {
    console.log('Loans modal state changed:', isLoansModalOpen);
  }, [isLoansModalOpen]);

  // Debug loans data changes
  useEffect(() => {
    console.log('Loans data changed:', {
      data: loansData,
      loading: loansLoading,
      error: loansError,
      dataLength: loansData ? (Array.isArray(loansData) ? loansData.length : 'Not array') : 'No data'
    });
  }, [loansData, loansLoading, loansError]);

  // Fetch profile data when component mounts
  useEffect(() => {
    fetchProfileData();
    fetchReferralsData();
  }, []);

  const stats = [
    {
      title: 'Account Status',
      value: profileData ? (profileData.status || 'Active') : (memberData.isAccountActive ? 'Active' : 'Inactive'),
      icon: UserCheck,
      color: profileData ? (profileData.status === 'active' ? 'bg-green-500' : 'bg-red-500') : (memberData.isAccountActive ? 'bg-green-500' : 'bg-red-500'),
      textColor: profileData ? (profileData.status === 'active' ? 'text-green-600' : 'text-red-600') : (memberData.isAccountActive ? 'text-green-600' : 'text-red-600')
    },
    {
      title: 'KYC Status',
      value: profileData ? (profileData.kycStatus || 'Pending') : (memberData.kycStatus || 'Pending'),
      icon: FileText,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Get All Agent Codes',
      value: agentCodesData ? `${agentCodesData.length || 0} codes` : 'Click to view',
      icon: Award,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Get Loans',
      value: "Loans",
      icon: Award,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Get All Loans Details',
      value: loansData ? `${loansData.length || 0} loans` : 'Click to view',
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    }
  ];

  const quickActions = [
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
    }
  ];

  // Mock payment request data - fallback when API fails
  // const mockPaymentRequests = [
  //   {
  //     id: '1',
  //     title: 'Monthly Membership Fee',
  //     amount: 5000,
  //     status: 'pending',
  //     date: '2024-06-15',
  //     description: 'June 2024 membership fee payment'
  //   },
  //   {
  //     id: '2',
  //     title: 'Event Registration',
  //     amount: 2500,
  //     status: 'approved',
  //     date: '2024-06-10',
  //     description: 'Annual conference registration fee'
  //   },
  //   {
  //     id: '3',
  //     title: 'Special Contribution',
  //     amount: 10000,
  //     status: 'rejected',
  //     date: '2024-06-05',
  //     description: 'Community development fund contribution'
  //   }
  // ];

  // Function to handle payment request click
  const handlePaymentRequestClick = () => {
    setIsPaymentModalOpen(true);
    fetchPaymentRequests();
  };

  // Function to handle pending payments click
  const handlePendingPaymentsClick = () => {
    console.log('Pending Payments clicked - opening modal and fetching data...');
    setIsPendingPaymentsModalOpen(true);
    fetchPendingPayments();
  };

  // Function to handle loan application click
  const handleLoanApplicationClick = () => {
    setIsLoanApplicationModalOpen(true);
  };

  // Function to handle loan application submission
  const handleLoanApplicationSubmit = async (loanData: any) => {
    try {
      // The API call is now handled in the LoanApplication component
      console.log('Loan application submitted successfully:', loanData);
      
      // You could add a toast notification here instead of alert
      // For now, we'll just log the success
      console.log('Loan application processed:', loanData);
      
      // The modal will be closed automatically by the LoanApplication component
      // after successful submission
    } catch (error) {
      console.error('Error in loan application submission handler:', error);
      // Re-throw the error so the LoanApplication component can handle it
      throw error;
    }
  };

  // Function to handle loans details click
  const handleLoansDetailsClick = () => {
    console.log('Get All Loans Details clicked - opening modal and fetching data...');
    setIsLoansModalOpen(true);
    fetchLoansData();
  };

  // Function to fetch individual loan details
  const fetchLoanDetails = async (loanId: string) => {
    setLoanDetailsLoading(true);
    setLoanDetailsError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`http://localhost:3500/api/loans/${loanId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to fetch loan details`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Loan details fetched successfully:', data);
      setLoanDetails(data);
    } catch (error) {
      console.error('Failed to fetch loan details:', error);
      setLoanDetailsError(error instanceof Error ? error.message : 'Failed to fetch loan details');
    } finally {
      setLoanDetailsLoading(false);
    }
  };

  // Function to handle loan item click
  const handleLoanClick = (loan: any) => {
    console.log('Loan clicked:', loan);
    setSelectedLoan(loan);
    setIsLoanDetailsModalOpen(true);
    fetchLoanDetails(loan.loanId);
  };

  // Function to fetch loans data
  const fetchLoansData = async () => {
    setLoansLoading(true);
    setLoansError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('http://localhost:3500/api/loans/my-loans', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to fetch loans`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Loans data fetched successfully:', data);
      console.log('Data structure:', {
        hasData: !!data,
        hasDataProperty: !!(data && data.data),
        isArray: Array.isArray(data),
        dataType: typeof data,
        keys: data ? Object.keys(data) : []
      });
      
      if (data && data.data) {
        console.log('Setting loans data from data.data:', data.data);
        setLoansData(data.data);
      } else if (data && Array.isArray(data)) {
        console.log('Setting loans data from array:', data);
        setLoansData(data);
      } else {
        console.log('Setting empty loans array');
        setLoansData([]);
      }
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      setLoansError(error instanceof Error ? error.message : 'Failed to fetch loans');
      setLoansData([]);
    } finally {
      setLoansLoading(false);
    }
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

      const response = await fetch('http://localhost:3500/api/payment-requests/member/requests', {
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
        // If API response is empty or invalid, use empty array
        setPaymentRequests([]);
      }
    } catch (error) {
      console.error('Failed to fetch payment requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch payment requests');
      // Fallback to empty array
      setPaymentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to create Razorpay order
  const createRazorpayOrder = async (requestId: string) => {
    // Validate requestId
    if (!requestId || requestId.trim() === '') {
      setPaymentError('Invalid request ID. Please try again.');
      return;
    }
    
    setProcessingPayment(requestId);
    setPaymentError(null);
    setPaymentSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('http://localhost:3500/api/payment-requests/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId
        }),
      });

      console.log('Payment API Response status:', response.status);
      console.log('Payment API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to create payment order`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          // If response can't be parsed as JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Payment API Response data:', data);
      
      if (data && data.success) {
        setPaymentSuccess(`Payment order created successfully for ${requestId}`);
        // Refresh pending payments to show updated status
        setTimeout(() => {
          fetchPendingPayments();
        }, 2000);
        console.log('Payment order created:', data);
      } else {
        throw new Error(data.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Failed to create payment order:', error);
      
      let errorMessage = 'Failed to create payment order';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to payment server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: Payment service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied: You are not authorized to perform this action';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Payment endpoint not found. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setPaymentError(errorMessage);
    } finally {
      setProcessingPayment(null);
    }
  };

  // Function to verify Razorpay payment
  const verifyRazorpayPayment = async (requestId: string) => {
    // Validate requestId
    if (!requestId || requestId.trim() === '') {
      setVerificationError('Invalid request ID. Please try again.');
      return;
    }
    
    setVerifyingPayment(requestId);
    setVerificationError(null);
    setVerificationSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Test payment ID and signature (as requested)
      const testPaymentId = 'pay_1234567890';
      const testSignature = 'razorpay_signature_here';
      
      console.log('Verifying Razorpay payment for requestId:', requestId);
      console.log('Request URL:', 'http://localhost:3500/verify-razorpay-payment');
      console.log('Request body:', { 
        requestId: requestId, 
        paymentId: testPaymentId, 
        signature: testSignature 
      });
      
      const response = await fetch('http://localhost:3500/api/payment-requests/verify-razorpay-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          paymentId: testPaymentId,
          signature: testSignature
        }),
      });

      console.log('Verification API Response status:', response.status);
      console.log('Verification API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to verify payment`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          // If response can't be parsed as JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      
      if (data && data.success) {
        setVerificationSuccess(`Payment verified successfully for ${requestId}`);
        // Refresh pending payments to show updated status
        setTimeout(() => {
          fetchPendingPayments();
        }, 2000);
        console.log('Payment verified:', data);
      } else {
        throw new Error(data.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      
      let errorMessage = 'Failed to verify payment';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to verification server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: Verification service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied: You are not authorized to perform this action';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Verification endpoint not found. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setVerificationError(errorMessage);
    } finally {
      setVerifyingPayment(null);
    }
  };

  // Function to process UPI payment
  const processUpiPayment = async (requestId: string) => {
    // Validate requestId
    if (!requestId || requestId.trim() === '') {
      setUpiPaymentError('Invalid request ID. Please try again.');
      return;
    }
    
    setProcessingUpiPayment(requestId);
    setUpiPaymentError(null);
    setUpiPaymentSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Processing UPI payment for requestId:', requestId);
      console.log('Request URL:', 'http://localhost:3500/api/payment-requests/process-upi-payment');
      console.log('Request body:', { 
        requestId: requestId,
        paymentMethod: 'UPI'
      });
      
      const response = await fetch('http://localhost:3500/api/payment-requests/process-upi-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          paymentMethod: 'UPI'
        }),
      });

      console.log('UPI Payment API Response status:', response.status);
      console.log('UPI Payment API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to process UPI payment`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          // If response can't be parsed as JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
    
      if (data && data.success) {
        setUpiPaymentSuccess(`UPI payment initiated successfully for ${requestId}`);
        // Refresh pending payments to show updated status
        setTimeout(() => {
          fetchPendingPayments();
        }, 2000);
        console.log('UPI payment processed:', data);
      } else {
        throw new Error(data.message || 'Failed to process UPI payment');
      }
    } catch (error) {
      console.error('Failed to process UPI payment:', error);
      
      let errorMessage = 'Failed to process UPI payment';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to UPI payment server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: UPI payment service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied: You are not authorized to perform this action';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'UPI payment endpoint not found. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setUpiPaymentError(errorMessage);
    } finally {
      setProcessingUpiPayment(null);
    }
  };

  // Function to fetch society member profile
  const fetchProfileData = async () => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching society member profile...');
      console.log('Request URL:', 'http://localhost:3500/api/society-member/profile');
      
      const response = await fetch('http://localhost:3500/api/society-member/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile API Response status:', response.status);
      console.log('Profile API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to fetch profile`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          // If response can't be parsed as JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
  
      
      if (data && data.success && data.data) {
        setProfileData(data.data);
        console.log('Profile data set successfully:', data.data);
      } else if (data && data.data) {
        setProfileData(data.data);
        console.log('Profile data set successfully:', data.data);
      } else {
        throw new Error('Invalid profile data format received');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      
      let errorMessage = 'Failed to fetch profile data';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to profile server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: Profile service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied: You are not authorized to access profile data';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Profile endpoint not found. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setProfileError(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  // Function to update profile
  const updateProfile = async (formData: any) => {
    setUpdateProfileLoading(true);
    setUpdateProfileError(null);
    setUpdateProfileSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      
      const response = await fetch('http://localhost:3500/api/society-member/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Update Profile API Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to update profile`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Update Profile API Response data:', data);
      
      if (data && data.success) {
        setUpdateProfileSuccess('Profile updated successfully!');
        // Refresh profile data to show updated information
        setTimeout(() => {
          fetchProfileData();
        }, 2000);
        console.log('Profile updated successfully:', data);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      
      let errorMessage = 'Failed to update profile';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to profile server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: Profile update service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied: You are not authorized to update profile';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Profile update endpoint not found. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setUpdateProfileError(errorMessage);
    } finally {
      setUpdateProfileLoading(false);
    }
  };

  // Function to change password
  const changePassword = async (formData: { currentPassword: string; newPassword: string }) => {
    setChangePasswordLoading(true);
    setChangePasswordError(null);
    setChangePasswordSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Changing password...');
      console.log('Request URL:', 'http://localhost:3500/api/society-member/change-password');
      
      const response = await fetch('http://localhost:3500/api/society-member/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Change Password API Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to change password`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Change Password API Response data:', data);
      
      if (data && data.success) {
        setChangePasswordSuccess('Password changed successfully!');
        console.log('Password changed successfully:', data);
        // Close modal after 2 seconds
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setChangePasswordSuccess(null);
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      
      let errorMessage = 'Failed to change password';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to password change server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: Password change service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied: You are not authorized to change password';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Password change endpoint not found. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setChangePasswordError(errorMessage);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Function to fetch membership data
  const fetchMembershipData = async () => {
    setMembershipLoading(true);
    setMembershipError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching membership data...');
      console.log('Request URL:', 'http://localhost:3500/api/society-member/membership');
      
      const response = await fetch('http://localhost:3500/api/society-member/membership', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Membership API Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to fetch membership data`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Membership API Response data:', data);
      
      if (data && data.success && data.data) {
        setMembershipData(data.data);
        console.log('Membership data set successfully:', data.data);
      } else if (data && data.data) {
        setMembershipData(data.data);
        console.log('Membership data set successfully:', data.data);
      } else {
        throw new Error('Invalid membership data format received');
      }
    } catch (error) {
      console.error('Failed to fetch membership data:', error);
      
      let errorMessage = 'Failed to fetch membership data';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to membership server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: Membership service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied: You are not authorized to access membership data';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Membership endpoint not found. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMembershipError(errorMessage);
    } finally {
      setMembershipLoading(false);
    }
  };

  // Function to fetch referrals data
  const fetchReferralsData = async () => {
    setReferralsLoading(true);
    setReferralsError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching referrals data...');
      console.log('Request URL:', 'http://localhost:3500/api/society-member/referrals');
      
      const response = await fetch('http://localhost:3500/api/society-member/referrals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Referrals API Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to fetch referrals data`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Referrals API Response data:', data);
      
      if (data && data.success && data.data) {
        setReferralsData(data.data);
        console.log('Referrals data set successfully:', data.data);
      } else if (data && data.data) {
        setReferralsData(data.data);
        console.log('Referrals data set successfully:', data.data);
      } else {
        throw new Error('Invalid referrals data format received');
      }
    } catch (error) {
      console.error('Failed to fetch referrals data:', error);
      
      let errorMessage = 'Failed to fetch referrals data';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to referrals server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: Referrals service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied: You are not authorized to access referrals data';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Referrals endpoint not found. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setReferralsError(errorMessage);
    } finally {
      setReferralsLoading(false);
    }
  };

  // Function to fetch agent codes data
  const fetchAgentCodesData = async () => {
    setAgentCodesLoading(true);
    setAgentCodesError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching agent codes data...');
      console.log('Request URL:', 'http://localhost:3500/api/society-member/agent-codes');
      
      const response = await fetch('http://localhost:3500/api/society-member/agent-codes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Agent Codes API Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to fetch agent codes data`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Agent Codes API Response data:', data);
      
      if (data && data.success && data.data) {
        setAgentCodesData(data.data);
        console.log('Agent codes data set successfully:', data.data);
      } else if (data && data.data) {
        setAgentCodesData(data.data);
        console.log('Agent codes data set successfully:', data.data);
      } else {
        throw new Error('Invalid agent codes data format received');
      }
    } catch (error) {
      console.error('Failed to fetch agent codes data:', error);
      
      let errorMessage = 'Failed to fetch agent codes data';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to agent codes server';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error: Agent codes service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication error: Please login again';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Access denied: You are not authorized to access agent codes data';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Agent codes endpoint not found. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAgentCodesError(errorMessage);
    } finally {
      setAgentCodesLoading(false);
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

      console.log('Fetching pending payments from API...');
      const response = await fetch('http://localhost:3500/api/payment-requests/member/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending payments');
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data && data.success && data.data && data.data.requests) {
        console.log('Setting pending payments from data.data.requests:', data.data.requests);
        setPendingPayments(data.data.requests);
        // Store total amounts from API response
        if (data.data.totalPendingAmount !== undefined) {
          setTotalPendingAmount(data.data.totalPendingAmount);
        }
        if (data.data.totalPendingCount !== undefined) {
          setTotalPendingCount(data.data.totalPendingCount);
        }
      } else if (data && data.data && Array.isArray(data.data)) {
        console.log('Setting pending payments from data.data array:', data.data);
        setPendingPayments(data.data);
      } else if (data && Array.isArray(data)) {
        console.log('Setting pending payments from data array:', data);
        setPendingPayments(data);
      } else {
        console.log('API response is empty or invalid, setting empty array');
        setPendingPayments([]);
        setTotalPendingAmount(0);
        setTotalPendingCount(0);
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
    // Clear payment messages when modal is closed
    setPaymentSuccess(null);
    setPaymentError(null);
    setProcessingPayment(null);
    // Clear verification messages when modal is closed
    setVerificationSuccess(null);
    setVerificationError(null);
    setVerifyingPayment(null);
    // Clear UPI payment messages when modal is closed
    setUpiPaymentSuccess(null);
    setUpiPaymentError(null);
    setProcessingUpiPayment(null);
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
                {profileLoading ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading profile...</span>
                  </span>
                ) : profileError ? (
                  <span className="text-red-600 dark:text-red-400">
                    Error loading profile: {profileError}
                  </span>
                ) : profileData ? (
                  `Welcome back, ${profileData.firstName || profileData.name || 'Member'} ${profileData.lastName || ''}`
                ) : (
                  `Welcome back, ${memberData.firstName} ${memberData.lastName}`
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {profileData ? (profileData.memberAccountNumber || profileData.memberId || profileData.id || 'N/A') : (memberData.memberAccountNumber || 'N/A')}
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
            <div 
              key={index} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${
                (stat.title === 'Get All Agent Codes' || stat.title === 'Get Loans' || stat.title === 'Get All Loans Details') ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''
              }`}
              onClick={stat.title === 'Get All Agent Codes' ? () => {
                setIsAgentCodesModalOpen(true);
                fetchAgentCodesData();
              } : stat.title === 'Get Loans' ? () => {
                handleLoanApplicationClick();
              } : stat.title === 'Get All Loans Details' ? () => {
                handleLoansDetailsClick();
              } : undefined}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  {stat.title === 'Get All Agent Codes' && agentCodesLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : stat.title === 'Get All Agent Codes' && agentCodesError ? (
                    <p className="text-sm text-red-500">Error loading</p>
                  ) : stat.title === 'Get All Loans Details' && loansLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : stat.title === 'Get All Loans Details' && loansError ? (
                    <p className="text-sm text-red-500">Error loading</p>
                  ) : (
                    <p className={`text-lg font-semibold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Referral Code Section - Enhanced */}
        {referralsData && referralsData.referralCode && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                    Your Referral Code
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    Share this code with others to earn rewards
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-600">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Referral Code
                  </p>
                  <div className="flex items-center space-x-3">
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 font-mono tracking-wider">
                      {referralsData.referralCode}
                    </p>
                    <button
                      onClick={() => {
                        if (referralsData.referralCode) {
                          navigator.clipboard.writeText(referralsData.referralCode);
                          // You could add a toast notification here
                        }
                      }}
                      className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Copy referral code"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                    Click the icon to copy
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg inline-block mb-2">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Share with Friends</p>
                <p className="text-xs text-blue-500 dark:text-blue-400">Invite others to join</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg inline-block mb-2">
                  <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Earn Rewards</p>
                <p className="text-xs text-green-500 dark:text-green-400">Get benefits for referrals</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg inline-block mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Grow Community</p>
                <p className="text-xs text-purple-500 dark:text-purple-400">Help expand our network</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {profileData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsUpdateProfileModalOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Update Profile</span>
                </button>
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={fetchProfileData}
                  disabled={profileLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Refreshing...</span>
                  </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {profileError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-200 font-medium">
                    Profile Error
                  </span>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  {profileError}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profileData.firstName || profileData.name || 'N/A'} {profileData.lastName || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profileData.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profileData.phone || profileData.mobile || 'N/A'}
                    </p>
                  </div>
                  {profileData.dateOfBirth && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(profileData.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Membership Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Membership Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {profileData.memberAccountNumber || profileData.memberId || profileData.id || 'N/A'}
                    </p>
                  </div>
                  <div 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    onClick={() => {
                      setIsMembershipModalOpen(true);
                      fetchMembershipData();
                    }}
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                      <span>
                        {profileData.memberSince ? new Date(profileData.memberSince).toLocaleDateString() : profileData.registrationDate ? new Date(profileData.registrationDate).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 text-xs">(Click to view details)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      profileData.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' :
                      profileData.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400' :
                      profileData.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {profileData.status || 'N/A'}
                    </span>
                  </div>
                  {profileData.membershipType && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Membership Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profileData.membershipType}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Additional Details
                </h3>
                <div className="space-y-3">
                  {profileData.address && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Correspondense Address</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profileData.address.street || 'N/A'}
                      </p>
                    </div>
                  )}
                  {profileData.address && profileData.address.city && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">City</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profileData.address.city}
                      </p>
                    </div>
                  )}
                  {profileData.address && profileData.address.state && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">State</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profileData.address.state}
                      </p>
                    </div>
                  )}
                  {profileData.address && profileData.address.pincode && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pincode</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profileData.address.pincode}
                      </p>
                    </div>
                  )}
                  {profileData.gender && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {profileData.gender}
                      </p>
                    </div>
                  )}
                  {profileData.agentCode && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Agent Code</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profileData.agentCode}
                      </p>
                    </div>
                  )}
                  {profileData.referredBy && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Referred By</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profileData.referredBy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KYC Documents Section */}
        {profileData && profileData.kycDocuments && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              KYC Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profileData.kycDocuments.aadharCard && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Aadhar Card
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {profileData.kycDocuments.aadharCard.number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Document Preview</p>
                      <div className="relative group">
                        <img
                          src={`http://localhost:3500/${profileData.kycDocuments.aadharCard.document.replace(/\\/g, '/').replace('C:/Users/sksay/Desktop/pradhan/pradhan-schoolmanagement-apis/', '')}`}
                          alt="Aadhar Card"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC40NTcgMTEwIDExOSAxMDEuNDU3IDExOSA5MUMxMTkgODAuNTQzIDExMC40NTcgNzIgMTAwIDcyQzg5LjU0MyA3MiA4MSA4MC41NDMgODEgOTFDODEgMTAxLjQ1NyA4OS41NDMgMTEwIDEwMCAxMTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTI4QzExMC40NTcgMTI4IDExOSAxMTkuNDU3IDExOSAxMDlDMTE5IDk4LjU0MyAxMTAuNDU3IDkwIDEwMCA5MEM4OS41NDMgOTAgODEgOTguNTQzIDgxIDEwOUM4MSAxMTkuNDU3IDg5LjU0MyAxMjggMTAwIDEyOFoiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Click to view full size
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {profileData.kycDocuments.panCard && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                    PAN Card
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {profileData.kycDocuments.panCard.number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Document Preview</p>
                      <div className="relative group">
                        <img
                          src={`http://localhost:3500/${profileData.kycDocuments.panCard.document.replace(/\\/g, '/').replace('C:/Users/sksay/Desktop/pradhan/pradhan-schoolmanagement-apis/', '')}`}
                          alt="PAN Card"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC40NTcgMTEwIDExOSAxMDEuNDU3IDExOSA5MUMxMTkgODAuNTQzIDExMC40NTcgNzIgMTAwIDcyQzg5LjU0MyA3MiA4MSA4MC41NDMgODEgOTFDODEgMTAxLjQ1NyA4OS41NDMgMTEwIDEwMCAxMTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTI4QzExMC40NTcgMTI4IDExOSAxMTkuNDU3IDExOSAxMDlDMTE5IDk4LjU0MyAxMTAuNDU3IDkwIDEwMCA5MEM4OS41NDMgOTAgODEgOTguNTQzIDgxIDEwOUM4MSAxMTkuNDU3IDg5LjU0MyAxMjggMTAwIDEyOFoiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Click to view full size
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {profileData.kycDocuments.profilePhoto && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Profile Photo
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Photo Preview</p>
                      <div className="relative group">
                        <img
                          src={`http://localhost:3500/${profileData.kycDocuments.profilePhoto.replace(/\\/g, '/').replace('C:/Users/sksay/Desktop/pradhan/pradhan-schoolmanagement-apis/', '')}`}
                          alt="Profile Photo"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC40NTcgMTEwIDExOSAxMDEuNDU3IDExOSA5MUMxMTkgODAuNTQzIDExMC40NTcgNzIgMTAwIDcyQzg5LjU0MyA3MiA4MSA4MC41NDMgODEgOTFDODEgMTAxLjQ1NyA4OS41NDMgMTEwIDEwMCAxMTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTI4QzExMC40NTcgMTI4IDExOSAxMTkuNDU3IDExOSAxMDlDMTE5IDk4LjU0MyAxMTAuNDU3IDkwIDEwMCA5MEM4OS41NDMgOTAgODEgOTguNTQzIDgxIDEwOUM4MSAxMTkuNDU3IDg5LjU0MyAxMjggMTAwIDEyOFoiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Click to view full size
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Document Status Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Status</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Aadhar Card: {profileData.kycDocuments.aadharCard ? 'Uploaded' : 'Not Uploaded'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${profileData.kycDocuments.panCard ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    PAN Card: {profileData.kycDocuments.panCard ? 'Uploaded' : 'Not Uploaded'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${profileData.kycDocuments.profilePhoto ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Profile Photo: {profileData.kycDocuments.profilePhoto ? 'Uploaded' : 'Not Uploaded'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Surety Contact Section */}
        {profileData && profileData.emergencyContact && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Surety Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profileData.emergencyContact.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Relationship</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profileData.emergencyContact.relationship}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profileData.emergencyContact.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
          
          {/* <div className="space-y-4">
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
          )} */}
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
                            ₹{(request.amount || 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {request.date ? new Date(request.date).toLocaleDateString() : 'Date not specified'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status || 'pending')}`}>
                          {getStatusIcon(request.status || 'pending')}
                          <span className="ml-1 capitalize">{request.status || 'pending'}</span>
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {(request.status || 'pending') === 'pending' && (
                            <>
                              <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Approve
                              </button>
                              <button className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Reject
                              </button>
                            </>
                          )}
                          {(request.status || 'pending') === 'approved' && (
                            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              Process Payment
                            </button>
                          )}
                          {(request.status || 'pending') === 'rejected' && (
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
              {/* Payment Success Message */}
              {paymentSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      Payment Order Created Successfully!
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    {paymentSuccess}
                  </p>
                  <button
                    onClick={() => setPaymentSuccess(null)}
                    className="mt-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Payment Error Message */}
              {paymentError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      Payment Error
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {paymentError}
                  </p>
                  <button
                    onClick={() => setPaymentError(null)}
                    className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Payment Verification Success Message */}
              {verificationSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      Payment Verification Successful!
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    {verificationSuccess}
                  </p>
                  <button
                    onClick={() => setVerificationSuccess(null)}
                    className="mt-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Payment Verification Error Message */}
              {verificationError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      Verification Error
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {verificationError}
                  </p>
                  <button
                    onClick={() => setVerificationError(null)}
                    className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* UPI Payment Success Message */}
              {upiPaymentSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      UPI Payment Initiated Successfully!
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    {upiPaymentSuccess}
                  </p>
                  <button
                    onClick={() => setUpiPaymentSuccess(null)}
                    className="mt-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* UPI Payment Error Message */}
              {upiPaymentError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      UPI Payment Error
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {upiPaymentError}
                  </p>
                  <button
                    onClick={() => setUpiPaymentError(null)}
                    className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

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

              {/* API Response Display */}
              {!pendingPaymentsLoading && pendingPayments.length > 0 && (
                <div className="space-y-4">
                  {/* Response Header */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                     
                    </div>
                                      <p className="text-sm text-blue-700 dark:text-blue-300">
                    Total pending requests: <span className="font-semibold">{totalPendingCount > 0 ? totalPendingCount : pendingPayments.length}</span>
                    {totalPendingAmount > 0 && (
                      <span className="ml-4">
                        Total amount: <span className="font-semibold">₹{totalPendingAmount.toLocaleString()}</span>
                      </span>
                    )}
                  </p>
                  </div>

                  {/* Payment Requests List */}
                  {pendingPayments.map((payment, index) => (
                    <div key={payment.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md">
                      {/* Request Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl">
                            <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {payment.paymentType ? `${payment.paymentType} Payment` : payment.title || payment.name || `Payment Request ${index + 1}`}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                              {payment.description || payment.reason || 'Payment request details'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            ₹{(payment.totalAmount || payment.amount || 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.dueDate ? `Due: ${new Date(payment.dueDate).toLocaleDateString()}` : payment.date ? `Due: ${new Date(payment.date).toLocaleDateString()}` : 'Date not specified'}
                          </div>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Request ID:</span>
                            <span className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {payment.requestId || payment.id || `REQ-${index + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status || 'pending')}`}>
                              {getStatusIcon(payment.status || 'pending')}
                              <span className="ml-1 capitalize">{payment.status || 'pending'}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method:</span>
                            <span className="text-sm text-gray-900 dark:text-white bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">
                              {payment.paymentMethod || 'Not specified'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Type:</span>
                            <span className="text-sm text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                              {payment.paymentType || 'Not specified'}
                            </span>
                          </div>
                          {payment.duration && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration:</span>
                              <span className="text-sm text-gray-900 dark:text-white bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                                {payment.duration} months
                              </span>
                            </div>
                          )}
                          {payment.maturityDate && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Maturity Date:</span>
                              <span className="text-sm text-gray-900 dark:text-white bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">
                                {new Date(payment.maturityDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Details */}
                      {(payment.isOverdue !== undefined || payment.lateFee !== undefined) && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {payment.isOverdue !== undefined && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Overdue:</span>
                                <span className={`text-sm px-2 py-1 rounded ${
                                  payment.isOverdue ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                }`}>
                                  {payment.isOverdue ? 'Yes' : 'No'}
                                </span>
                              </div>
                            )}
                            {payment.lateFee !== undefined && payment.lateFee > 0 && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Late Fee:</span>
                                <span className="text-sm text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                                  ₹{payment.lateFee.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => createRazorpayOrder(payment.requestId || payment.id || '')}
                            disabled={processingPayment === (payment.requestId || payment.id)}
                            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                              processingPayment === (payment.requestId || payment.id)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {processingPayment === (payment.requestId || payment.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                <span>Pay Now</span>
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => processUpiPayment(payment.requestId || payment.id || '')}
                            disabled={processingUpiPayment === (payment.requestId || payment.id)}
                            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                              processingUpiPayment === (payment.requestId || payment.id)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            {processingUpiPayment === (payment.requestId || payment.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                <span>UPI Payment</span>
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => verifyRazorpayPayment(payment.requestId || payment.id || '')}
                            disabled={verifyingPayment === (payment.requestId || payment.id)}
                            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                              verifyingPayment === (payment.requestId || payment.id)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {verifyingPayment === (payment.requestId || payment.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4" />
                                <span>Verify Payments</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Last updated: {payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : 'N/A'}
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

      {/* Membership Details Modal */}
      {isMembershipModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Membership Details
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View your complete membership information and benefits
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMembershipModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Key Membership Details - Prominently Displayed */}
              {!membershipLoading && membershipData && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Membership Start Date</p>
                      <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                        {membershipData.membershipStartDate ? new Date(membershipData.membershipStartDate).toLocaleDateString() : 'N/A'}
                      </p>
                      {membershipData.membershipStartDate && (
                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                          {new Date(membershipData.membershipStartDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Membership Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        (membershipData.membershipStatus || membershipData.status) === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' :
                        (membershipData.membershipStatus || membershipData.status) === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400' :
                        (membershipData.membershipStatus || membershipData.status) === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {membershipData.membershipStatus || membershipData.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {membershipError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      {membershipError}
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    Unable to fetch membership data. Please try again later.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {membershipLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Fetching membership details...</p>
                  </div>
                </div>
              )}

              {/* Membership Data Display */}
              {!membershipLoading && membershipData && (
                <div className="space-y-6">
                  {/* Membership Overview */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                        Membership Overview
                      </h3>
                    </div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-blue-600 dark:text-blue-400">Membership Type</p>
                          <p className="text-lg font-bold text-blue-800 dark:text-blue-200 capitalize">
                            {membershipData.membershipType || 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-blue-600 dark:text-blue-400">Start Date</p>
                          <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                            {membershipData.membershipStartDate ? new Date(membershipData.membershipStartDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-blue-600 dark:text-blue-400">Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            (membershipData.membershipStatus || membershipData.status) === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' :
                            (membershipData.membershipStatus || membershipData.status) === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400' :
                            (membershipData.membershipStatus || membershipData.status) === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {membershipData.membershipStatus || membershipData.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                  </div>

                  {/* Membership Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Membership Information */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                        Membership Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {membershipData.membershipStartDate ? new Date(membershipData.membershipStartDate).toLocaleDateString() : 
                             membershipData.startDate ? new Date(membershipData.startDate).toLocaleDateString() : 'N/A'}
                          </p>
                          {membershipData.membershipStartDate && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(membershipData.membershipStartDate).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Membership Valid</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            membershipData.isMembershipValid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
                          }`}>
                            {membershipData.isMembershipValid ? 'Valid' : 'Invalid'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Membership Active</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            membershipData.isMembershipActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
                          }`}>
                            {membershipData.isMembershipActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {membershipData.membershipLevel && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Membership Level</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {membershipData.membershipLevel}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                        Financial Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Contribution</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            ₹{membershipData.monthlyContribution ? membershipData.monthlyContribution.toLocaleString() : '0'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Contribution</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ₹{membershipData.totalContribution ? membershipData.totalContribution.toLocaleString() : '0'}
                          </p>
                        </div>
                        {membershipData.pendingAmount && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              ₹{membershipData.pendingAmount.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {membershipData.lastPaymentDate && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Last Payment Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(membershipData.lastPaymentDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Benefits and Features */}
                  {membershipData.benefits && membershipData.benefits.length > 0 && (
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                        Membership Benefits
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {membershipData.benefits.map((benefit: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                              <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {benefit.name || benefit.description || benefit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {membershipData.additionalInfo && (
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                        Additional Information
                      </h3>
                      <div className="space-y-4">
                        {membershipData.additionalInfo.notes && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {membershipData.additionalInfo.notes}
                            </p>
                          </div>
                        )}
                        {membershipData.additionalInfo.terms && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Terms & Conditions</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {membershipData.additionalInfo.terms}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!membershipLoading && !membershipData && !membershipError && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Membership Data</p>
                  <p className="text-sm">Unable to load membership information at this time.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {membershipData && (
                  <span>Membership Status: <span className="font-semibold capitalize">{membershipData.membershipStatus || membershipData.status || 'Unknown'}</span></span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsMembershipModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={fetchMembershipData}
                  disabled={membershipLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {membershipLoading ? (
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

      {/* Agent Codes Modal */}
      {isAgentCodesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    All Agent Codes
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage all available agent codes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAgentCodesModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Error Display */}
              {agentCodesError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      {agentCodesError}
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    Unable to fetch agent codes data. Please try again later.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {agentCodesLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Fetching agent codes...</p>
                  </div>
                </div>
              )}

              {/* Agent Codes Data Display */}
              {!agentCodesLoading && agentCodesData && (
                <div className="space-y-6">
                  {/* Summary Section */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                        Agent Codes Summary
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-orange-600 dark:text-orange-400">Total Codes</p>
                        <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                          {Array.isArray(agentCodesData) ? agentCodesData.length : 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-orange-600 dark:text-orange-400">Active Codes</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Array.isArray(agentCodesData) ? agentCodesData.filter((code: any) => code.status === 'active' || code.isActive).length : 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-orange-600 dark:text-orange-400">Inactive Codes</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {Array.isArray(agentCodesData) ? agentCodesData.filter((code: any) => code.status === 'inactive' || !code.isActive).length : 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Codes List */}
                  {Array.isArray(agentCodesData) && agentCodesData.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Agent Codes List
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agentCodesData.map((code: any, index: number) => (
                          <div key={index} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                  <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {code.code || code.agentCode || `Code ${index + 1}`}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {code.name || code.agentName || 'Agent Name'}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                (code.status || code.isActive) === 'active' || code.isActive === true ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' :
                                (code.status || code.isActive) === 'inactive' || code.isActive === false ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {code.status || (code.isActive ? 'Active' : 'Inactive')}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {code.phone && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Phone:</span>
                                  <span className="text-sm text-gray-900 dark:text-white">{code.phone}</span>
                                </div>
                              )}
                              {code.email && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Email:</span>
                                  <span className="text-sm text-gray-900 dark:text-white">{code.email}</span>
                                </div>
                              )}
                              {code.location && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Location:</span>
                                  <span className="text-sm text-gray-900 dark:text-white">{code.location}</span>
                                </div>
                              )}
                              {code.commission && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Commission:</span>
                                  <span className="text-sm text-gray-900 dark:text-white">{code.commission}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No Agent Codes Found</p>
                      <p className="text-sm">No agent codes are available at the moment.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!agentCodesLoading && !agentCodesData && !agentCodesError && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Agent Codes Data</p>
                  <p className="text-sm">Unable to load agent codes information at this time.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {agentCodesData && Array.isArray(agentCodesData) && (
                  <span>Total Agent Codes: <span className="font-semibold">{agentCodesData.length}</span></span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsAgentCodesModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={fetchAgentCodesData}
                  disabled={agentCodesLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {agentCodesLoading ? (
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

            {/* Loans Details Modal */}
      {isLoansModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    All Loans Details
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage all your loan applications
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLoansModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Error Display */}
              {loansError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      {loansError}
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    Unable to fetch loans data. Please try again later.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {loansLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Fetching loans data...</p>
                  </div>
                </div>
              )}

              {/* Loans Data Display */}
              {!loansLoading && loansData && (
                <div className="space-y-6">
                  {/* Summary Section */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                        Loans Summary
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Total Loans</p>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                          {loansData.pagination?.totalLoans || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Active Loans</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {loansData.loans?.filter((loan: any) => loan.status === 'APPROVED').length || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Pending Loans</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {loansData.loans?.filter((loan: any) => loan.status === 'PENDING').length || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Rejected Loans</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {loansData.loans?.filter((loan: any) => loan.status === 'REJECTED').length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Loans List */}
                  {loansData.loans && loansData.loans.length > 0 ? (
                    <div className="space-y-4">
                      {loansData.loans.map((loan: any, index: number) => (
                        <div 
                          key={loan.loanId || index} 
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                          onClick={() => handleLoanClick(loan)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                loan.loanType === 'GOLD' ? 'bg-yellow-100 dark:bg-yellow-900' :
                                loan.loanType === 'EDUCATION' ? 'bg-blue-100 dark:bg-blue-900' :
                                loan.loanType === 'EMERGENCY' ? 'bg-red-100 dark:bg-red-900' :
                                'bg-green-100 dark:bg-green-900'
                              }`}>
                                {loan.loanType === 'GOLD' ? <Gem className="w-5 h-5 text-yellow-600" /> :
                                 loan.loanType === 'EDUCATION' ? <GraduationCap className="w-5 h-5 text-blue-600" /> :
                                 loan.loanType === 'EMERGENCY' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                                 <User className="w-5 h-5 text-gray-600" />}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {loan.loanType} Loan
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  ID: {loan.loanId}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                ₹{loan.amount?.toLocaleString() || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {loan.duration} months
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Purpose</p>
                              <p className="font-medium text-gray-900 dark:text-white">{loan.purpose || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                loan.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                loan.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {loan.status || 'UNKNOWN'}
                              </span>
                            </div>
                          </div>

                        
                          {/* {loan.loanType === 'GOLD' && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Gold Loan Details</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-yellow-600 dark:text-yellow-400">Type:</span> {loan.collateralType?.replace('_', ' ') || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-yellow-600 dark:text-yellow-400">Weight:</span> {loan.collateralWeight || 'N/A'}g
                                </div>
                                <div>
                                  <span className="text-yellow-600 dark:text-yellow-400">Purity:</span> {loan.collateralPurity || 'N/A'}%
                                </div>
                                <div>
                                  <span className="text-yellow-600 dark:text-yellow-400">Value:</span> ₹{loan.collateralEstimatedValue?.toLocaleString() || 'N/A'}
                                </div>
                              </div>
                            </div>
                          )} */}

                          {/* {loan.loanType === 'EDUCATION' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Education Loan Details</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-blue-600 dark:text-blue-400">Institution:</span> {loan.institution || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-blue-600 dark:text-blue-400">Course:</span> {loan.course || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-blue-600 dark:text-blue-400">Duration:</span> {loan.courseDuration || 'N/A'}
                                </div>
                              </div>
                            </div>
                          )}

                          {loan.loanType === 'EMERGENCY' && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Emergency Loan Details</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-red-600 dark:text-red-400">Type:</span> {loan.emergencyType?.replace('_', ' ') || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-red-600 dark:text-red-400">Urgency:</span> {loan.urgency || 'N/A'}
                                </div>
                              </div>
                            </div>
                          )}

                          {loan.loanType === 'PERSONAL' && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Personal Loan Details</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-green-600 dark:text-green-400">Employment:</span> {loan.employmentType?.replace('_', ' ') || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-green-600 dark:text-green-400">Income:</span> ₹{loan.monthlyIncome?.toLocaleString() || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-green-600 dark:text-green-400">Obligations:</span> ₹{loan.existingObligations?.toLocaleString() || 'N/A'}
                                </div>
                              </div>
                            </div>
                          )} */}

                          {/* Financial Details */}
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Financial Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">EMI Amount:</span>
                                <p className="font-medium text-gray-900 dark:text-white">₹{loan.emiAmount?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                                <p className="font-medium text-gray-900 dark:text-white">₹{loan.totalAmount?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Current Balance:</span>
                                <p className="font-medium text-gray-900 dark:text-white">₹{loan.currentBalance?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Installments:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{loan.totalInstallments || 0} total</p>
                              </div>
                            </div>
                          </div>

                          {/* Additional Details */}
                          {loan.remarks && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Remarks:</span> {loan.remarks}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No loans found</p>
                      <p className="text-sm">You haven't applied for any loans yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loansData && loansData.pagination && (
                  <span>Total Loans: <span className="font-semibold">{loansData.pagination.totalLoans}</span></span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsLoansModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={fetchLoansData}
                  disabled={loansLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loansLoading ? (
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

      {/* Loan Details Modal */}
      {isLoanDetailsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Loan Details
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedLoan?.loanType} Loan - {selectedLoan?.loanId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLoanDetailsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Error Display */}
              {loanDetailsError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-800 dark:text-red-200 font-medium">Error Loading Loan Details</span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mt-1">{loanDetailsError}</p>
                </div>
              )}

              {/* Loading State */}
              {loanDetailsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading loan details...</p>
                  </div>
                </div>
              )}

              {/* Loan Details Display */}
              {!loanDetailsLoading && !loanDetailsError && loanDetails && (
                <div className="space-y-6">
                  {/* Basic Loan Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Loan ID</p>
                        <p className="font-medium text-blue-800 dark:text-blue-200">{loanDetails.loanId || selectedLoan?.loanId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Loan Type</p>
                        <p className="font-medium text-blue-800 dark:text-blue-200">{loanDetails.loanType || selectedLoan?.loanType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          loanDetails.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          loanDetails.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          loanDetails.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {loanDetails.status || selectedLoan?.status || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">Financial Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">Principal Amount</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">₹{loanDetails.amount?.toLocaleString() || selectedLoan?.amount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">EMI Amount</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">₹{loanDetails.emiAmount?.toLocaleString() || selectedLoan?.emiAmount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">Total Amount</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">₹{loanDetails.totalAmount?.toLocaleString() || selectedLoan?.totalAmount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">Current Balance</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">₹{loanDetails.currentBalance?.toLocaleString() || selectedLoan?.currentBalance?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Loan Terms */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">Loan Terms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Duration</p>
                        <p className="font-medium text-purple-800 dark:text-purple-200">{loanDetails.duration || selectedLoan?.duration || 'N/A'} months</p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Purpose</p>
                        <p className="font-medium text-purple-800 dark:text-purple-200">{loanDetails.purpose || selectedLoan?.purpose || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Installments</p>
                        <p className="font-medium text-purple-800 dark:text-purple-200">{loanDetails.totalInstallments || selectedLoan?.totalInstallments || 0} total</p>
                      </div>
                    </div>
                  </div>

                  {/* Installment Status */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-4">Installment Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-orange-600 dark:text-orange-400">Total Installments</p>
                        <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{loanDetails.totalInstallments || selectedLoan?.totalInstallments || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-orange-600 dark:text-orange-400">Paid Installments</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{loanDetails.paidInstallments || selectedLoan?.paidInstallments || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-orange-600 dark:text-orange-400">Pending Installments</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{loanDetails.pendingInstallments || selectedLoan?.pendingInstallments || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Overdue Information */}
                  {(loanDetails.isOverdue || selectedLoan?.isOverdue) && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Overdue Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-red-600 dark:text-red-400">Overdue Amount</p>
                          <p className="font-medium text-red-800 dark:text-red-200">₹{loanDetails.overdueAmount?.toLocaleString() || selectedLoan?.overdueAmount?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-red-600 dark:text-red-400">Late Fee</p>
                          <p className="font-medium text-red-800 dark:text-red-200">₹{loanDetails.totalLateFee?.toLocaleString() || selectedLoan?.totalLateFee?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw API Response (for debugging) */}
                 
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Loan ID: <span className="font-semibold">{selectedLoan?.loanId}</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsLoanDetailsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loan Application Modal */}
      <LoanApplication
        isOpen={isLoanApplicationModalOpen}
        onClose={() => setIsLoanApplicationModalOpen(false)}
        onSubmit={handleLoanApplicationSubmit}
      />

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your account password
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Success Message */}
              {changePasswordSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      Password Changed Successfully!
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    {changePasswordSuccess}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {changePasswordError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      Password Change Error
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {changePasswordError}
                  </p>
                </div>
              )}

              {/* Change Password Form */}
              <ChangePasswordForm 
                onSubmit={changePassword}
                loading={changePasswordLoading}
                onClose={() => setIsChangePasswordModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Update Profile Modal */}
      {isUpdateProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Update Profile
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your personal information and contact details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateProfileModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Success Message */}
              {updateProfileSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      Profile Updated Successfully!
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    {updateProfileSuccess}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {updateProfileError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      Update Error
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {updateProfileError}
                  </p>
                </div>
              )}

              {/* Update Profile Form */}
              <UpdateProfileForm 
                profileData={profileData}
                onSubmit={updateProfile}
                loading={updateProfileLoading}
                onClose={() => setIsUpdateProfileModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Change Password Form Component
interface ChangePasswordFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
  loading: boolean;
  onClose: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSubmit, loading, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Enter current password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPasswords.current ? (
              <FileText className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Enter new password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPasswords.new ? (
              <FileText className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Changing...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Change Password</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Update Profile Form Component
interface UpdateProfileFormProps {
  profileData: any;
  onSubmit: (data: any) => void;
  loading: boolean;
  onClose: () => void;
}

const UpdateProfileForm: React.FC<UpdateProfileFormProps> = ({ profileData, onSubmit, loading, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: profileData?.firstName || '',
    lastName: profileData?.lastName || '',
    phone: profileData?.phone || '',
    address: {
      street: profileData?.address?.street || '',
      city: profileData?.address?.city || '',
      state: profileData?.address?.state || '',
      pincode: profileData?.address?.pincode || ''
    },
    emergencyContact: {
      name: profileData?.emergencyContact?.name || '',
      relationship: profileData?.emergencyContact?.relationship || '',
      phone: profileData?.emergencyContact?.phone || ''
    }
  });

  // Update form data when profileData changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
        address: {
          street: profileData.address?.street || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          pincode: profileData.address?.pincode || ''
        },
        emergencyContact: {
          name: profileData.emergencyContact?.name || '',
          relationship: profileData.emergencyContact?.relationship || '',
          phone: profileData.emergencyContact?.phone || ''
        }
      });
    }
  }, [profileData]);

  const handleInputChange = (field: string, value: string, nestedField?: string, nestedKey?: string) => {
    if (nestedField && nestedKey) {
      setFormData(prev => ({
        ...prev,
        [nestedField]: {
          ...prev[nestedField as keyof typeof prev],
          [nestedKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correspondense Address
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleInputChange('address', e.target.value, 'address', 'street')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter Correspondense Address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleInputChange('address', e.target.value, 'address', 'city')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => handleInputChange('address', e.target.value, 'address', 'state')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter state"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pincode
            </label>
            <input
              type="text"
              value={formData.address.pincode}
              onChange={(e) => handleInputChange('address', e.target.value, 'address', 'pincode')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter pincode"
            />
          </div>
        </div>
      </div>

      {/* Surety Contact */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Surety Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              value={formData.emergencyContact.name}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value, 'emergencyContact', 'name')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Relationship
            </label>
            <input
              type="text"
              value={formData.emergencyContact.relationship}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value, 'emergencyContact', 'relationship')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter relationship"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.emergencyContact.phone}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value, 'emergencyContact', 'phone')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter contact phone"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Update Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
