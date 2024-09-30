import { useState, useEffect } from 'react';
import api from '@/app/axios';
import Cookies from 'js-cookie';

export default function useSubcategory(subcategoryId) {
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubcategory = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/subcategories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setSubcategory(response.data);
    } catch (err) {
      console.error('Error al obtener la subcategoría:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener la subcategoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subcategoryId) {
      fetchSubcategory(subcategoryId);
    }
  }, [subcategoryId]);

  return { subcategory, loading, error, fetchSubcategory };
}
