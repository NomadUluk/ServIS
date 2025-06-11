import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../utils/axios';
import { UserRole } from '../database/enums';

// Добавляем интерфейс для ответа API
interface AdminProfileResponse {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
}

const Container = styled.div`
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2D1B69;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2D1B69;
  }
`;

const Button = styled.button`
  background-color: #2D1B69;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #3d2589;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #52c41a;
  margin-top: 0.5rem;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #ddd;
  margin: 1.5rem 0;
`;

interface AccountSettingsProps {
  onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching admin profile data...');
        const response = await api.get<AdminProfileResponse>('/admin/profile');
        console.log('Profile data received:', response.data);
        const { fullName, username } = response.data;
        setFormData(prev => ({
          ...prev,
          fullName,
          username
        }));
      } catch (err: any) {
        console.error('Profile loading error:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });
        setError(err.response?.data?.message || 'Ошибка при загрузке данных профиля');
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData: any = {
        fullName: formData.fullName,
        username: formData.username
      };

      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        updateData.password = formData.password;
      }

      await api.put<AdminProfileResponse>('/admin/profile', updateData);
      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
          <FormGroup>
          <Label>ФИО</Label>
              <Input
            type="text"
            name="fullName"
            value={formData.fullName}
                onChange={handleChange}
                required
              />
          </FormGroup>
          <FormGroup>
          <Label>Email</Label>
            <Input
              type="email"
            name="username"
            value={formData.username}
              onChange={handleChange}
              required
            />
          </FormGroup>

        <Divider />
        
        <FormGroup>
          <Label>Новый пароль (оставьте пустым, чтобы не менять)</Label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
          />
        </FormGroup>
          <FormGroup>
          <Label>Подтверждение пароля</Label>
            <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
              onChange={handleChange}
            minLength={6}
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>Профиль успешно обновлен</SuccessMessage>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Form>
    </Container>
  );
};

export default AccountSettings; 