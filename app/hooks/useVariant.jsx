// src/app/hooks/useVariant.js

import { useState, useEffect } from 'react';
import api from '../axios';

/**
 * Hook para obtener los detalles de una variante específica.
 *
 * @param {string | number} variantId - El ID de la variante a obtener.
 * @returns {object} - Contiene la variante, estados de carga y error.
 */
const useVariant = (variantId) => {
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVariant = async () => {
    if (!variantId) {
      setVariant(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/variants/${variantId}`);
      setVariant(response.data);
    } catch (err) {
      console.error('Error al cargar la variante:', err);
      // Asumiendo que la API devuelve un objeto con `message`
      setError(err.response?.data?.message || 'Error al cargar la variante.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId]); // Se vuelve a ejecutar cuando cambia el variantId

  return { variant, loading, error, fetchVariant };
};

export default useVariant;
