import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import UserTypeSelection from './components/Auth/UserTypeSelection';
import Dashboard from './components/Dashboard/Dashboard';
import SocietyMemberDashboard from './components/Dashboard/SocietyMemberDashboard';
import Courses from './components/Courses/Courses';
import Fees from './components/Fees/Fees';
import Batch from './components/Batch/Batch';
import Profile from './components/Profile/Profile';
import BottomNavigation from './components/Navigation/BottomNavigation';
import { ThemeProvider } from './context/ThemeContext';
import KYC from './components/KYC/KYC';
import KYCWaiting from './components/KYC/KYCWaiting';
import { getKycStatus, getSocietyMemberKycStatus } from './services/api';

type AppTab = 'dashboard' | 'courses' | 'profile' | 'fees' | 'batch';

function App() {
  // Check authentication status - start with false to always show login first
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isKycApproved, setIsKycApproved] = useState(false);
  const [isKycSubmitted, setIsKycSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'student' | 'society-member' | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<'student' | 'society-member' | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType') as 'student' | 'society-member' | null;
      
      if (token && storedUserType) {
        // If token exists, set authenticated and check KYC status
        setIsAuthenticated(true);
        setUserType(storedUserType);
        try {
          let response;
          if (storedUserType === 'student') {
            response = await getKycStatus(token);
          } else {
            response = await getSocietyMemberKycStatus(token);
          }
          
          if (response?.data) {
            if (response.data.isKycApproved) {
              setIsKycApproved(true);
              setIsKycSubmitted(false);
            } else if (response.data.kycStatus === 'submitted' || response.data.kycStatus === 'pending') {
              setIsKycSubmitted(true);
              setIsKycApproved(false);
            } else {
              setIsKycSubmitted(false);
              setIsKycApproved(false);
            }
          }
        } catch (error) {
          console.error("Failed to fetch KYC status", error);
          // If token is invalid, clear it and stay unauthenticated
          localStorage.removeItem('token');
          localStorage.removeItem('studentEmail');
          localStorage.removeItem('student');
          localStorage.removeItem('societyMember');
          localStorage.removeItem('userType');
          setIsAuthenticated(false);
          setUserType(null);
          setIsKycSubmitted(false);
          setIsKycApproved(false);
        }
      }
      setLoading(false);
    };
    checkStatus();
  }, []); // Remove dependency on isAuthenticated to prevent loops



  const handleUserTypeSelection = (type: 'student' | 'society-member') => {
    setSelectedUserType(type);
    navigate('/login');
  };

  const handleBackToUserType = () => {
    setSelectedUserType(null);
    navigate('/');
  };

  const handleLogin = (email: string, type: 'student' | 'society-member') => {
    // The token is already set in the Login component
    if (type === 'student') {
      localStorage.setItem('studentEmail', email);
    } else {
      localStorage.setItem('societyMemberEmail', email);
    }
    setIsAuthenticated(true);
    setUserType(type);
    // After login, redirect to KYC page
    navigate('/kyc');
  };

  const handleSignup = (email: string, type: 'student' | 'society-member') => {
    // The token is already set in the Signup component
    if (type === 'student') {
      localStorage.setItem('studentEmail', email);
    } else {
      localStorage.setItem('societyMemberEmail', email);
    }
    setIsAuthenticated(true);
    setUserType(type);
    // After signup, redirect to KYC page
    navigate('/kyc');
  };

  const handleKycSuccess = () => {
    setIsKycSubmitted(true);
    setIsKycApproved(false);
    navigate('/kyc-waiting');
  };

  const handleKycApproved = () => {
    setIsKycApproved(true);
    setIsKycSubmitted(false);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('student');
    localStorage.removeItem('societyMemberEmail');
    localStorage.removeItem('societyMember');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    setIsKycApproved(false);
    setIsKycSubmitted(false);
    setUserType(null);
    setSelectedUserType(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
        {/* Default route - show user type selection */}
        <Route path="/" element={
          isAuthenticated && isKycApproved ? 
            <Navigate to="/dashboard" /> : 
            isAuthenticated && isKycSubmitted ?
              <Navigate to="/kyc-waiting" /> :
            isAuthenticated && !isKycApproved ?
              <Navigate to="/kyc" /> :
              <UserTypeSelection onSelectUserType={handleUserTypeSelection} />
        } />
        
        {/* Public routes - always accessible */}
        <Route path="/login" element={
          isAuthenticated && isKycApproved ? 
            <Navigate to="/dashboard" /> : 
            isAuthenticated && isKycSubmitted ?
              <Navigate to="/kyc-waiting" /> :
            isAuthenticated && !isKycApproved ?
              <Navigate to="/kyc" /> :
              selectedUserType ? 
                <Login 
                  onLogin={handleLogin} 
                  onSwitchToSignup={() => navigate('/signup')} 
                  onBackToUserType={handleBackToUserType}
                  userType={selectedUserType}
                /> :
                <Navigate to="/" />
        } />
        
        <Route path="/signup" element={
          isAuthenticated && isKycApproved ? 
            <Navigate to="/dashboard" /> : 
            isAuthenticated && isKycSubmitted ?
              <Navigate to="/kyc-waiting" /> :
            isAuthenticated && !isKycApproved ?
              <Navigate to="/kyc" /> :
              selectedUserType ? 
                <Signup 
                  onSignup={handleSignup} 
                  onSwitchToLogin={() => navigate('/login')} 
                  onBackToUserType={handleBackToUserType}
                  userType={selectedUserType}
                /> :
                <Navigate to="/" />
        } />
        
        {/* KYC route - requires authentication */}
        <Route 
          path="/kyc" 
          element={
            !isAuthenticated ? 
              <Navigate to="/" /> :
              isKycApproved ? 
                <Navigate to="/dashboard" /> :
              isKycSubmitted ? 
                <Navigate to="/kyc-waiting" /> :
                <KYC onKycSuccess={handleKycSuccess} userType={userType || undefined} />
          }
        />

        {/* KYC Waiting route - requires authentication and KYC submission */}
        <Route 
          path="/kyc-waiting" 
          element={
            !isAuthenticated ? 
              <Navigate to="/" /> :
              isKycApproved ? 
                <Navigate to="/dashboard" /> :
              !isKycSubmitted ? 
                <Navigate to="/kyc" /> :
                <KYCWaiting onKycApproved={handleKycApproved} userType={userType || undefined} />
          }
        />

        {/* Protected routes - require authentication and KYC approval */}
        <Route 
          path="/*" 
          element={
            !isAuthenticated ? 
              <Navigate to="/" /> :
              !isKycApproved ? 
                (isKycSubmitted ? <Navigate to="/kyc-waiting" /> : <Navigate to="/kyc" />) :
                <MainLayout onLogout={handleLogout} />
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

// The main layout for the authenticated part of the app
function MainLayout({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const studentEmail = localStorage.getItem('studentEmail') || '';
  const userType = localStorage.getItem('userType') as 'student' | 'society-member' | null;

  const renderContent = () => {
    if (userType === 'society-member') {
      // For society members, show a simplified layout without bottom navigation
      return <SocietyMemberDashboard onLogout={onLogout} />;
    }

    // For students, show the original layout with bottom navigation
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onLogout={onLogout} />;
      case 'courses':
        return <Courses />;
      case 'fees':
        return <Fees studentEmail={studentEmail} />;
      case 'batch':
        return <Batch studentEmail={studentEmail} />;
      case 'profile':
        return <Profile studentEmail={studentEmail} />;
      default:
        return <Dashboard onLogout={onLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative">
      {renderContent()}
      {userType === 'student' && (
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
}

export default App;