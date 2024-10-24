import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProducts = (filters) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (appliedFilters) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: appliedFilters,
      });
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  return { products, loading, error, fetchProducts };
};

export default useProducts;
