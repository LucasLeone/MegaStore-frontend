import { useState, useEffect } from 'react';
import api from '../axios';

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

    try {
      const response = await api.get(`/variants`, {
        params: { productId },
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
  }, [productId]); // Se vuelve a ejecutar cuando cambia el productId

  return { variants, loading, error, fetchVariants };
};

export default useVariants;
