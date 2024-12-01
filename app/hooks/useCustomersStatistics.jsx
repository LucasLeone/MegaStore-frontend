import { useState, useEffect, useCallback } from 'react';
import api from '@/app/axios';
import Cookies from 'js-cookie';

export default function useCustomersStatistics() {
  const [customersStatistics, setCustomersStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomersStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/sales/customer-statistics', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setCustomersStatistics(response.data);
    } catch (err) {
      console.error('Error al obtener las estadísticas de clientes:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener las estadísticas de clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomersStatistics();
  }, [fetchCustomersStatistics]);

  return { customersStatistics, loading, error, fetchCustomersStatistics };
}
