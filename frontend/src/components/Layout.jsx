import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, PlusSquare, Moon, Sun, User } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = (path) => {
    const isActive = location.pathname === path;
    return `inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
    }`;
  };

  const getFirstName = () => {
    let fullName = user?.displayname || user?.name || '';
    if (!fullName && user?.email) {
      fullName = user.email.split('@')[0];
    }
    if (!fullName) return 'User';
    
    // Capitalize first letter of the first name
    const firstName = fullName.split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
      <header className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="flex items-center space-x-2 group">
                  <img src="/logo.jpg" alt="FlowPilot Logo" className="h-8 w-8 object-contain rounded-full border border-gray-200 dark:border-gray-700 group-hover:shadow-md transition-all" />
                  <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 group-hover:text-primary-500 transition">
                    FlowPilot
                  </span>
                </Link>
              </div>
              <nav className="ml-8 flex space-x-4 items-center">
                <Link to="/dashboard" className={navItemClass('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/create" className={navItemClass('/create')}>
                  <PlusSquare className="w-4 h-4 mr-2" />
                  Create Workflow
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center border-l border-gray-200 dark:border-gray-700 pl-4">
                <Link to="/profile" className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mr-4 font-medium transition-colors group">
                  <User className="w-5 h-5 mr-2 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <span>Welcome {getFirstName()}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-500 bg-transparent hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 focus:outline-none transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
