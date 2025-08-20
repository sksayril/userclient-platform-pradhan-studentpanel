import React, { useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getKycStatus, getSocietyMemberKycStatus } from '../../services/api';

interface KYCWaitingProps {
  onKycApproved: () => void;
  userType?: 'student' | 'society-member';
}

export default function KYCWaiting({ onKycApproved, userType }: KYCWaitingProps) {
  const currentUserType = userType || localStorage.getItem('userType') as 'student' | 'society-member' || 'student';
  const [kycStatus, setKycStatus] = useState<string>('submitted');
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkKycStatus = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication error. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (currentUserType === 'student') {
        response = await getKycStatus(token);
      } else {
        response = await getSocietyMemberKycStatus(token);
      }

      if (response && response.data) {
        setKycStatus(response.data.kycStatus);
        setLastChecked(new Date());
        
        // If KYC is approved, redirect to dashboard
        if (response.data.isKycApproved) {
          onKycApproved();
        }
      }
    } catch (error) {
      console.error('Failed to check KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check KYC status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkKycStatus();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentUserType]);

  // Initial check on component mount
  useEffect(() => {
    checkKycStatus();
  }, [currentUserType]);

  const getStatusIcon = () => {
    switch (kycStatus) {
      case 'approved':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (kycStatus) {
      case 'approved':
        return 'Your KYC has been approved! Redirecting to dashboard...';
      case 'rejected':
        return 'Your KYC has been rejected. Please check the reason and resubmit.';
      case 'submitted':
        return 'Your KYC documents have been submitted and are under review.';
      case 'pending':
        return 'Your KYC application is pending review.';
      default:
        return 'Your KYC is being processed.';
    }
  };

  const getStatusColor = () => {
    switch (kycStatus) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getBackgroundColor = () => {
    switch (kycStatus) {
      case 'approved':
        return 'bg-green-50';
      case 'rejected':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <div className="text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            KYC Status: {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
          </h1>

          {/* Status Message */}
          <div className={`p-4 rounded-lg ${getBackgroundColor()} mb-6`}>
            <p className={`text-lg font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-sm text-gray-600">Submitted</span>
              </div>
              <div className="w-8 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 ${kycStatus === 'submitted' || kycStatus === 'pending' ? 'bg-blue-500' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                  {kycStatus === 'submitted' || kycStatus === 'pending' ? (
                    <Clock className="w-5 h-5 text-white" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-600">Under Review</span>
              </div>
              <div className="w-8 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 ${kycStatus === 'approved' ? 'bg-green-500' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                  {kycStatus === 'approved' ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <FileText className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-600">Approved</span>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Estimated Processing Time</h3>
            <p className="text-gray-600">
              {currentUserType === 'society-member' 
                ? 'Society Member KYC typically takes 24-48 hours for review.'
                : 'Student KYC typically takes 2-4 hours for review.'}
            </p>
          </div>

          {/* Last Checked */}
          <div className="text-sm text-gray-500 mb-6">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={checkKycStatus}
            disabled={isLoading}
            className={`w-full ${currentUserType === 'society-member' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Check Status</span>
              </>
            )}
          </button>

          {/* Additional Information */}
          <div className="mt-6 text-xs text-gray-500">
            <p>Status will automatically update every 30 seconds</p>
            <p>You will be redirected to dashboard once approved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
