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
  // A simple auth check. In a real app, this would be more robust.
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isKycApproved, setIsKycApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('token');
      if (isAuthenticated && token) {
        try {
          const response = await getKycStatus(token);
          if (response?.data?.isKycApproved) {
            setIsKycApproved(true);
          }
        } catch (error) {
          console.error("Failed to fetch KYC status", error);
        }
      }
      setLoading(false);
    };
    checkStatus();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading && isKycApproved && location.pathname === '/kyc') {
      navigate('/');
    }
  }, [loading, isKycApproved, location.pathname, navigate]);

  const handleLogin = (email: string) => {
    // The token is already set in the Login component
    localStorage.setItem('studentEmail', email);
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleSignup = (email: string) => {
    // The token is already set in the Signup component
    localStorage.setItem('studentEmail', email);
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleKycSuccess = () => {
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentEmail');
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
        <Route path="/login" element={<Login onLogin={handleLogin} onSwitchToSignup={() => navigate('/signup')} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} onSwitchToLogin={() => navigate('/login')} />} />
        
        <Route 
          path="/kyc" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <KYC onKycSuccess={handleKycSuccess} />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/*" 
          element={
            <KycProtectedRoute isAuthenticated={isAuthenticated} isKycApproved={isKycApproved}>
              <MainLayout onLogout={handleLogout} />
            </KycProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

// A component to protect routes
function ProtectedRoute({ isAuthenticated, children }: { isAuthenticated: boolean, children: JSX.Element }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
}

function KycProtectedRoute({ isAuthenticated, isKycApproved, children }: { isAuthenticated: boolean, isKycApproved: boolean, children: JSX.Element }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (!isKycApproved) {
    return <Navigate to="/kyc" />;
  }
  return children;
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