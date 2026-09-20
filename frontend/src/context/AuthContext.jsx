import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopsphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('shopsphere_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('shopsphere_user', JSON.stringify(res.data.user));
        } catch (err) {
          localStorage.removeItem('shopsphere_token');
          localStorage.removeItem('shopsphere_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('shopsphere_token', access_token);
      localStorage.setItem('shopsphere_user', JSON.stringify(userData));
      setUser(userData);
      addToast(`Welcome back, ${userData.full_name}!`, 'success');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const res = await api.post('/auth/google', { credential });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('shopsphere_token', access_token);
      localStorage.setItem('shopsphere_user', JSON.stringify(userData));
      setUser(userData);
      addToast(`Welcome, ${userData.full_name}! Signed in with Google.`, 'success');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || 'Google authentication failed';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const register = async (email, password, full_name, phone = '') => {
    try {
      const res = await api.post('/auth/register', { email, password, full_name, phone });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('shopsphere_token', access_token);
      localStorage.setItem('shopsphere_user', JSON.stringify(userData));
      setUser(userData);
      addToast('Account registered successfully!', 'success');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('shopsphere_token');
    localStorage.removeItem('shopsphere_user');
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      setUser(res.data.user);
      localStorage.setItem('shopsphere_user', JSON.stringify(res.data.user));
      addToast('Profile updated', 'success');
      return true;
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
