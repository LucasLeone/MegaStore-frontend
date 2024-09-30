import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useVariant = (variantId) => {
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVariant = async (id) => {
    if (!id) {
      setVariant(null);
      return;
    }

    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/variants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setVariant(response.data);
    } catch (err) {
      console.error('Error al cargar la variante:', err);
      setError(err.response?.data?.message || 'Error al cargar la variante.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (variantId) {
      fetchVariant(variantId);
    }
  }, [variantId]);

  return { variant, loading, error, fetchVariant };
};

export default useVariant;
