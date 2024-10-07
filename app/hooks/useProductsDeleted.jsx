import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProductsDeleted = () => {
  const [productsDeleted, setProductsDeleted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductsDeleted = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/products/deleted', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setProductsDeleted(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los productos eliminados.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProductsDeleted();
  }, []);

  return { productsDeleted, loading, error, fetchProductsDeleted };
};

export default useProductsDeleted;
