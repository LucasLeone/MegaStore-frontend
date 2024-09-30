import { useState, useEffect, useCallback } from 'react';
import api from '@/app/axios';
import Cookies from 'js-cookie';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Error al obtener categorías:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, fetchCategories };
}
