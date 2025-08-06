import { useState, useEffect } from 'react';
import { uploadKycData, getKycStatus } from '../../services/api';

interface KycStatusData {
  kycStatus: string;
  isKycApproved: boolean;
  kycRejectionReason: string | null;
}

interface KYCProps {
  onKycSuccess: () => void;
}

export default function KYC({ onKycSuccess }: KYCProps) {
  const [formData, setFormData] = useState({
    aadharNumber: '',
    panNumber: '',
  });

  const [files, setFiles] = useState<{
    aadharDocument: File | null;
    panDocument: File | null;
    profilePhoto: File | null;
  }> ({
    aadharDocument: null,
    panDocument: null,
    profilePhoto: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatusData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkKycStatusOnLoad = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // This should be handled by the ProtectedRoute, but it's a safeguard.
        return;
      }
      try {
        const response = await getKycStatus(token);
        if (response && response.data && response.data.isKycApproved) {
          onKycSuccess();
        }
      } catch (error) {
        // Don't show an alert on automatic check to avoid interrupting the user.
        console.error('Failed to automatically check KYC status:', error);
      }
    };

    checkKycStatusOnLoad();
  }, [onKycSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: inputFiles[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication error. Please log in again.');
      setIsLoading(false);
      return;
    }

    if (!files.aadharDocument || !files.panDocument || !files.profilePhoto) {
        alert('Please upload all required documents.');
        setIsLoading(false);
        return;
    }

    const kycFormData = new FormData();
    kycFormData.append('aadharNumber', formData.aadharNumber);
    kycFormData.append('panNumber', formData.panNumber);
    kycFormData.append('aadharDocument', files.aadharDocument);
    kycFormData.append('panDocument', files.panDocument);
    kycFormData.append('profilePhoto', files.profilePhoto);

    try {
      const response = await uploadKycData(kycFormData, token);
      console.log('KYC upload successful:', response);
      alert('KYC details submitted successfully! Your application is under review.');
      onKycSuccess();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unexpected error occurred during KYC submission.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusCheck = async () => {
    setIsStatusLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication error. Please log in again.');
      setIsStatusLoading(false);
      return;
    }
    try {
      const response = await getKycStatus(token);
      if (response && response.data) {
        setKycStatus(response.data);
        setIsModalOpen(true);
      } else {
        throw new Error('Invalid status response from server.');
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unexpected error occurred while fetching KYC status.');
      }
    } finally {
      setIsStatusLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">KYC Verification</h1>
            <button 
              onClick={handleStatusCheck}
              disabled={isStatusLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isStatusLoading ? 'Checking...' : 'KYC Status'}
            </button>
          </div>
        <p className="text-gray-600 mb-6 text-center">Please complete your KYC to access all features.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700">Aadhar Number</label>
            <input
              type="text"
              name="aadharNumber"
              id="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">PAN Number</label>
            <input
              type="text"
              name="panNumber"
              id="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="aadharDocument" className="block text-sm font-medium text-gray-700">Aadhar Document</label>
            <input
              type="file"
              name="aadharDocument"
              id="aadharDocument"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>
          <div>
            <label htmlFor="panDocument" className="block text-sm font-medium text-gray-700">PAN Document</label>
            <input
              type="file"
              name="panDocument"
              id="panDocument"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>
          <div>
            <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700">Profile Photo</label>
            <input
              type="file"
              name="profilePhoto"
              id="profilePhoto"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
            Submit for Verification
          </button>
        </form>
      </div>
    </div>

    {isModalOpen && kycStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">Your KYC Status</h2>
            <div className="space-y-3 text-left">
              <p className="flex justify-between"><strong>Approval Status:</strong> 
                <span className={`font-semibold ${kycStatus.isKycApproved ? 'text-green-600' : 'text-red-600'}`}>
                  {kycStatus.isKycApproved ? 'Approved' : 'Not Approved'}
                </span>
              </p>
              <p className="flex justify-between"><strong>Application Stage:</strong> <span className="capitalize font-medium">{kycStatus.kycStatus}</span></p>
              {kycStatus.kycRejectionReason && (
                <p><strong>Reason for Rejection:</strong> {kycStatus.kycRejectionReason}</p>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
