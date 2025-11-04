import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

const logout = async () => {
  const token = localStorage.getItem('auth_token');
  
  // Call backend logout (optional but good practice)
  if (token) {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // CLEAR EVERYTHING from localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  
  // Clear React state
  setUser(null);
  
  // Force redirect to login
  window.location.href = '/login';
};

  return { user, loading, login, logout };
};