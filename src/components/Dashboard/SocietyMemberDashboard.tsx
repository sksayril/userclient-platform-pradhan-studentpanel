import React, { useState, useEffect } from 'react';
import { Users, Award, UserCheck, FileText, CreditCard, Clock, X, Loader2, AlertCircle, RefreshCw, Gem, GraduationCap, AlertTriangle, User, CheckCircle, Sun, Moon } from 'lucide-react';
import LoanApplication from './LoanApplication';
import { uploadBankDocument, getBankDocuments, getLoanPenaltyDetails, getCDPenalties, getCDPenaltyDetails } from '../../services/api';
import { getRazorpayConfig } from '../../config/razorpay';
import { useTheme } from '../../context/ThemeContext';

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

// Razorpay types and interfaces
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

interface RazorpayOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  message?: string;
}

export default function SocietyMemberDashboard({ onLogout }: SocietyMemberDashboardProps) {
  const memberData = JSON.parse(localStorage.getItem('societyMember') || '{}');
  const memberEmail = localStorage.getItem('societyMemberEmail') || '';
  const { theme, toggleTheme } = useTheme();
  
  // Razorpay configuration
  const razorpayConfig = getRazorpayConfig();
  
  // Force theme refresh on mount
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' && !root.classList.contains('dark')) {
      root.classList.add('dark');
      console.log('Forced dark class addition');
    }
  }, [theme]);
  
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
  
  // State for upload receipt modal
  const [isUploadReceiptModalOpen, setIsUploadReceiptModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receiptSuccess, setReceiptSuccess] = useState<string | null>(null);
  
  // State for receipt status modal
  const [isReceiptStatusModalOpen, setIsReceiptStatusModalOpen] = useState(false);
  const [receiptStatusData, setReceiptStatusData] = useState<any[]>([]);
  const [receiptStatusLoading, setReceiptStatusLoading] = useState(false);
  const [receiptStatusError, setReceiptStatusError] = useState<string | null>(null);
  
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

  // State for bank document upload
  const [isBankDocumentModalOpen, setIsBankDocumentModalOpen] = useState(false);
  const [bankDocumentFile, setBankDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'accountStatement' | 'passbook'>('accountStatement');
  const [bankDocumentLoading, setBankDocumentLoading] = useState(false);
  const [bankDocumentError, setBankDocumentError] = useState<string | null>(null);
  const [bankDocumentSuccess, setBankDocumentSuccess] = useState<string | null>(null);

  // State for bank documents list
  const [bankDocumentsData, setBankDocumentsData] = useState<any>(null);
  const [bankDocumentsLoading, setBankDocumentsLoading] = useState(false);
  const [bankDocumentsError, setBankDocumentsError] = useState<string | null>(null);
  const [isBankDocumentsModalOpen, setIsBankDocumentsModalOpen] = useState(false);

  // State for penalty data
  const [penaltyData, setPenaltyData] = useState<any>(null);
  const [penaltyLoading, setPenaltyLoading] = useState(false);
  const [penaltyError, setPenaltyError] = useState<string | null>(null);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [selectedLoanForPenalty, setSelectedLoanForPenalty] = useState<any>(null);
  const [penaltyInitialLoading, setPenaltyInitialLoading] = useState(false);

  // State for CD penalties
  const [cdPenaltyData, setCdPenaltyData] = useState<any>(null);
  const [cdPenaltyLoading, setCdPenaltyLoading] = useState(false);
  const [cdPenaltyError, setCdPenaltyError] = useState<string | null>(null);
  const [selectedPenaltyType, setSelectedPenaltyType] = useState<'loan' | 'cd'>('loan');

  // State for detailed CD penalty modal
  const [isCDPenaltyDetailsModalOpen, setIsCDPenaltyDetailsModalOpen] = useState(false);
  const [selectedCDPenalty, setSelectedCDPenalty] = useState<any>(null);
  const [cdPenaltyDetailsData, setCdPenaltyDetailsData] = useState<any>(null);
  const [cdPenaltyDetailsLoading, setCdPenaltyDetailsLoading] = useState(false);
  const [cdPenaltyDetailsError, setCdPenaltyDetailsError] = useState<string | null>(null);

  // Debug loans modal state changes
  useEffect(() => {
    console.log('Loans modal state changed:', isLoansModalOpen);
  }, [isLoansModalOpen]);

  // Reset bank document modal state when it opens
  useEffect(() => {
    if (isBankDocumentModalOpen) {
      setBankDocumentFile(null);
      setDocumentType('accountStatement');
      setBankDocumentError(null);
      setBankDocumentSuccess(null);
    }
  }, [isBankDocumentModalOpen]);



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
    },
    {
      title: 'Upload Bank Document',
      value: "Upload",
      icon: FileText,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Penalty',
      value: "View Penalties",
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
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
    },
    {
      title: 'Upload Receipt',
      description: 'Upload payment receipts and documents',
      icon: FileText,
      action: () => handleUploadReceiptClick(),
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

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

  // Function to handle upload receipt click
  const handleUploadReceiptClick = () => {
    setIsUploadReceiptModalOpen(true);
    // Reset form fields
    setReceiptFile(null);
    setReceiptError(null);
    setReceiptSuccess(null);
  };

  // Function to handle receipt upload
  const handleReceiptUpload = async () => {
    if (!receiptFile) {
      setReceiptError('Please select a file to upload');
      return;
    }

    setReceiptLoading(true);
    setReceiptError(null);
    setReceiptSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('receiptImage', receiptFile);

      // Call the actual API endpoint
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/receipts/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload receipt');
      }

      const result = await response.json();
      console.log('Receipt upload successful:', result);
      
      setReceiptSuccess('Receipt uploaded successfully!');
      setReceiptFile(null);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsUploadReceiptModalOpen(false);
        setReceiptSuccess(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setReceiptError(error instanceof Error ? error.message : 'Failed to upload receipt');
    } finally {
      setReceiptLoading(false);
    }
  };

  // Function to handle get receipt status
  const handleGetReceiptStatus = async () => {
    setReceiptStatusLoading(true);
    setReceiptStatusError(null);
    setReceiptStatusData([]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call the API to get my receipts
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/receipts/my-receipts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get receipt status');
      }

      const result = await response.json();
      console.log('My receipts:', result);
      
      // Set the receipt data and open the status modal
      // Handle the actual API response structure: { success: true, data: { receipts: [...] } }
      if (result.success && result.data && result.data.receipts) {
        setReceiptStatusData(result.data.receipts);
      } else {
        setReceiptStatusData([]);
      }
      setIsReceiptStatusModalOpen(true);
      
    } catch (error) {
      console.error('Error getting receipt status:', error);
      setReceiptStatusError(error instanceof Error ? error.message : 'Failed to get receipt status');
      // Still open the modal to show the error
      setIsReceiptStatusModalOpen(true);
    } finally {
      setReceiptStatusLoading(false);
    }
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
      
      const response = await fetch(`https://psmw75hs-3500.inc1.devtunnels.ms/api/loans/${loanId}`, {
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



  // Function to fetch bank documents data
  const fetchBankDocumentsData = async () => {
    setBankDocumentsLoading(true);
    setBankDocumentsError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const data = await getBankDocuments(token);
      console.log('Bank documents data fetched successfully:', data);
      console.log('Data structure:', {
        hasData: !!data,
        hasDataProperty: !!(data && data.data),
        dataKeys: data ? Object.keys(data) : [],
        dataDataKeys: data && data.data ? Object.keys(data.data) : []
      });
      
      // Handle the new API response format where accountStatement and passbook are in data object
      if (data && data.data && (data.data.accountStatement || data.data.passbook)) {
        console.log('Setting bank documents data from new format:', data.data);
        // Convert local file paths to accessible URLs
        const processedData = {
          ...data.data,
          accountStatement: data.data.accountStatement ? (() => {
            const convertedPath = `https://psmw75hs-3500.inc1.devtunnels.ms/${data.data.accountStatement.replace(/\\/g, '/').replace('C:/Users/sksay/Desktop/new/backend/', '')}`;
            console.log('Original accountStatement path:', data.data.accountStatement);
            console.log('Converted accountStatement URL:', convertedPath);
            return convertedPath;
          })() : null,
          passbook: data.data.passbook ? (() => {
            const convertedPath = `https://psmw75hs-3500.inc1.devtunnels.ms/${data.data.passbook.replace(/\\/g, '/').replace('C:/Users/sksay/Desktop/new/backend/', '')}`;
            console.log('Original passbook path:', data.data.passbook);
            console.log('Converted passbook URL:', convertedPath);
            return convertedPath;
          })() : null
        };
        console.log('Processed data:', processedData);
        setBankDocumentsData(processedData);
      } else if (data && data.data) {
        console.log('Setting bank documents data from data.data:', data.data);
        setBankDocumentsData(data.data);
      } else if (data && Array.isArray(data)) {
        console.log('Setting bank documents data from array:', data);
        setBankDocumentsData(data);
      } else {
        console.log('Setting empty bank documents array');
        setBankDocumentsData([]);
      }
    } catch (error) {
      console.error('Failed to fetch bank documents:', error);
      setBankDocumentsError(error instanceof Error ? error.message : 'Failed to fetch bank documents');
      setBankDocumentsData([]);
    } finally {
      setBankDocumentsLoading(false);
    }
  };

    // Function to fetch penalty data
  const fetchPenaltyData = async () => {
    setPenaltyLoading(true);
    setPenaltyError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Check if we have loans data to get penalty details
      if (!loansData || !loansData.loans || loansData.loans.length === 0) {
        // If no loans, show empty state
        setPenaltyData([]);
        return;
      }
      
      // Get penalty details for all loans
      const penaltyPromises = loansData.loans.map(async (loan: any) => {
        try {
          const penaltyResponse = await getLoanPenaltyDetails(loan.loanId, token);
          return {
            loanId: loan.loanId,
            loanType: loan.loanType,
            loanAmount: loan.amount,
            ...penaltyResponse.data // Assuming the API returns data in this format
          };
        } catch (error) {
          console.error(`Failed to fetch penalty for loan ${loan.loanId}:`, error);
          return null;
        }
      });
      
      const penaltyResults = await Promise.all(penaltyPromises);
      const validPenalties = penaltyResults.filter(result => result !== null);
      
      setPenaltyData(validPenalties);
      console.log('Penalty data fetched successfully:', validPenalties);
    } catch (error) {
      console.error('Failed to fetch penalty data:', error);
      setPenaltyError(error instanceof Error ? error.message : 'Failed to fetch penalty data');
      setPenaltyData([]);
    } finally {
      setPenaltyLoading(false);
    }
  };

  // Function to fetch CD penalty data
  const fetchCDPenaltyData = async () => {
    setCdPenaltyLoading(true);
    setCdPenaltyError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const cdPenaltyResponse = await getCDPenalties(token);
      setCdPenaltyData(cdPenaltyResponse);
      console.log('CD Penalty data fetched successfully:', cdPenaltyResponse);
    } catch (error) {
      console.error('Failed to fetch CD penalty data:', error);
      setCdPenaltyError(error instanceof Error ? error.message : 'Failed to fetch CD penalty data');
      setCdPenaltyData(null);
    } finally {
      setCdPenaltyLoading(false);
    }
  };

  // Function to fetch detailed CD penalty data
  const fetchCDPenaltyDetails = async (requestId: string) => {
    setCdPenaltyDetailsLoading(true);
    setCdPenaltyDetailsError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const cdPenaltyDetailsResponse = await getCDPenaltyDetails(requestId, token);
      setCdPenaltyDetailsData(cdPenaltyDetailsResponse);
      console.log('CD Penalty details fetched successfully:', cdPenaltyDetailsResponse);
    } catch (error) {
      console.error('Failed to fetch CD penalty details:', error);
      setCdPenaltyDetailsError(error instanceof Error ? error.message : 'Failed to fetch CD penalty details');
      setCdPenaltyDetailsData(null);
    } finally {
      setCdPenaltyDetailsLoading(false);
    }
  };

  // Function to handle penalty click
  const handlePenaltyClick = async () => {
    console.log('Penalty clicked - opening modal and fetching data...');
    setIsPenaltyModalOpen(true);
    setPenaltyInitialLoading(true);
    
    try {
      // If we don't have loans data, fetch it first
      if (!loansData || !loansData.loans || loansData.loans.length === 0) {
        await fetchLoansData();
      }
      
      // Then fetch penalty data
      await fetchPenaltyData();
    } catch (error) {
      console.error('Failed to fetch data for penalties:', error);
      setPenaltyError('Failed to load penalty data. Please try again.');
    } finally {
      setPenaltyInitialLoading(false);
    }
  };

  // Function to handle bank document upload
  const handleBankDocumentUpload = async () => {
    if (!bankDocumentFile) {
      setBankDocumentError('Please select a file to upload');
      return;
    }

    // Validate file size (10MB limit)
    if (bankDocumentFile.size > 10 * 1024 * 1024) {
      setBankDocumentError('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(bankDocumentFile.type)) {
      setBankDocumentError('Please upload a valid file type (PDF, JPG, PNG, GIF)');
      return;
    }

    setBankDocumentLoading(true);
    setBankDocumentError(null);
    setBankDocumentSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('bankDocument', bankDocumentFile);
      formData.append('documentType', documentType);

      // Make API call to upload bank document
      const data = await uploadBankDocument(formData, token);
      console.log('Bank document uploaded successfully:', data);
      
      setBankDocumentSuccess('Bank document uploaded successfully!');
      
      // Reset form
      setBankDocumentFile(null);
      setDocumentType('accountStatement');
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setIsBankDocumentModalOpen(false);
        setBankDocumentSuccess(null);
      }, 2000);

    } catch (error) {
      console.error('Error uploading bank document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload bank document. Please try again.';
      setBankDocumentError(errorMessage);
    } finally {
      setBankDocumentLoading(false);
    }
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
      
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/loans/my-loans', {
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

      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/payment-requests/member/requests', {
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

  // Function to create Razorpay order and process payment
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
      // Find the payment request to get amount and details
      const paymentRequest = pendingPayments.find(p => (p.requestId || p.id) === requestId);
      if (!paymentRequest) {
        throw new Error('Payment request not found');
      }
      
      const amount = paymentRequest.totalAmount || paymentRequest.amount || 0;
      if (amount <= 0) {
        throw new Error('Invalid payment amount');
      }
      
      // Create Razorpay order on your backend
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Hit the specific API endpoint for creating payment order
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/payment-requests/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to create payment order`;
        
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.reason) {
            errorMessage = errorData.reason;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Payment order created:', data);
      console.log('Response structure:', {
        hasData: !!data,
        hasSuccess: !!(data && data.success),
        hasOrderId: !!(data && data.orderId),
        dataKeys: data ? Object.keys(data) : [],
        fullData: data
      });
      
      // Handle successful API response (200 status)
      console.log('✅ Create-order API call successful (200 status)');
      
      // Set success message first
      setPaymentSuccess(`Payment order created successfully! Opening Razorpay gateway...`);
      
      // Handle different possible response formats
      let orderId = null;
      
      if (data && data.success && data.orderId) {
        // Standard success format
        orderId = data.orderId;
        console.log('📋 Order ID found in data.orderId:', orderId);
      } else if (data && data.orderId) {
        // If orderId exists but success might not be explicitly true
        orderId = data.orderId;
        console.log('📋 Order ID found in data.orderId (no success flag):', orderId);
      } else if (data && data.order && data.order.id) {
        // If order is nested in order object with id field - NEW FORMAT
        orderId = data.order.id;
        console.log('📋 Order ID found in data.order.id:', orderId);
      } else if (data && data.order && data.order.orderId) {
        // If order is nested in order object with orderId field
        orderId = data.order.orderId;
        console.log('📋 Order ID found in data.order.orderId:', orderId);
      } else if (data && data.order && data.order.order_id) {
        // If order is nested in order object with order_id field
        orderId = data.order.order_id;
        console.log('📋 Order ID found in data.order.order_id:', orderId);
      } else if (data && data.data && data.data.orderId) {
        // If orderId is nested in data object
        orderId = data.data.orderId;
        console.log('📋 Order ID found in data.data.orderId:', orderId);
      } else if (data && data.order_id) {
        // If orderId is named order_id
        orderId = data.order_id;
        console.log('📋 Order ID found in data.order_id:', orderId);
      } else {
        console.error('❌ Unexpected API response format:', data);
        console.log('📝 Available keys in response:', Object.keys(data || {}));
        if (data && data.order) {
          console.log('📝 Available keys in data.order:', Object.keys(data.order || {}));
        }
        throw new Error(data.message || data.error || 'Failed to create payment order - unexpected response format');
      }
      
      if (orderId) {
        console.log('🚀 Initializing Razorpay payment gateway with order ID:', orderId);
        await initializeRazorpayPayment(orderId, amount, paymentRequest);
      } else {
        throw new Error('Order ID not found in API response');
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

  // Function to initialize Razorpay payment
  const initializeRazorpayPayment = async (orderId: string, amount: number, paymentRequest: PaymentRequest) => {
    try {
      console.log('🎯 Initializing Razorpay with params:', { orderId, amount, paymentType: paymentRequest.paymentType });
      
      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        console.error('❌ Razorpay script not loaded');
        throw new Error('Razorpay payment gateway is not loaded. Please refresh the page and try again.');
      }
      
      console.log('✅ Razorpay script is loaded');

      const memberName = memberData.name || memberData.fullName || 'Society Member';
      const memberContact = memberData.phone || memberData.contact || '';
      
      console.log('👤 Member details:', { memberName, memberEmail, memberContact });
      console.log('⚙️ Razorpay config:', {
        keyId: razorpayConfig.keyId,
        currency: razorpayConfig.currency,
        companyName: razorpayConfig.companyName,
        themeColor: razorpayConfig.themeColor
      });
      
      // Validate Razorpay key format
      if (!razorpayConfig.keyId || !razorpayConfig.keyId.startsWith('rzp_')) {
        throw new Error('Invalid Razorpay Key ID. Please check your configuration in src/config/razorpay.ts');
      }
      
      if (razorpayConfig.keyId.includes('XXXXXXXXXXXXXXXXXX') || razorpayConfig.keyId === 'rzp_test_XXXXXXXXXXXXXXXXXX') {
        throw new Error('Please replace the placeholder Razorpay keys with your actual keys from https://dashboard.razorpay.com/app/keys');
      }
      
      const options: RazorpayOptions = {
        key: razorpayConfig.keyId,
        amount: Math.round(amount * 100), // Convert to paise
        currency: razorpayConfig.currency,
        name: razorpayConfig.companyName,
        description: `${paymentRequest.paymentType || 'Payment'} - ${paymentRequest.description || 'Society Payment'}`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          console.log('💳 Payment handler called with response:', response);
          if (response.razorpay_payment_id) {
            // Payment successful
            console.log('✅ Payment successful:', response);
            await handlePaymentSuccess(response, paymentRequest);
          } else {
            // Payment failed
            console.log('❌ Payment failed:', response);
            handlePaymentFailure(response);
          }
        },
        prefill: {
          name: memberName,
          email: memberEmail,
          contact: memberContact
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
        
        // Check for authentication errors
        if (response.error && response.error.code === 'BAD_REQUEST_ERROR' && 
            response.error.description === 'Authentication failed') {
          setPaymentError('Razorpay authentication failed. Please check your API keys in the configuration.');
          console.error('❌ Razorpay Authentication Error: Invalid API keys');
        } else {
          handlePaymentFailure(response.error);
        }
      });
      
      console.log('🚀 Opening Razorpay payment gateway...');
      razorpay.open();
      
      // Update success message to indicate gateway opened
      setPaymentSuccess('Razorpay payment gateway opened successfully! Complete your payment to proceed.');
      
    } catch (error) {
      console.error('❌ Failed to initialize Razorpay payment:', error);
      
      let errorMessage = 'Failed to initialize payment gateway';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed') || error.message.includes('BAD_REQUEST_ERROR')) {
          errorMessage = 'Razorpay authentication failed. Please check your API keys configuration.';
        } else if (error.message.includes('Invalid Razorpay Key ID')) {
          errorMessage = error.message;
        } else if (error.message.includes('placeholder Razorpay keys')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      setPaymentError(errorMessage);
      setProcessingPayment(null);
    }
  };

  // Function to handle successful payment
  const handlePaymentSuccess = async (response: RazorpayResponse, paymentRequest: PaymentRequest) => {
    try {
      setPaymentSuccess('Payment successful! Verifying payment...');
      setVerifyingPayment(paymentRequest.requestId || paymentRequest.id || '');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Verify payment with your backend
      const verifyResponse = await fetch(razorpayConfig.verifyPaymentUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: paymentRequest.requestId || paymentRequest.id,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          amount: paymentRequest.totalAmount || paymentRequest.amount
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify payment');
      }

      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        setPaymentSuccess('Payment verified successfully! Your payment has been processed.');
        // Refresh pending payments to show updated status
        setTimeout(() => {
          fetchPendingPayments();
        }, 2000);
      } else {
        throw new Error(verifyData.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setPaymentError('Payment verification failed. Please contact support.');
    } finally {
      setVerifyingPayment(null);
    }
  };

  // Function to handle payment failure
  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error);
    let errorMessage = 'Payment failed. Please try again.';
    
    if (error.error) {
      if (error.error.code === 'PAYMENT_CANCELLED') {
        errorMessage = 'Payment was cancelled by the user.';
      } else if (error.error.code === 'PAYMENT_DECLINED') {
        errorMessage = 'Payment was declined by the bank. Please try a different payment method.';
      } else if (error.error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds. Please check your account balance.';
      } else if (error.error.description) {
        errorMessage = error.error.description;
      }
    }
    
    setPaymentError(errorMessage);
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
      console.log('Request URL:', 'https://psmw75hs-3500.inc1.devtunnels.ms/verify-razorpay-payment');
      console.log('Request body:', { 
        requestId: requestId, 
        paymentId: testPaymentId, 
        signature: testSignature 
      });
      
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/payment-requests/verify-razorpay-payment', {
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
      console.log('Request URL:', 'https://psmw75hs-3500.inc1.devtunnels.ms/api/payment-requests/process-upi-payment');
      console.log('Request body:', { 
        requestId: requestId,
        paymentMethod: 'UPI'
      });
      
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/payment-requests/process-upi-payment', {
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
      console.log('Request URL:', 'https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/profile');
      
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/profile', {
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

      
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/profile', {
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
      console.log('Request URL:', 'https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/change-password');
      
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/change-password', {
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
      console.log('Request URL:', 'https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/membership');
      
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/membership', {
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
      console.log('Request URL:', 'https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/referrals');
      
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/referrals', {
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
      console.log('Request URL:', 'https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/agent-codes');
      
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/society-member/agent-codes', {
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
      const response = await fetch('https://psmw75hs-3500.inc1.devtunnels.ms/api/payment-requests/member/pending', {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-20 sm:pb-8">
      {/* Mobile-First Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Mobile Header Layout */}
          <div className="py-4 sm:py-6">
            {/* Top Row - Title and Theme/Logout */}
            <div className="flex items-center justify-between mb-3 sm:mb-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  Society Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <button
                  onClick={onLogout}
                  className="px-3 py-2 sm:px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            </div>
            
            {/* Welcome Message - Mobile Responsive */}
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {profileLoading ? (
                    <span className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </span>
                  ) : profileError ? (
                    <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm">
                      Error: {profileError}
                    </span>
                  ) : profileData ? (
                    <span className="truncate">
                      Welcome, {profileData.firstName || profileData.name || 'Member'} {profileData.lastName || ''}
                    </span>
                  ) : (
                    <span className="truncate">
                      Welcome, {memberData.firstName} {memberData.lastName}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Account Number - Hidden on very small screens, shown on mobile+ */}
              <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {profileData ? (profileData.memberAccountNumber || profileData.memberId || profileData.id || 'N/A') : (memberData.memberAccountNumber || 'N/A')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl mx-auto">
        {/* Stats Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 ${
                (stat.title === 'Get All Agent Codes' || stat.title === 'Get Loans' || stat.title === 'Get All Loans Details' || stat.title === 'Upload Bank Document' || stat.title === 'Get All Bank Documents') ? 'cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95' : ''
              }`}
              onClick={stat.title === 'Get All Agent Codes' ? () => {
                setIsAgentCodesModalOpen(true);
                fetchAgentCodesData();
        } : stat.title === 'Get Loans' ? () => {
          handleLoanApplicationClick();
        } : stat.title === 'Get All Loans Details' ? () => {
          handleLoansDetailsClick();
        } : stat.title === 'Upload Bank Document' ? () => {
          setIsBankDocumentModalOpen(true);
        } : stat.title === 'Get All Bank Documents' ? () => {
          setIsBankDocumentsModalOpen(true);
          fetchBankDocumentsData();
        } : stat.title === 'Penalty' ? () => {
          handlePenaltyClick();
              } : undefined}
            >
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.color} flex-shrink-0`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
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
                    <p className="text-xs sm:text-sm text-red-500">Error loading</p>
                  ) : (
                    <p className={`text-sm sm:text-lg font-semibold ${stat.textColor} truncate`}>
                      {stat.value}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Referral Code Section - Mobile Responsive */}
        {referralsData && referralsData.referralCode && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-blue-500 rounded-xl flex-shrink-0">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-800 dark:text-blue-200">
                    Your Referral Code
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                    Share this code with others to earn rewards
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-600">
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium mb-2 text-center sm:text-left">
                    Referral Code
                  </p>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
                    <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-200 font-mono tracking-wider">
                      {referralsData.referralCode}
                    </p>
                    <button
                      onClick={() => {
                        if (referralsData.referralCode) {
                          navigator.clipboard.writeText(referralsData.referralCode);
                          // You could add a toast notification here
                        }
                      }}
                      className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors active:scale-95"
                      title="Copy referral code"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-2 text-center sm:text-left">
                    Tap icon to copy
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions - Mobile Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all text-left group active:scale-95"
              >
                <div className={`p-2 sm:p-3 rounded-lg ${action.color} w-fit mb-3`}>
                  <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                  {action.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Section - Mobile Responsive */}
        {profileData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setIsUpdateProfileModalOpen(true)}
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95"
                >
                  <Users className="w-4 h-4" />
                  <span>Update Profile</span>
                </button>
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={fetchProfileData}
                  disabled={profileLoading}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95"
                >
                  {profileLoading ? (
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

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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

        {/* KYC Documents Section - Mobile Responsive */}
        {profileData && profileData.kycDocuments && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              KYC Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                          src={`https://psmw75hs-3500.inc1.devtunnels.ms/${profileData.kycDocuments.aadharCard.document.replace(/\\/g, '/').replace('C:/Users/sksay/Desktop/pradhan/pradhan-schoolmanagement-apis/', '')}`}
                          alt="Aadhar Card"
                          className="w-full h-32 sm:h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-105 transition-transform duration-200"
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
                          src={`https://psmw75hs-3500.inc1.devtunnels.ms/${profileData.kycDocuments.panCard.document.replace(/\\/g, '/').replace('C:/Users/sksay/Desktop/pradhan/pradhan-schoolmanagement-apis/', '')}`}
                          alt="PAN Card"
                          className="w-full h-32 sm:h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-105 transition-transform duration-200"
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
                          src={`https://psmw75hs-3500.inc1.devtunnels.ms/${profileData.kycDocuments.profilePhoto.replace(/\\/g, '/').replace('C:/Users/sksay/Desktop/pradhan/pradhan-schoolmanagement-apis/', '')}`}
                          alt="Profile Photo"
                          className="w-full h-32 sm:h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-105 transition-transform duration-200"
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
            
            {/* Document Status Summary - Mobile Responsive */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Status</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

        {/* Surety Contact Section - Mobile Responsive */}
        {profileData && profileData.emergencyContact && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Surety Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
        
        {/* Recent Activity - Mobile Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3 sm:space-y-4">
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

      {/* Payment Requests Modal - Mobile Responsive */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in">
            {/* Modal Header - Mobile Responsive */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex-shrink-0">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    Payment Requests
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    View and manage your payment requests
                  </p>
                </div>
              </div>
              <button
                onClick={closePaymentModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content - Mobile Responsive */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
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
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status || 'pending')} w-fit`}>
                          {getStatusIcon(request.status || 'pending')}
                          <span className="ml-1 capitalize">{request.status || 'pending'}</span>
                        </span>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                          {(request.status || 'pending') === 'pending' && (
                            <>
                              <button className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1 text-sm sm:text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors active:scale-95 min-h-[44px] sm:min-h-0">
                                Approve
                              </button>
                              <button className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1 text-sm sm:text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors active:scale-95 min-h-[44px] sm:min-h-0">
                                Reject
                              </button>
                            </>
                          )}
                          {(request.status || 'pending') === 'approved' && (
                            <button className="w-full sm:w-auto px-4 py-2 sm:px-3 sm:py-1 text-sm sm:text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95 min-h-[44px] sm:min-h-0">
                              Process Payment
                            </button>
                          )}
                          {(request.status || 'pending') === 'rejected' && (
                            <button className="w-full sm:w-auto px-4 py-2 sm:px-3 sm:py-1 text-sm sm:text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors active:scale-95 min-h-[44px] sm:min-h-0">
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

            {/* Modal Footer - Mobile Responsive */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
              <div className="flex flex-col gap-3">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                  {paymentRequests.length > 0 && (
                    <span>Total Requests: {paymentRequests.length}</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={closePaymentModal}
                    className="flex-1 px-4 py-3 sm:py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center active:scale-95"
                  >
                    Close
                  </button>
                  <button
                    onClick={fetchPaymentRequests}
                    disabled={loading}
                    className="flex-1 px-4 py-3 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 active:scale-95"
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
        </div>
      )}

      {/* Pending Payments Modal - Mobile Responsive */}
      {isPendingPaymentsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in">
            {/* Modal Header - Mobile Responsive */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    Pending Payments
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    View and manage your pending payment obligations
                  </p>
                </div>
              </div>
              <button
                onClick={closePendingPaymentsModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content - Mobile Responsive */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
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

                      {/* Action Buttons - Mobile Responsive */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                          <button 
                            onClick={() => createRazorpayOrder(payment.requestId || payment.id || '')}
                            disabled={processingPayment === (payment.requestId || payment.id)}
                            className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 active:scale-95 min-h-[44px] sm:min-h-0 ${
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
                          {/* <button 
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
                          </button> */}
                          {/* <button 
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
                          </button> */}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right mt-2 sm:mt-0">
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

            {/* Modal Footer - Mobile Responsive */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
              <div className="flex flex-col gap-3">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                  {pendingPayments.length > 0 && (
                    <span>Total Pending: {pendingPayments.length}</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={closePendingPaymentsModal}
                    className="flex-1 px-4 py-3 sm:py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center active:scale-95"
                  >
                    Close
                  </button>
                  <button
                    onClick={fetchPendingPayments}
                    disabled={pendingPaymentsLoading}
                    className="flex-1 px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 active:scale-95"
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
        </div>
      )}

      {/* Membership Details Modal - Mobile Responsive */}
      {isMembershipModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in">
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

      {/* Bank Document Upload Modal */}
      {isBankDocumentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Upload Bank Document
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload your bank account statement or passbook
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBankDocumentModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Error Display */}
              {bankDocumentError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-800 dark:text-red-200 font-medium">Upload Error</span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mt-1">{bankDocumentError}</p>
                </div>
              )}

              {/* Success Display */}
              {bankDocumentSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-800 dark:text-green-200 font-medium">Upload Successful</span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 mt-1">{bankDocumentSuccess}</p>
                </div>
              )}

              {/* Document Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Document Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDocumentType('accountStatement')}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      documentType === 'accountStatement'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <FileText className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Account Statement</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentType('passbook')}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      documentType === 'passbook'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <FileText className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Passbook</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Bank Document
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBankDocumentFile(file);
                        setBankDocumentError(null);
                        setBankDocumentSuccess(null);
                      }
                    }}
                    className="hidden"
                    id="bankDocumentInput"
                  />
                  <label
                    htmlFor="bankDocumentInput"
                    className="cursor-pointer block"
                  >
                    {bankDocumentFile ? (
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 mx-auto text-green-500" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {bankDocumentFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(bankDocumentFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setBankDocumentFile(null);
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, JPG, PNG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>



              {/* Upload Button */}
              <button
                onClick={handleBankDocumentUpload}
                disabled={!bankDocumentFile || bankDocumentLoading}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {bankDocumentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Document Type: <span className="font-semibold capitalize">{documentType.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsBankDocumentModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Documents List Modal */}
      {isBankDocumentsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Bank Documents
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View all your uploaded bank documents
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBankDocumentsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Error Display */}
              {bankDocumentsError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-800 dark:text-red-200 font-medium">Error Loading Documents</span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mt-1">{bankDocumentsError}</p>
                </div>
              )}

              {/* Loading State */}
              {bankDocumentsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading bank documents...</p>
                  </div>
                </div>
              )}

              {/* Documents List */}
              {!bankDocumentsLoading && !bankDocumentsError && bankDocumentsData && (
                <div>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400">Total Documents</p>
                          <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                            {(() => {
                              if (Array.isArray(bankDocumentsData)) {
                                return bankDocumentsData.length;
                              } else if (bankDocumentsData && bankDocumentsData.data) {
                                return bankDocumentsData.data.length;
                              } else if (bankDocumentsData && (bankDocumentsData.accountStatement || bankDocumentsData.passbook)) {
                                return (bankDocumentsData.accountStatement ? 1 : 0) + (bankDocumentsData.passbook ? 1 : 0);
                              }
                              return 0;
                            })()}
                          </p>
                        </div>
                        <FileText className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">📄 Account Statements</p>
                          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                            {(() => {
                              if (Array.isArray(bankDocumentsData)) {
                                return bankDocumentsData.filter((doc: any) => doc.documentType === 'accountStatement').length;
                              } else if (bankDocumentsData && bankDocumentsData.data) {
                                return bankDocumentsData.data.filter((doc: any) => doc.documentType === 'accountStatement').length;
                              } else if (bankDocumentsData && bankDocumentsData.accountStatement) {
                                return 1;
                              }
                              return 0;
                            })()}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">Bank statements & records</p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">🏦 Passbooks</p>
                          <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                            {(() => {
                              if (Array.isArray(bankDocumentsData)) {
                                return bankDocumentsData.filter((doc: any) => doc.documentType === 'passbook').length;
                              } else if (bankDocumentsData && bankDocumentsData.data) {
                                return bankDocumentsData.data.filter((doc: any) => doc.documentType === 'passbook').length;
                              } else if (bankDocumentsData && bankDocumentsData.passbook) {
                                return 1;
                              }
                              return 0;
                            })()}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">Bank passbooks & books</p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <FileText className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {(() => {
                    console.log('Rendering bank documents with data:', bankDocumentsData);
                    // Handle the new API response format
                    if (bankDocumentsData && (bankDocumentsData.accountStatement || bankDocumentsData.passbook)) {
                      return (
                        <div className="space-y-6">
                          {/* Account Statement */}
                          {bankDocumentsData.accountStatement && (
                            <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">📄 Account Statement</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Bank statements & financial records</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {bankDocumentsData.uploadedAt ? new Date(bankDocumentsData.uploadedAt).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Account Statement Preview */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📄 Account Statement Preview</p>
                                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                    Statement
                                  </span>
                                </div>
                                
                                <div className="border-2 border-dashed border-blue-200 dark:border-blue-700 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                  <div className="relative">
                                    <img
                                      src={bankDocumentsData.accountStatement}
                                      alt="Account Statement"
                                      className="w-full h-64 object-contain bg-white dark:bg-gray-800"
                                      onLoad={() => {
                                        console.log('Account Statement image loaded successfully:', bankDocumentsData.accountStatement);
                                      }}
                                      onError={(e) => {
                                        console.error('Account Statement image error:', e);
                                        console.error('Failed URL:', bankDocumentsData.accountStatement);
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallbackDiv = target.nextElementSibling as HTMLElement;
                                        if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                      }}
                                    />
                                    
                                    {/* Fallback display for failed images */}
                                    <div className="hidden h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                                          <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                          Account Statement
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                          Account Statement
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                          Image preview unavailable
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Image Actions Overlay */}
                                    <div className="absolute top-3 right-3 flex space-x-2">
                                      <a
                                        href={bankDocumentsData.accountStatement}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 text-xs rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg backdrop-blur-sm"
                                      >
                                        👁️ View Full
                                      </a>
                                      <a
                                        href={bankDocumentsData.accountStatement}
                                        download="account-statement.png"
                                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg"
                                      >
                                        📥 Download
                                      </a>
                                    </div>
                                    
                                    {/* Document Type Badge */}
                                    <div className="absolute top-3 left-3">
                                      <span className="px-3 py-1.5 text-xs font-medium rounded-lg shadow-lg bg-blue-600 text-white">
                                        📊 Statement
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Passbook */}
                          {bankDocumentsData.passbook && (
                            <div className="border border-green-200 dark:border-green-700 rounded-lg p-6 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                    <FileText className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">🏦 Passbook</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Bank passbooks & account books</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {bankDocumentsData.uploadedAt ? new Date(bankDocumentsData.uploadedAt).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Passbook Preview */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">🏦 Passbook Preview</p>
                                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                    Passbook
                                  </span>
                                </div>
                                
                                <div className="border-2 border-dashed border-green-200 dark:border-green-700 rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                  <div className="relative">
                                    <img
                                      src={bankDocumentsData.passbook}
                                      alt="Passbook"
                                      className="w-full h-64 object-contain bg-white dark:bg-gray-800"
                                      onLoad={() => {
                                        console.log('Passbook image loaded successfully:', bankDocumentsData.passbook);
                                      }}
                                      onError={(e) => {
                                        console.error('Passbook image error:', e);
                                        console.error('Failed URL:', bankDocumentsData.passbook);
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallbackDiv = target.nextElementSibling as HTMLElement;
                                        if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                      }}
                                    />
                                    
                                    {/* Fallback display for failed images */}
                                    <div className="hidden h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900">
                                          <FileText className="w-10 h-10 text-green-600 dark:text-green-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                          Passbook
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                          Passbook
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                          Image preview unavailable
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Image Actions Overlay */}
                                    <div className="absolute top-3 right-3 flex space-x-2">
                                      <a
                                        href={bankDocumentsData.passbook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 text-xs rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg backdrop-blur-sm"
                                      >
                                        👁️ View Full
                                      </a>
                                      <a
                                        href={bankDocumentsData.passbook}
                                        download="passbook.png"
                                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg"
                                      >
                                        📥 Download
                                      </a>
                                    </div>
                                    
                                    {/* Document Type Badge */}
                                    <div className="absolute top-3 left-3">
                                      <span className="px-3 py-1.5 text-xs font-medium rounded-lg shadow-lg bg-green-600 text-white">
                                        🏦 Passbook
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    // Handle the old array format
                    const documents = Array.isArray(bankDocumentsData) ? bankDocumentsData : (bankDocumentsData.data ? bankDocumentsData.data : []);
                    return documents.length > 0 ? (
                      <div className="space-y-4">
                        {documents.map((document: any, index: number) => (
                          <div key={document.id || document._id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  document.documentType === 'accountStatement' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
                                }`}>
                                  <FileText className={`w-5 h-5 ${
                                    document.documentType === 'accountStatement' ? 'text-blue-600' : 'text-green-600'
                                  }`} />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-white">
                                    {document.documentType === 'accountStatement' ? '📄 Account Statement' : '🏦 Passbook'}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    ID: {document.id || document._id || document.documentId || `Doc-${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {document.documentType === 'accountStatement' ? 'Bank statements & financial records' : 'Bank passbooks & account books'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : 
                                   document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  {document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB` : 
                                   document.size ? `${(document.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Document Preview */}
                            {(() => {
                              const fileUrl = document.fileUrl || document.url || document.downloadUrl || document.imageUrl;
                              const fileName = document.fileName || document.originalName || document.name || 'Document';
                              const fileType = document.fileType || document.mimeType || 'application/octet-stream';
                              const documentType = document.documentType;
                              
                              // For accountStatement and passbook, always try to show image preview
                              if (fileUrl && (documentType === 'accountStatement' || documentType === 'passbook')) {
                                return (
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {documentType === 'accountStatement' ? '📄 Account Statement Preview' : '🏦 Passbook Preview'}
                                      </p>
                                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                        {documentType === 'accountStatement' ? 'Statement' : 'Passbook'}
                                      </span>
                                    </div>
                                    
                                    <div className="border-2 border-dashed border-blue-200 dark:border-blue-700 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                      <div className="relative">
                                                                                 <img
                                           src={fileUrl}
                                           alt={`${documentType === 'accountStatement' ? 'Account Statement' : 'Passbook'} - ${fileName}`}
                                           className="w-full h-64 object-contain bg-white dark:bg-gray-800"
                                           onError={(e) => {
                                             console.error('Image preview error:', e);
                                             // Show fallback for failed images
                                             const target = e.currentTarget as HTMLImageElement;
                                             target.style.display = 'none';
                                             const fallbackDiv = target.nextElementSibling as HTMLElement;
                                             if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                           }}
                                         />
                                        
                                        {/* Fallback display for failed images */}
                                        <div className="hidden h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                          <div className="text-center">
                                            <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                              documentType === 'accountStatement' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
                                            }`}>
                                              {documentType === 'accountStatement' ? (
                                                <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                              ) : (
                                                <FileText className="w-10 h-10 text-green-600 dark:text-green-400" />
                                              )}
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                              {documentType === 'accountStatement' ? 'Account Statement' : 'Passbook'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                              {fileName}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                              Image preview unavailable
                                            </p>
                                          </div>
                                        </div>
                                        
                                        {/* Image Actions Overlay */}
                                        <div className="absolute top-3 right-3 flex space-x-2">
                                          <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 text-xs rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg backdrop-blur-sm"
                                          >
                                            👁️ View Full
                                          </a>
                                          <a
                                            href={fileUrl}
                                            download={fileName}
                                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg"
                                          >
                                            📥 Download
                                          </a>
                                        </div>
                                        
                                        {/* Document Type Badge */}
                                        <div className="absolute top-3 left-3">
                                          <span className={`px-3 py-1.5 text-xs font-medium rounded-lg shadow-lg ${
                                            documentType === 'accountStatement' 
                                              ? 'bg-blue-600 text-white' 
                                              : 'bg-green-600 text-white'
                                          }`}>
                                            {documentType === 'accountStatement' ? '📊 Statement' : '🏦 Passbook'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Additional Document Info */}
                                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                                        <p className="text-gray-500 dark:text-gray-400">File Type</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {fileType.startsWith('image/') ? 'Image File' : fileType}
                                        </p>
                                      </div>
                                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                                        <p className="text-gray-500 dark:text-gray-400">Document Type</p>
                                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                                          {documentType === 'accountStatement' ? 'Account Statement' : 'Passbook'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              
                              // For other document types or when no image URL
                              if (fileUrl) {
                                return (
                                  <div className="mb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Document Preview</p>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                      {(() => {
                                        if (fileType.startsWith('image/')) {
                                          return (
                                            <div className="relative">
                                              <img
                                                src={fileUrl}
                                                alt={fileName}
                                                className="w-full h-48 object-contain bg-gray-50 dark:bg-gray-800"
                                                onError={(e) => {
                                                  console.error('Image preview error:', e);
                                                  e.currentTarget.style.display = 'none';
                                                }}
                                              />
                                              <div className="absolute top-2 right-2">
                                                <a
                                                  href={fileUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                  View Full
                                                </a>
                                              </div>
                                            </div>
                                          );
                                        } else if (fileType === 'application/pdf') {
                                          return (
                                            <div className="h-48 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                              <div className="text-center">
                                                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                  {fileName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                  PDF Document
                                                </p>
                                                <a
                                                  href={fileUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                  <FileText className="w-3 h-3 mr-1" />
                                                  Open PDF
                                                </a>
                                              </div>
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <div className="h-48 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                              <div className="text-center">
                                                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                  {fileName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                  File Type: {fileType}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        }
                                      })()}
                                    </div>
                                  </div>
                                );
                              }
                              
                              return null;
                            })()}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">File Name</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {document.fileName || document.originalName || document.name || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  document.status === 'VERIFIED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  document.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  document.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                  {document.status || 'UNKNOWN'}
                                </span>
                              </div>
                            </div>

                            {/* Document Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Uploaded: {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : 
                                           document.createdAt ? new Date(document.createdAt).toLocaleString() : 'N/A'}
                              </div>
                              <div className="flex space-x-2">
                                {(document.downloadUrl || document.fileUrl || document.url) && (
                                  <a
                                    href={document.downloadUrl || document.fileUrl || document.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    Download
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    // Handle document deletion if needed
                                    console.log('Delete document:', document.id || document._id);
                                  }}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No bank documents found</p>
                        <p className="text-sm">You haven't uploaded any bank documents yet</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {bankDocumentsData && (
                  <span>Total Documents: <span className="font-semibold">
                    {(() => {
                      if (Array.isArray(bankDocumentsData)) {
                        return bankDocumentsData.length;
                      } else if (bankDocumentsData && bankDocumentsData.data) {
                        return bankDocumentsData.data.length;
                      } else if (bankDocumentsData && (bankDocumentsData.accountStatement || bankDocumentsData.passbook)) {
                        return (bankDocumentsData.accountStatement ? 1 : 0) + (bankDocumentsData.passbook ? 1 : 0);
                      }
                      return 0;
                    })()}
                  </span></span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsBankDocumentsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={fetchBankDocumentsData}
                  disabled={bankDocumentsLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {bankDocumentsLoading ? (
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

      {/* Penalty Modal */}
      {isPenaltyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Penalty Details
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage your penalty charges
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPenaltyModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Penalty Type Selection */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Select Penalty Type</h4>
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="loanPenalties"
                      name="penaltyType"
                      checked={selectedPenaltyType === 'loan'}
                      onChange={() => setSelectedPenaltyType('loan')}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="loanPenalties" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Loan Penalties
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cdPenalties"
                      name="penaltyType"
                      checked={selectedPenaltyType === 'cd'}
                      onChange={() => {
                        setSelectedPenaltyType('cd');
                        fetchCDPenaltyData();
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="cdPenalties" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      CD Penalties
                    </label>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {penaltyError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-800 dark:text-red-200 font-medium">Error Loading Penalties</span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mt-1">{penaltyError}</p>
                </div>
              )}

              {/* Loading State */}
              {(penaltyLoading || penaltyInitialLoading) && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-8 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {penaltyInitialLoading ? 'Loading loans and penalty data...' : 'Loading penalty details...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Penalty List */}
              {!penaltyLoading && !penaltyInitialLoading && !penaltyError && (
                <div>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {selectedPenaltyType === 'loan' ? (
                      <>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-red-600 dark:text-red-400">Total Loans with Penalties</p>
                              <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                                {penaltyData ? penaltyData.length || 0 : 0}
                              </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                          </div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-orange-600 dark:text-orange-400">Total Penalty Amount</p>
                              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                                ₹{penaltyData ? penaltyData.reduce((sum: number, p: any) => sum + (p.penaltyAmount || 0), 0).toLocaleString() : '0'}
                              </p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-500" />
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-green-600 dark:text-green-400">Active Loans</p>
                              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {penaltyData ? penaltyData.filter((p: any) => p.loanStatus === 'ACTIVE').length || 0 : 0}
                              </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Total CD Penalties</p>
                              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                {cdPenaltyData?.data?.totalPayments || 0}
                              </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-blue-500" />
                          </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-purple-600 dark:text-purple-400">Total CD Penalty Amount</p>
                              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                                ₹{cdPenaltyData?.data?.totalPenalty || 0}
                              </p>
                            </div>
                            <Clock className="w-8 h-8 text-purple-500" />
                          </div>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-indigo-600 dark:text-indigo-400">Overdue Payments</p>
                              <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                                {cdPenaltyData?.data?.overduePayments || 0}
                              </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-indigo-500" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Penalty Items */}
                  {selectedPenaltyType === 'loan' ? (
                    <div className="space-y-4">
                      {penaltyData && penaltyData.map((penalty: any, index: number) => (
                        <div key={penalty.loanId || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Loan ID: {penalty.loanId}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {penalty.loanType} Loan - ₹{penalty.loanAmount?.toLocaleString() || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                ₹{penalty.penaltyAmount?.toLocaleString() || '0'}
                              </div>
                              <div className="text-sm px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Penalty
                              </div>
                            </div>
                          </div>
                          
                          {/* Loan Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div>
                              <span className="font-medium">Loan Type:</span> {penalty.loanType || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Loan Amount:</span> ₹{penalty.loanAmount?.toLocaleString() || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Loan Status:</span> 
                              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                penalty.loanStatus === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                penalty.loanStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {penalty.loanStatus || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Penalty Amount:</span> ₹{penalty.penaltyAmount?.toLocaleString() || '0'}
                            </div>
                          </div>

                          {/* Penalty Details */}
                          {penalty.penaltyDetails && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                              <h4 className="font-medium text-white mb-2">Penalty Details</h4>
                              <div className="grid grid-cols-1 gap-2 text-sm">
                                {penalty.penaltyDetails.reason && (
                                  <div>
                                    <span className="font-medium">Reason:</span> {penalty.penaltyDetails.reason}
                                  </div>
                                )}
                                {penalty.penaltyDetails.date && (
                                  <div>
                                    <span className="font-medium">Date:</span> {new Date(penalty.penaltyDetails.date).toLocaleDateString()}
                                  </div>
                                )}
                                {penalty.penaltyDetails.dueDate && (
                                  <div>
                                    <span className="font-medium">Due Date:</span> {new Date(penalty.penaltyDetails.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* CD Penalties Loading */}
                      {cdPenaltyLoading && (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <Loader2 className="w-12 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Loading CD Penalties...</p>
                          </div>
                        </div>
                      )}

                      {/* CD Penalties Error */}
                      {cdPenaltyError && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-800 dark:text-red-200 font-medium">Error Loading CD Penalties</span>
                          </div>
                          <p className="text-red-700 dark:text-red-300 mt-1">{cdPenaltyError}</p>
                        </div>
                      )}

                                            {/* CD Penalties Data */}
                      {!cdPenaltyLoading && !cdPenaltyError && cdPenaltyData && (
                        <div className="space-y-4">
                          {/* Summary Message */}
                          {cdPenaltyData.data?.summary?.message && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5 text-blue-600" />
                                <span className="text-blue-800 dark:text-blue-200 font-medium">
                                  {cdPenaltyData.data.summary.message}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Penalty Breakdown Items */}
                          {cdPenaltyData.data?.penaltyBreakdown && cdPenaltyData.data.penaltyBreakdown.map((penalty: any, index: number) => (
                            <div 
                              key={penalty.requestId || index} 
                              className="border border-blue-200 dark:border-blue-700 rounded-lg p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedCDPenalty(penalty);
                                setIsCDPenaltyDetailsModalOpen(true);
                                fetchCDPenaltyDetails(penalty.requestId);
                              }}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Request ID: {penalty.requestId}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {penalty.paymentType} Payment - ₹{penalty.amount?.toLocaleString() || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    ₹{penalty.penalty?.penaltyAmount?.toLocaleString() || '0'}
                                  </div>
                                  <div className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    CD Penalty
                                  </div>
                                </div>
                              </div>
                              
                              {/* Payment Details */}
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <div>
                                  <span className="font-medium">Payment Type:</span> {penalty.paymentType || 'N/A'}
                                </div>
                                <div>
                                  <span className="font-medium">Payment Amount:</span> ₹{penalty.amount?.toLocaleString() || 'N/A'}
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span> 
                                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                    penalty.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    penalty.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}>
                                    {penalty.status || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Due Date:</span> {penalty.dueDate ? new Date(penalty.dueDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>

                              {/* Penalty Details */}
                              {penalty.penalty && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                                  <h4 className="font-medium text-white mb-2">Penalty Details</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-white">Penalty Amount:</span> <span className="text-white">₹{penalty.penalty.penaltyAmount?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-white">Days Late:</span> <span className="text-white">{penalty.penalty.daysLate || '0'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-white">Penalty Per Day:</span> <span className="text-white">₹{penalty.penalty.penaltyPerDay?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-white">Total with Penalty:</span> <span className="text-white">₹{penalty.totalAmountWithPenalty?.toLocaleString() || '0'}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Penalty Message */}
                                  {penalty.penalty.message && (
                                    <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-blue-700">
                                      <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {penalty.penalty.message}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* No CD Penalties Found */}
                      {!cdPenaltyLoading && !cdPenaltyError && !cdPenaltyData && (
                        <div className="text-center py-12">
                          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg font-medium mb-2">No CD Penalties Found</p>
                          <p className="text-gray-400">You have no CD penalty charges at this time.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedPenaltyType === 'loan' && penaltyData && penaltyData.length === 0 && (
                    <div className="text-center py-12">
                      <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium mb-2">No Loan Penalties Found</p>
                      <p className="text-gray-400">You have no penalty charges on your loans at this time.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedPenaltyType === 'loan' ? (
                    `Total Loan Penalty Amount: ₹${penaltyData ? penaltyData.reduce((sum: number, p: any) => sum + (p.penaltyAmount || 0), 0).toLocaleString() : '0'}`
                  ) : (
                    `Total CD Penalty Amount: ₹${cdPenaltyData?.data?.totalPenalty || 0}`
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsPenaltyModalOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={selectedPenaltyType === 'loan' ? fetchPenaltyData : fetchCDPenaltyData}
                    disabled={selectedPenaltyType === 'loan' ? penaltyLoading : cdPenaltyLoading}
                    className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${
                      selectedPenaltyType === 'loan' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {(selectedPenaltyType === 'loan' ? penaltyLoading : cdPenaltyLoading) ? (
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
        </div>
      )}

      {/* Upload Receipt Modal - Mobile Responsive */}
      {isUploadReceiptModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Upload Receipt
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload your payment receipt image
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadReceiptModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Success Message */}
              {receiptSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      Receipt Uploaded Successfully!
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    {receiptSuccess}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {receiptError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      Upload Error
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {receiptError}
                  </p>
                </div>
              )}

              {/* Upload Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleReceiptUpload(); }} className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Receipt Image <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="receipt-upload"
                      required
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      {receiptFile ? (
                        <div className="space-y-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto w-fit">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {receiptFile.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto w-fit">
                            <FileText className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Click to upload receipt image
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPEG, JPG, PNG, WebP (Max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  {receiptFile && (
                    <button
                      type="button"
                      onClick={() => setReceiptFile(null)}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      Remove file
                    </button>
                  )}
                </div>

                {/* Form Actions - Mobile Responsive */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => handleGetReceiptStatus()}
                        className="flex-1 px-6 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 active:scale-95 min-h-[44px] sm:min-h-0"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Get Status</span>
                      </button>
                      <button
                        type="submit"
                        disabled={receiptLoading || !receiptFile}
                        className="flex-1 px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 active:scale-95 min-h-[44px] sm:min-h-0"
                      >
                        {receiptLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            <span>Upload Receipt</span>
                          </>
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUploadReceiptModalOpen(false)}
                      className="w-full px-6 py-3 sm:py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:scale-95 min-h-[44px] sm:min-h-0"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Status Modal - Mobile Responsive */}
      {isReceiptStatusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Receipt Status
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View all your receipt uploads and their current status
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiptStatusModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Summary Section */}
              {!receiptStatusLoading && receiptStatusData.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                          Total Receipts: {receiptStatusData.length}
                        </h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {receiptStatusData.filter(r => r.status === 'paid').length} Paid • {receiptStatusData.filter(r => r.status === 'pending').length} Pending
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {receiptStatusError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      Error Loading Receipts
                    </span>
                  </div>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                    {receiptStatusError}
                  </p>
                </div>
              )}

              {/* Loading State */}
              {receiptStatusLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Fetching receipt status...</p>
                  </div>
                </div>
              )}

              {/* Receipts List */}
              {!receiptStatusLoading && receiptStatusData.length > 0 && (
                <div className="space-y-4">
                  {receiptStatusData.map((receipt, index) => (
                    <div key={receipt.receiptId || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              Receipt #{receipt.receiptId}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Created on {receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : 'Date not specified'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            receipt.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            receipt.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            receipt.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {receipt.status === 'paid' ? '✅ Paid' :
                             receipt.status === 'pending' ? '⏳ Pending' :
                             receipt.status === 'rejected' ? '❌ Rejected' :
                             '📋 ' + (receipt.status || 'Unknown')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Receipt Details - Focus on Receipt ID and Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Receipt ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-white font-mono text-base">
                            {receipt.receiptId}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                          <span className="ml-2 text-gray-900 dark:text-white capitalize text-base">
                            {receipt.status}
                          </span>
                        </div>
                        {receipt.receiptDate && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Receipt Date:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {new Date(receipt.receiptDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {receipt.paidAt && receipt.status === 'paid' && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Paid At:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {new Date(receipt.paidAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!receiptStatusLoading && receiptStatusData.length === 0 && !receiptStatusError && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Receipts Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You haven't uploaded any receipts yet.
                  </p>
                </div>
              )}
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

      {/* Change Password Modal - Mobile Responsive */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in">
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

      {/* Update Profile Modal - Mobile Responsive */}
      {isUpdateProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in">
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

      {/* CD Penalty Details Modal */}
      {isCDPenaltyDetailsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    CD Penalty Details
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Detailed information about the selected CD penalty
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCDPenaltyDetailsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Loading State */}
              {cdPenaltyDetailsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading CD penalty details...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {cdPenaltyDetailsError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-800 dark:text-red-200 font-medium">Error Loading Details</span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mt-1">{cdPenaltyDetailsError}</p>
                </div>
              )}

              {/* CD Penalty Details Data */}
              {!cdPenaltyDetailsLoading && !cdPenaltyDetailsError && cdPenaltyDetailsData && (
                <div className="space-y-6">
                  {/* Summary Information */}
                  {selectedCDPenalty && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Request ID</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCDPenalty.requestId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Payment Type</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCDPenalty.paymentType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Amount</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{selectedCDPenalty.amount?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Status</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedCDPenalty.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            selectedCDPenalty.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {selectedCDPenalty.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Request ID: {selectedCDPenalty?.requestId || 'N/A'}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCDPenaltyDetailsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => selectedCDPenalty && fetchCDPenaltyDetails(selectedCDPenalty.requestId)}
                  disabled={cdPenaltyDetailsLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {cdPenaltyDetailsLoading ? (
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4 sm:p-6">
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
            className="w-full px-3 py-3 sm:py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-base sm:text-sm"
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
            className="w-full px-3 py-3 sm:py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-base sm:text-sm"
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

      {/* Form Actions - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 sm:py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors order-2 sm:order-1 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 order-1 sm:order-2 active:scale-95"
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4 sm:p-6 overflow-y-auto">
      {/* Personal Information */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-base sm:text-sm"
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
