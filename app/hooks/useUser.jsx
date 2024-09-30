import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setUser(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  return { user, loading, error, fetchUser };
};

export default useUser;
