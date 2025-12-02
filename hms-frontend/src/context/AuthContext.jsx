// hms-frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedStaff = localStorage.getItem('staff');
    if (savedStaff) {
      try {
        setStaff(JSON.parse(savedStaff));
      } catch (e) {
        localStorage.removeItem('staff');
      }
    }
    setLoading(false);
  }, []);

  const login = (staffData) => {
    setStaff(staffData);
    localStorage.setItem('staff', JSON.stringify(staffData));
  };

  const logout = () => {
    setStaff(null);
    localStorage.removeItem('staff');
  };

  const value = {
    staff,
    loading,
    login,
    logout,
    isAuthenticated: !!staff
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
