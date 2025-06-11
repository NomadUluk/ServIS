import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  userId: string;
  role: string;
}

export const isTokenValid = (token: string | null): boolean => {
  console.log('Checking token validity:', token ? 'Token exists' : 'No token');
  
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    console.log('Token expiration:', new Date(decoded.exp * 1000));
    console.log('Current time:', new Date(currentTime * 1000));
    console.log('Token valid:', decoded.exp > currentTime);
    
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const clearAuthData = (): void => {
  console.log('Clearing auth data');
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
};

export const logout = async (): Promise<void> => {
  console.log('Logging out');
  // Clear all auth-related data
  clearAuthData();
  
  // Перенаправляем на страницу входа без добавления в историю браузера
  window.location.replace('/login');
}; 