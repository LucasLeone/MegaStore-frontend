import { useState, useEffect, useCallback } from 'react';
import api from '@/app/axios';
import Cookies from 'js-cookie';

export default function useBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/brands', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setBrands(response.data);
    } catch (err) {
      console.error('Error al obtener marcas:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener marcas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return { brands, loading, error, fetchBrands };
}
