// hooks/useReports.js
import { useState, useCallback } from 'react';
import api from '@/app/axios';
import Cookies from 'js-cookie';

export default function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async (filters) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');

    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const baseUrl = '/sales/reports';
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    try {
      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReports(response.data);
    } catch (err) {
      console.error('Error al obtener los reportes:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener los reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  return { reports, loading, error, fetchReports };
}
