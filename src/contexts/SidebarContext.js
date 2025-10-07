import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children, type = 'admin' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(`${type}SidebarOpen`);
      return saved !== null ? JSON.parse(saved) : true;
    } catch (error) {
      console.warn('Failed to parse sidebar state from localStorage:', error);
      return true;
    }
  });

  // Save sidebar state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${type}SidebarOpen`, JSON.stringify(sidebarOpen));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [sidebarOpen, type]); // Keep type dependency for proper state management

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newState = !prev;
      try {
        localStorage.setItem(`${type}SidebarOpen`, JSON.stringify(newState));
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error);
      }
      return newState;
    });
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    try {
      localStorage.setItem(`${type}SidebarOpen`, JSON.stringify(true));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    try {
      localStorage.setItem(`${type}SidebarOpen`, JSON.stringify(false));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  };

  const value = useMemo(() => ({
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar
  }), [sidebarOpen]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
