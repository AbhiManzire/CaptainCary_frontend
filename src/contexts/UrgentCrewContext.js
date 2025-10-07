import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const UrgentCrewContext = createContext();

export const useUrgentCrew = () => {
  const context = useContext(UrgentCrewContext);
  if (!context) {
    throw new Error('useUrgentCrew must be used within an UrgentCrewProvider');
  }
  return context;
};

export const UrgentCrewProvider = ({ children }) => {
  const [urgentCrew, setUrgentCrew] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUrgentCrew = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setUrgentCrew(response.data?.urgentCrew || []);
    } catch (error) {
      console.error('Error fetching urgent crew:', error);
      setUrgentCrew([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrgentCrew();
  }, []);

  const value = {
    urgentCrew,
    loading,
    fetchUrgentCrew
  };

  return (
    <UrgentCrewContext.Provider value={value}>
      {children}
    </UrgentCrewContext.Provider>
  );
};
