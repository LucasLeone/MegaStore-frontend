import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useVariants = (productId) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVariants = async () => {
    if (!productId) {
      setVariants([]);
      return;
    }

    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/variants`, {
        params: { productId },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setVariants(response.data);
    } catch (err) {
      console.error('Error al cargar las variantes:', err);
      setError('Error al cargar las variantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return { variants, loading, error, fetchVariants };
};

export default useVariants;
