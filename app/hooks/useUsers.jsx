import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, fetchUsers };
};

export default useUsers;
