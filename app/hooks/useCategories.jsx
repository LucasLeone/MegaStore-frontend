// hooks/useCategories.js
import { useState, useEffect, useCallback } from 'react';
import api from '@/app/axios';

export default function useCategories() {
  const [categories, setCategories] = useState([]); // Inicializado como arreglo vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/categories');
      setCategories(response.data); // Ajusta esto si tu API devuelve algo diferente
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
