import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Courses from './components/Courses/Courses';
import Fees from './components/Fees/Fees';
import Batch from './components/Batch/Batch';
import Profile from './components/Profile/Profile';
import BottomNavigation from './components/Navigation/BottomNavigation';
import { ThemeProvider } from './context/ThemeContext';
import KYC from './components/KYC/KYC';
import { getKycStatus } from './services/api';

type AppTab = 'dashboard' | 'courses' | 'profile' | 'fees' | 'batch';

function App() {
  // Check authentication status - start with false to always show login first
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isKycApproved, setIsKycApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // If token exists, set authenticated and check KYC status
        setIsAuthenticated(true);
        try {
          const response = await getKycStatus(token);
          if (response?.data?.isKycApproved) {
            setIsKycApproved(true);
          }
        } catch (error) {
          console.error("Failed to fetch KYC status", error);
          // If token is invalid, clear it and stay unauthenticated
          localStorage.removeItem('token');
          localStorage.removeItem('studentEmail');
          localStorage.removeItem('student');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    checkStatus();
  }, []); // Remove dependency on isAuthenticated to prevent loops

  // Redirect logic based on authentication and KYC status
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // If not authenticated, always redirect to login (except signup page)
        if (location.pathname !== '/login' && location.pathname !== '/signup') {
          navigate('/login');
        }
      } else if (isAuthenticated && !isKycApproved) {
        // If authenticated but KYC not approved, redirect to KYC
        if (location.pathname !== '/kyc') {
          navigate('/kyc');
        }
      } else if (isAuthenticated && isKycApproved) {
        // If authenticated and KYC approved, redirect to dashboard
        if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/kyc' || location.pathname === '/') {
          navigate('/dashboard');
        }
      }
    }
  }, [loading, isAuthenticated, isKycApproved, location.pathname, navigate]);

  const handleLogin = (email: string) => {
    // The token is already set in the Login component
    localStorage.setItem('studentEmail', email);
    setIsAuthenticated(true);
    // After login, redirect to KYC page
    navigate('/kyc');
  };

  const handleSignup = (email: string) => {
    // The token is already set in the Signup component
    localStorage.setItem('studentEmail', email);
    setIsAuthenticated(true);
    // After signup, redirect to KYC page
    navigate('/kyc');
  };

  const handleKycSuccess = () => {
    setIsKycApproved(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('student');
    setIsAuthenticated(false);
    setIsKycApproved(false);
    navigate('/login');
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
        {/* Default route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Public routes - always accessible */}
        <Route path="/login" element={
          isAuthenticated && isKycApproved ? 
            <Navigate to="/dashboard" /> : 
            isAuthenticated && !isKycApproved ?
              <Navigate to="/kyc" /> :
              <Login onLogin={handleLogin} onSwitchToSignup={() => navigate('/signup')} />
        } />
        
        <Route path="/signup" element={
          isAuthenticated && isKycApproved ? 
            <Navigate to="/dashboard" /> : 
            isAuthenticated && !isKycApproved ?
              <Navigate to="/kyc" /> :
              <Signup onSignup={handleSignup} onSwitchToLogin={() => navigate('/login')} />
        } />
        
        {/* KYC route - requires authentication */}
        <Route 
          path="/kyc" 
          element={
            !isAuthenticated ? 
              <Navigate to="/login" /> :
              isKycApproved ? 
                <Navigate to="/dashboard" /> :
                <KYC onKycSuccess={handleKycSuccess} />
          }
        />

        {/* Protected routes - require authentication and KYC approval */}
        <Route 
          path="/*" 
          element={
            !isAuthenticated ? 
              <Navigate to="/login" /> :
              !isKycApproved ? 
                <Navigate to="/kyc" /> :
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

  const renderContent = () => {
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
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

export default App;