import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import ResetPassword from './components/ResetPassword';
import { GlobalStyle } from './GlobalStyles';
import { isTokenValid } from './utils/auth';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      console.log('Checking authentication...');
      
      if (token && isTokenValid(token)) {
        console.log('Valid token found');
        setIsAuthenticated(true);
      } else {
        console.log('No valid token found');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    // Проверяем авторизацию при монтировании
    checkAuth();
    
    // Проверяем авторизацию каждую минуту
    const interval = setInterval(checkAuth, 60000);
    
    // Очищаем интервал при размонтировании
    return () => clearInterval(interval);
  }, []);

  // Показываем загрузку при первой проверке токена
  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Router>
      <GlobalStyle />
      <Routes>
        {/* Страница логина */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/admin/reports" replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        
        {/* Страница сброса пароля */}
        <Route 
          path="/reset-password/:token" 
          element={<ResetPassword />} 
        />
        
        {/* Защищенные маршруты админ-панели */}
        <Route 
          path="/admin/*" 
          element={
            isAuthenticated ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Корневой маршрут */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/admin/reports" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Любой другой маршрут */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to="/admin/reports" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App; 