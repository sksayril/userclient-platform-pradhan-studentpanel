import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle, DollarSign, GraduationCap, AlertTriangle, User, Gem, Building2 } from 'lucide-react';
import { submitLoanApplication } from '../../services/api';

interface LoanApplicationProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (loanData: any) => void;
}

interface LoanFormData {
  loanType: 'GOLD' | 'EDUCATION' | 'EMERGENCY' | 'PERSONAL';
  amount: number;
  duration: number;
  purpose: string;
  // Gold loan specific fields
  collateralType?: string;
  collateralWeight?: number;
  collateralPurity?: number;
  collateralEstimatedValue?: number;
  // Education loan specific fields
  institution?: string;
  course?: string;
  courseDuration?: string;
  // Emergency loan specific fields
  emergencyType?: string;
  urgency?: string;
  // Personal loan specific fields
  employmentType?: string;
  monthlyIncome?: number;
  existingObligations?: number;
}

export default function LoanApplication({ isOpen, onClose, onSubmit }: LoanApplicationProps) {
  const [formData, setFormData] = useState<LoanFormData>({
    loanType: 'PERSONAL',
    amount: 0,
    duration: 12,
    purpose: ''
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        loanType: 'PERSONAL',
        amount: 0,
        duration: 12,
        purpose: ''
      });
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loanTypes = [
    { value: 'GOLD', label: 'Gold Loan', icon: Gem, description: 'Secured loan against gold ornaments' },
    { value: 'EDUCATION', label: 'Education Loan', icon: GraduationCap, description: 'Loan for educational purposes' },
    { value: 'EMERGENCY', label: 'Emergency Loan', icon: AlertTriangle, description: 'Quick loan for urgent needs' },
    { value: 'PERSONAL', label: 'Personal Loan', icon: User, description: 'Unsecured personal loan' }
  ];

  const collateralTypes = [
    'GOLD_ORNAMENTS',
    'GOLD_COINS',
    'GOLD_BARS',
    'GOLD_JEWELRY'
  ];

  const emergencyTypes = [
    'MEDICAL',
    'ACCIDENT',
    'NATURAL_DISASTER',
    'FAMILY_EMERGENCY',
    'BUSINESS_EMERGENCY'
  ];

  const urgencyLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const employmentTypes = [
    'SALARIED',
    'SELF_EMPLOYED',
    'BUSINESS_OWNER',
    'FREELANCER',
    'RETIRED'
  ];

  const handleInputChange = (field: keyof LoanFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid loan amount (must be greater than 0)');
      return false;
    }
    if (formData.amount > 10000000) {
      setError('Loan amount cannot exceed ₹1,00,00,000');
      return false;
    }
    if (!formData.purpose.trim()) {
      setError('Please enter the purpose of the loan');
      return false;
    }
    if (formData.duration <= 0 || formData.duration > 120) {
      setError('Please enter a valid loan duration (1-120 months)');
      return false;
    }

    // Validate loan type specific fields
    switch (formData.loanType) {
      case 'GOLD':
        if (!formData.collateralType) {
          setError('Please select a collateral type for gold loan');
          return false;
        }
        if (!formData.collateralWeight || formData.collateralWeight <= 0) {
          setError('Please enter a valid collateral weight');
          return false;
        }
        if (!formData.collateralPurity || formData.collateralPurity <= 0 || formData.collateralPurity > 100) {
          setError('Please enter a valid collateral purity (1-100%)');
          return false;
        }
        if (!formData.collateralEstimatedValue || formData.collateralEstimatedValue <= 0) {
          setError('Please enter a valid estimated collateral value');
          return false;
        }
        break;
      case 'EDUCATION':
        if (!formData.institution?.trim()) {
          setError('Please enter the educational institution name');
          return false;
        }
        if (!formData.course?.trim()) {
          setError('Please enter the course name');
          return false;
        }
        if (!formData.courseDuration?.trim()) {
          setError('Please enter the course duration');
          return false;
        }
        break;
      case 'EMERGENCY':
        if (!formData.emergencyType) {
          setError('Please select an emergency type');
          return false;
        }
        if (!formData.urgency) {
          setError('Please select an urgency level');
          return false;
        }
        break;
      case 'PERSONAL':
        if (!formData.employmentType) {
          setError('Please select an employment type');
          return false;
        }
        if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
          setError('Please enter a valid monthly income');
          return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Prepare the loan application data
      const loanApplicationData = {
        loanType: formData.loanType,
        amount: formData.amount,
        duration: formData.duration,
        purpose: formData.purpose,
        // Add loan type specific fields
        ...(formData.loanType === 'GOLD' && {
          collateralType: formData.collateralType,
          collateralWeight: formData.collateralWeight,
          collateralPurity: formData.collateralPurity,
          collateralEstimatedValue: formData.collateralEstimatedValue
        }),
        ...(formData.loanType === 'EDUCATION' && {
          institution: formData.institution,
          course: formData.course,
          courseDuration: formData.courseDuration
        }),
        ...(formData.loanType === 'EMERGENCY' && {
          emergencyType: formData.emergencyType,
          urgency: formData.urgency
        }),
        ...(formData.loanType === 'PERSONAL' && {
          employmentType: formData.employmentType,
          monthlyIncome: formData.monthlyIncome,
          existingObligations: formData.existingObligations
        })
      };

      // Make API call to submit loan application using the service
      const data = await submitLoanApplication(loanApplicationData, token);
      console.log('Loan application submitted successfully:', data);
      
      // Call the parent onSubmit function with the response data
      await onSubmit(data);
      
      setSuccess('Loan application submitted successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting loan application:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit loan application. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderLoanTypeSpecificFields = () => {
    switch (formData.loanType) {
      case 'GOLD':
        return (
          <div className="space-y-4">
                       <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
             <Gem className="w-5 h-5 mr-2 text-yellow-600" />
             Gold Loan Details
           </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collateral Type *
                </label>
                <select
                  value={formData.collateralType || ''}
                  onChange={(e) => handleInputChange('collateralType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select collateral type</option>
                  {collateralTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (grams) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.collateralWeight || ''}
                  onChange={(e) => handleInputChange('collateralWeight', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 25.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purity (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.collateralPurity || ''}
                  onChange={(e) => handleInputChange('collateralPurity', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 91.6"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Value (₹) *
                </label>
                <input
                  type="number"
                  value={formData.collateralEstimatedValue || ''}
                  onChange={(e) => handleInputChange('collateralEstimatedValue', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 75000"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'EDUCATION':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
              Education Loan Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Institution *
                </label>
                <input
                  type="text"
                  value={formData.institution || ''}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., ABC University"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course *
                </label>
                <input
                  type="text"
                  value={formData.course || ''}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., MBA in Finance"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Duration *
                </label>
                <input
                  type="text"
                  value={formData.courseDuration || ''}
                  onChange={(e) => handleInputChange('courseDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 2 years"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'EMERGENCY':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Emergency Loan Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emergency Type *
                </label>
                <select
                  value={formData.emergencyType || ''}
                  onChange={(e) => handleInputChange('emergencyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select emergency type</option>
                  {emergencyTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Urgency Level *
                </label>
                <select
                  value={formData.urgency || ''}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select urgency level</option>
                  {urgencyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'PERSONAL':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Personal Loan Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employment Type *
                </label>
                <select
                  value={formData.employmentType || ''}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select employment type</option>
                  {employmentTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Income (₹) *
                </label>
                <input
                  type="number"
                  value={formData.monthlyIncome || ''}
                  onChange={(e) => handleInputChange('monthlyIncome', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 45000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Existing Obligations (₹)
                </label>
                <input
                  type="number"
                  value={formData.existingObligations || ''}
                  onChange={(e) => handleInputChange('existingObligations', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Application</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Apply for a loan based on your needs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loan Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Loan Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loanTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    formData.loanType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => handleInputChange('loanType', type.value)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      formData.loanType === type.value ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <type.icon className={`w-5 h-5 ${
                        formData.loanType === type.value ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        formData.loanType === type.value ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                      }`}>
                        {type.label}
                      </h4>
                      <p className={`text-sm ${
                        formData.loanType === type.value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Loan Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loan Amount (₹) *
              </label>
                <input
                 type="number"
                 value={formData.amount || ''}
                 onChange={(e) => handleInputChange('amount', parseInt(e.target.value))}
                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                 placeholder="e.g., 50000"
                 min="1000"
                 max="10000000"
                 step="1000"
                 required
               />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (months) *
              </label>
              <input
                type="number"
                value={formData.duration || ''}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 24"
                min="1"
                max="120"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purpose *
              </label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Business expansion"
                required
              />
            </div>
          </div>

          {/* Loan Type Specific Fields */}
          {renderLoanTypeSpecificFields()}

          {/* Error and Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
