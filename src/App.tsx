import React, { useState } from 'react';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Courses from './components/Courses/Courses';
import Fees from './components/Fees/Fees';
import Batch from './components/Batch/Batch';
import Profile from './components/Profile/Profile';
import BottomNavigation from './components/Navigation/BottomNavigation';
import { ThemeProvider } from './context/ThemeContext';

type AuthMode = 'login' | 'signup';
type AppTab = 'dashboard' | 'courses' | 'profile' | 'fees' | 'batch';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [studentEmail, setStudentEmail] = useState('');

  const handleLogin = (email: string) => {
    setStudentEmail(email);
    setIsAuthenticated(true);
  };

  const handleSignup = (email: string) => {
    setStudentEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStudentEmail('');
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard studentEmail={studentEmail} />;
      case 'courses':
        return <Courses />;
      case 'fees':
        return <Fees studentEmail={studentEmail} />;
      case 'batch':
        return <Batch studentEmail={studentEmail} />;
      case 'profile':
        return <Profile studentEmail={studentEmail} />;
      default:
        return <Dashboard studentEmail={studentEmail} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative">
        {!isAuthenticated ? (
          <>
            {authMode === 'login' ? (
              <Login 
                onLogin={handleLogin}
                onSwitchToSignup={() => setAuthMode('signup')}
              />
            ) : (
              <Signup 
                onSignup={handleSignup}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </>
        ) : (
          <>
            {/* Main Content */}
            {renderContent()}
            
            {/* Bottom Navigation */}
            <BottomNavigation 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;