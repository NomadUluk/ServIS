import React, { useState, FormEvent } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  background-color: #2D1B69;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginBox = styled.div<{ $isShaking: boolean }>`
  background: white;
  padding: 2.5rem;
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 0 32px 8px rgba(150, 108, 243, 0.18);
  animation: ${props => props.$isShaking && css`${shakeAnimation} 0.5s ease-in-out`};
`;

const Title = styled.h1`
  color: #2D1B69;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2D1B69;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid rgba(45, 27, 105, 0.2);
  border-radius: 16px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2D1B69;
    box-shadow: 0 0 0 3px rgba(45, 27, 105, 0.1);
  }

  &[type="password"] {
    padding-right: 2.5rem; /* Оставляем место для иконки */
  }
`;

const Button = styled.button`
  background: #2D1B69;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3d2589;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const ForgotPassword = styled.button`
  background: none;
  border: none;
  color: #2D1B69;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 0.5rem;
  &:hover {
    color: #3d2589;
  }
`;

const MessageContainer = styled.div<{ $error?: boolean }>`
  color: ${props => props.$error ? '#ff0000' : '#008000'};
  text-align: center;
  margin-bottom: 1rem;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #718096;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  &:hover {
    color: #2D1B69;
  }

  &:focus {
    outline: none;
  }
`;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restoreSent, setRestoreSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const navigate = useNavigate();

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const handleError = (errorMessage: string) => {
    setMessage(errorMessage);
    setIsError(true);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500); // Сбрасываем состояние тряски после завершения анимации
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      console.log('Attempting login...');
      const response = await api.post('/auth/login', {
        username: email,
        password
      });

      console.log('Login successful, saving token...');
      localStorage.setItem('token', response.data.token);
      
      // Принудительно обновляем страницу для перезагрузки состояния приложения
      console.log('Reloading application...');
      window.location.href = '/admin/reports';
    } catch (error: any) {
      console.error('Login error:', error);
      handleError(error.response?.data?.message || 'Произошла ошибка при попытке входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: restoreEmail }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Произошла ошибка при восстановлении пароля');
      }

      setMessage(data.message || 'Инструкции по восстановлению пароля отправлены на ваш email');
      setIsError(false);
      if (response.ok) {
        setRestoreSent(true);
      }
    } catch (error) {
      console.error('Ошибка при восстановлении:', error);
      setMessage(error instanceof Error ? error.message : 'Произошла ошибка при отправке запроса');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginBox $isShaking={isShaking}>
        <Title>{showRestore ? 'Восстановление пароля' : 'Вход в систему'}</Title>
        {message && (
          <MessageContainer $error={isError}>
            {message}
          </MessageContainer>
        )}
        {!showRestore ? (
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </InputGroup>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </PasswordToggle>
            </InputGroup>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
            <ForgotPassword type="button" onClick={() => setShowRestore(true)}>
              Забыли пароль?
            </ForgotPassword>
          </Form>
        ) : (
          <Form onSubmit={handleRestore}>
            <InputGroup>
              <Input
                type="email"
                value={restoreEmail}
                onChange={(e) => setRestoreEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </InputGroup>
            <Button type="submit" disabled={isLoading || restoreSent}>
              {isLoading ? 'Отправка...' : 'Восстановить пароль'}
            </Button>
            <ForgotPassword type="button" onClick={() => setShowRestore(false)}>
              Вернуться к входу
            </ForgotPassword>
          </Form>
        )}
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginPage; 