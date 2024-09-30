import { useState, useEffect, useCallback } from 'react';
import api from '@/app/axios';
import Cookies from 'js-cookie';

export default function useSubcategories(categoryId = null) {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubcategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const params = {};
      if (categoryId !== null) {
        params.categoryId = categoryId;
      }

      const response = await api.get('/subcategories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      setSubcategories(response.data);
    } catch (err) {
      console.error('Error al obtener subcategorías:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Error al obtener subcategorías'
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  return { subcategories, loading, error, fetchSubcategories };
}
