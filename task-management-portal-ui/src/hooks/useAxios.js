import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

// Create a default axios instance (configure baseURL as needed or use environment variables)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

export function useAxios() {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Request interceptor to attach bearer token
  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    // Response interceptor to handle unauthorized access
    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err.response && err.response.status === 401) {
          logout();
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [token, logout]);

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({
        method,
        url,
        data,
        ...config,
      });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, config) => request('get', url, null, config), [request]);
  const post = useCallback((url, data, config) => request('post', url, data, config), [request]);
  const put = useCallback((url, data, config) => request('put', url, data, config), [request]);
  const del = useCallback((url, config) => request('delete', url, null, config), [request]);

  return { api: api, get, post, put, delete: del, loading, error };
}