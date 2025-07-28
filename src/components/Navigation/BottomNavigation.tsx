import React from 'react';
import { Home, BookOpen, User, CreditCard, Calendar, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'courses' | 'profile' | 'fees' | 'batch';
  onTabChange: (tab: 'dashboard' | 'courses' | 'profile' | 'fees' | 'batch') => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home,
      gradient: isDark ? 'from-blue-400 to-blue-500' : 'from-blue-500 to-blue-600',
      activeGradient: isDark ? 'from-blue-500 to-blue-600' : 'from-blue-600 to-blue-700',
      shadowColor: 'shadow-blue-500/30',
      iconColor: isDark ? 'text-blue-400' : 'text-blue-600'
    },
    { 
      id: 'courses', 
      label: 'Courses', 
      icon: BookOpen,
      gradient: isDark ? 'from-purple-400 to-purple-500' : 'from-purple-500 to-purple-600',
      activeGradient: isDark ? 'from-purple-500 to-purple-600' : 'from-purple-600 to-purple-700',
      shadowColor: 'shadow-purple-500/30',
      iconColor: isDark ? 'text-purple-400' : 'text-purple-600'
    },
    { 
      id: 'fees', 
      label: 'Fees', 
      icon: CreditCard,
      gradient: isDark ? 'from-green-400 to-green-500' : 'from-green-500 to-green-600',
      activeGradient: isDark ? 'from-green-500 to-green-600' : 'from-green-600 to-green-700',
      shadowColor: 'shadow-green-500/30',
      iconColor: isDark ? 'text-green-400' : 'text-green-600'
    },
    { 
      id: 'batch', 
      label: 'My Batch', 
      icon: Calendar,
      gradient: isDark ? 'from-orange-400 to-orange-500' : 'from-orange-500 to-orange-600',
      activeGradient: isDark ? 'from-orange-500 to-orange-600' : 'from-orange-600 to-orange-700',
      shadowColor: 'shadow-orange-500/30',
      iconColor: isDark ? 'text-orange-400' : 'text-orange-600'
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      gradient: isDark ? 'from-pink-400 to-pink-500' : 'from-pink-500 to-pink-600',
      activeGradient: isDark ? 'from-pink-500 to-pink-600' : 'from-pink-600 to-pink-700',
      shadowColor: 'shadow-pink-500/30',
      iconColor: isDark ? 'text-pink-400' : 'text-pink-600'
    },
  ] as const;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className={`absolute -top-12 right-4 p-2 rounded-full transition-all duration-300 ${
          isDark 
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-100 shadow-lg'
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Main container with theme-aware background */}
      <div className={`relative p-2 backdrop-blur-xl rounded-2xl shadow-lg border transition-all duration-300 ${
        isDark 
          ? 'bg-gray-900/90 border-gray-700/30' 
          : 'bg-white/95 border-white/20'
      }`}>
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r transition-all duration-300 ${
          isDark
            ? 'from-blue-500/5 to-purple-500/5'
            : 'from-blue-500/10 to-purple-500/10'
        }`} />
        
        {/* Navigation content */}
        <div className="relative max-w-md mx-auto">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative group flex flex-col items-center justify-center w-16 py-2 ${
                    isActive ? 'z-10' : 'z-0'
                  }`}
                >
                  {/* Active tab background with theme-aware styling */}
                  {isActive && (
                    <>
                      {/* Solid background for better visibility */}
                      <div className={`absolute inset-0 rounded-xl shadow-md transition-colors ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      }`} />
                      
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-b ${tab.activeGradient} opacity-10 rounded-xl`} />
                      
                      {/* Active indicator line */}
                      <div className={`absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r ${tab.gradient} rounded-full animate-fade-in ${tab.shadowColor}`} />
                    </>
                  )}

                  {/* Icon container with preserved visibility */}
                  <div className={`relative flex items-center justify-center mb-1 transition-all duration-300 ease-out group-hover:scale-110 ${
                    isActive ? 'transform -translate-y-1' : ''
                  }`}>
                    {/* Enhanced glow effect for active state */}
                    {isActive && (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} blur-lg opacity-30 animate-pulse-slow rounded-full scale-150`} />
                        <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} blur-md opacity-20 animate-pulse rounded-full scale-125`} />
                      </>
                    )}
                    
                    {/* Icon with preserved visibility */}
                    <div className="relative z-10">
                      <Icon 
                        className={`w-6 h-6 transition-all duration-300 stroke-2 ${
                          isActive 
                            ? tab.iconColor
                            : isDark ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-900'
                        }`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                  </div>

                  {/* Label with enhanced visibility */}
                  <span className={`relative z-10 text-xs font-semibold transition-all duration-300 ${
                    isActive 
                      ? tab.iconColor
                      : isDark ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-900'
                  }`}>
                    {tab.label}
                  </span>

                  {/* Enhanced hover effect */}
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-b ${tab.gradient} opacity-5` 
                      : isDark 
                        ? 'bg-transparent group-hover:bg-gray-700/50'
                        : 'bg-transparent group-hover:bg-gray-100'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}