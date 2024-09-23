import { useState, useEffect, useCallback } from 'react';
import api from '@/app/axios';

export default function useBrands() {
  const [brands, setBrands] = useState([]); // Inicializado como arreglo vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/brands');
      setBrands(response.data); // Ajusta esto si tu API devuelve algo diferente
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
