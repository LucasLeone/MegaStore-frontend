// hooks/useSubcategories.js
import { useState, useEffect, useCallback } from 'react';
import api from '@/app/axios';

export default function useSubcategories() {
  const [subcategories, setSubcategories] = useState([]); // Inicializado como arreglo vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubcategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/subcategories');
      setSubcategories(response.data); // Ajusta esto si tu API devuelve algo diferente
    } catch (err) {
      console.error('Error al obtener subcategorías:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener subcategorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  return { subcategories, loading, error, fetchSubcategories };
}
