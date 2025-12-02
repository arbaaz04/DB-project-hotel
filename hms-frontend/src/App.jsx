import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReservationForm from './pages/Booking/ReservationForm';
import CheckInOut from './pages/Booking/CheckInOut';
import InventoryManager from './pages/Admin/InventoryManager';
import RatePlanManager from './pages/Admin/RatePlanManager';
import './App.css';
import {
  HomeIcon,
  PlusCircleIcon,
  KeyIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AppContent = () => {
  const { staff, logout, isAuthenticated } = useAuth();
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard setView={setView} />;
      case 'newBooking':
        return <ReservationForm setView={setView} />;
      case 'checkInOut':
        return <CheckInOut setView={setView} />;
      case 'admin':
        return <InventoryManager setView={setView} />;
      case 'ratePlans':
        return <RatePlanManager setView={setView} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">404 - View Not Found</p>
          </div>
        );
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      description: 'View all reservations'
    },
    {
      id: 'newBooking',
      label: 'New Booking',
      icon: PlusCircleIcon,
      description: 'Create reservation'
    },
    {
      id: 'checkInOut',
      label: 'Check-In/Out',
      icon: KeyIcon,
      description: 'Guest entry & exit'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Cog6ToothIcon,
      description: 'Inventory & rooms'
    },
    {
      id: 'ratePlans',
      label: 'Rate Plans',
      icon: CurrencyDollarIcon,
      description: 'Pricing & seasons'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-1 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-100 transition-all duration-300 flex flex-col shadow-xs`}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-700 text-gray-900 tracking-tight">HMS</h1>
              <p className="text-xs text-gray-5 font-600">Hotel Management</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? (
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <Bars3Icon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                  view === item.id
                    ? 'bg-blue-50 text-blue-700 font-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 truncate">{item.label}</p>
                    {view === item.id && (
                      <p className="text-xs text-blue-600 truncate">{item.description}</p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-100 p-3">
          {sidebarOpen ? (
            <div className="mb-2 px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-xs font-600 text-gray-900">{staff?.userName}</p>
              <p className="text-xs text-gray-5 capitalize">{staff?.role}</p>
            </div>
          ) : (
            <div className="mb-2 px-3 py-2 bg-gray-50 rounded-lg text-center">
              <p className="text-xs font-700 text-gray-700">{staff?.userName?.charAt(0).toUpperCase()}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {sidebarOpen && <span className="font-600">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0 h-20 shadow-xs">
          <div>
            <h2 className="text-2xl font-700 text-gray-900 tracking-tight">
              {navItems.find(item => item.id === view)?.label || 'Dashboard'}
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {navItems.find(item => item.id === view)?.description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-700 font-600">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-5">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </header>

        {/* Page Content with Scroll */}
        <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 5rem)' }}>
          <div className="p-6 max-w-7xl mx-auto w-full h-full">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
