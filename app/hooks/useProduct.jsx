import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduct = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setProduct(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el producto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  return { product, loading, error, fetchProduct };
};

export default useProduct;
