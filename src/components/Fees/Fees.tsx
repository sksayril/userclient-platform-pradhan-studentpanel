import React, { useState } from 'react';
import { Search, Filter, CreditCard, Receipt, DollarSign } from 'lucide-react';

interface FeeTransaction {
  id: string;
  courseName: string;
  description: string;
  amount: number;
  date: string;
  type: 'online' | 'offline';
  status: 'paid' | 'unpaid' | 'pending';
  installment: number;
  totalInstallments: number;
}

interface FeesProps {
  studentEmail?: string;
}

export default function Fees({ studentEmail }: FeesProps) {
  const [activeTab, setActiveTab] = useState<'unpaid' | 'upcoming' | 'paid' | 'overview'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for current student - replace with actual API calls
  const feeData = {
    totalFees: 120000,
    totalPaid: 85000,
    totalUnpaid: 35000,
    offline: 45000,
    online: 40000,
    pending: 15000,
  };

  const transactions: FeeTransaction[] = [
    {
      id: '1',
      courseName: 'Physics',
      description: 'Physics Batch 12 Installment - 2',
      amount: 20000,
      date: '06 June 2024',
      type: 'online',
      status: 'paid',
      installment: 2,
      totalInstallments: 4,
    },
    {
      id: '2',
      courseName: 'Chemistry',
      description: 'Chemistry Batch 8 Installment - 1',
      amount: 25000,
      date: '05 June 2024',
      type: 'offline',
      status: 'paid',
      installment: 1,
      totalInstallments: 3,
    },
    {
      id: '3',
      courseName: 'Mathematics',
      description: 'Mathematics Batch 15 Installment - 3',
      amount: 30000,
      date: '04 June 2024',
      type: 'online',
      status: 'unpaid',
      installment: 3,
      totalInstallments: 4,
    },
    {
      id: '4',
      courseName: 'Biology',
      description: 'Biology Batch 10 Installment - 1',
      amount: 25000,
      date: '03 June 2024',
      type: 'offline',
      status: 'pending',
      installment: 1,
      totalInstallments: 3,
    },
    {
      id: '5',
      courseName: 'Physics',
      description: 'Physics Batch 12 Installment - 1',
      amount: 20000,
      date: '01 May 2024',
      type: 'online',
      status: 'paid',
      installment: 1,
      totalInstallments: 4,
    },
    {
      id: '6',
      courseName: 'Chemistry',
      description: 'Chemistry Batch 8 Installment - 2',
      amount: 25000,
      date: '15 May 2024',
      type: 'offline',
      status: 'paid',
      installment: 2,
      totalInstallments: 3,
    },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'overview' || transaction.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'unpaid':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'online' ? <CreditCard className="w-4 h-4" /> : <Receipt className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
             {/* Header */}
       <div className="bg-white shadow-sm border-b border-gray-200">
         <div className="px-4 py-6">
           <h1 className="text-2xl font-bold text-gray-900 mb-2">My Fees</h1>
           <p className="text-gray-600">
             {studentEmail ? `Fee transactions for ${studentEmail}` : 'Track your fee payments and transactions'}
           </p>
         </div>
       </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex space-x-8 px-4 overflow-x-auto">
                     {[
             { id: 'overview', label: 'OVERVIEW' },
             { id: 'unpaid', label: 'UNPAID' },
             { id: 'upcoming', label: 'UPCOMING' },
             { id: 'paid', label: 'PAID' },
           ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Course or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Fee Summary Cards */}
      <div className="bg-white px-4 py-6 border-b border-gray-200">
                 <div className="mb-6">
           <h2 className="text-lg font-semibold text-gray-900 mb-2">My Fee Summary</h2>
           <div className="text-3xl font-bold text-green-600">₹ {feeData.totalPaid.toLocaleString()}</div>
           <p className="text-gray-600 text-sm">Total fees paid</p>
         </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Offline</span>
              <Receipt className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">₹ {feeData.offline.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Online</span>
              <CreditCard className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">₹ {feeData.online.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
                     <div className="bg-red-50 rounded-lg p-4">
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-medium text-red-600">Unpaid</span>
               <DollarSign className="w-4 h-4 text-red-500" />
             </div>
             <div className="text-xl font-bold text-red-600">₹ {feeData.totalUnpaid.toLocaleString()}</div>
           </div>
           <div className="bg-yellow-50 rounded-lg p-4">
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-medium text-yellow-600">Pending</span>
               <DollarSign className="w-4 h-4 text-yellow-500" />
             </div>
             <div className="text-xl font-bold text-yellow-600">₹ {feeData.pending.toLocaleString()}</div>
           </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white">
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">TRANSACTIONS</h3>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">FILTER</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(transaction.status)}`}>
                    {getTypeIcon(transaction.type)}
                  </div>
                                     <div>
                     <h4 className="font-medium text-gray-900">{transaction.courseName}</h4>
                     <p className="text-sm text-gray-600">{transaction.description}</p>
                     <div className="flex items-center mt-1">
                       <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                         <div 
                           className="bg-blue-600 h-1.5 rounded-full" 
                           style={{ width: `${(transaction.installment / transaction.totalInstallments) * 100}%` }}
                         ></div>
                       </div>
                       <span className="text-xs text-gray-500">
                         {transaction.installment}/{transaction.totalInstallments} installments
                       </span>
                     </div>
                   </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ₹{transaction.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">{transaction.date}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {transaction.type} payment
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
} 