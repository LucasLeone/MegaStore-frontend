import { useState, useEffect } from 'react';
import api from '@/app/axios';
import Cookies from 'js-cookie';

export default function useCategory(categoryId) {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategory = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setCategory(response.data);
    } catch (err) {
      console.error('Error al obtener la categoría:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener la categoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId);
    }
  }, [categoryId]);

  return { category, loading, error, fetchCategory };
}
