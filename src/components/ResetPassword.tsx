import React, { useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ResetContainer = styled.div`
  min-height: 100vh;
  background-color: #2D1B69;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ResetBox = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 0 32px 8px rgba(150, 108, 243, 0.18);
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
  text-align: left;
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

const MessageContainer = styled.div<{ $error?: boolean }>`
  color: ${props => props.$error ? '#dc3545' : '#28a745'};
  text-align: center;
  margin: 1rem 0;
`;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Пароли не совпадают');
      setIsError(true);
      return;
    }

    if (password.length < 8) {
      setMessage('Пароль должен содержать минимум 8 символов');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Пароль успешно изменен');
        setIsError(false);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Произошла ошибка при сбросе пароля');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Произошла ошибка при сбросе пароля');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResetContainer>
      <ResetBox>
        <Title>Сброс пароля</Title>
        {message && (
          <MessageContainer $error={isError}>
            {message}
          </MessageContainer>
        )}
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputLabel>Новый пароль</InputLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </InputGroup>
          <InputGroup>
            <InputLabel>Подтвердите пароль</InputLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </InputGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Сброс пароля...' : 'Сбросить пароль'}
          </Button>
        </Form>
      </ResetBox>
    </ResetContainer>
  );
};

export default ResetPassword; 