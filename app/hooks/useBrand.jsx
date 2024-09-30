import { useState, useEffect } from 'react';
import api from '@/app/axios';
import Cookies from 'js-cookie';

export default function useBrand(brandId) {
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrand = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/brands/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setBrand(response.data);
    } catch (err) {
      console.error('Error al obtener la marca:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener la marca');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brandId) {
      fetchBrand(brandId);
    }
  }, [brandId]);

  return { brand, loading, error, fetchBrand };
}
