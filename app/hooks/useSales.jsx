import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/sales', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setSales(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las ventas.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSales();
  }, []);

  return { sales, loading, error, fetchSales };
};

export default useSales;
