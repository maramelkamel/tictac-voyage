// src/hooks/useAdminStats.js
import { useState, useEffect, useCallback } from 'react';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/stats`;

export const useAdminStats = (refreshInterval = 60000) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetch_ = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res  = await fetch(API, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur API');
      setData(json.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const interval = setInterval(() => fetch_(true), refreshInterval);
    return () => clearInterval(interval);
  }, [fetch_, refreshInterval]);

  return { data, loading, error, lastUpdated, refresh: () => fetch_() };
};