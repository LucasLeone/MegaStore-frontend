import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
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
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts };
};

export default useProducts;
