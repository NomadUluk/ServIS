import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { UserRole } from '../database/enums';

interface Employee {
  id: string;
  fullName: string;
  role: UserRole;
  username: string;
  status: string;
}

const Container = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2D1B69;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
`;

const AddButton = styled.button`
  background-color: #2D1B69;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #3d2589;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  color: #666;
  font-weight: 500;
  border-bottom: 2px solid #eee;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  background: ${props => props.$variant === 'delete' ? '#ff4d4f' : '#2D1B69'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-right: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #2D1B69;
  font-weight: 500;
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

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2D1B69;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const StaffManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Employee[]>('/api/staff');
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке списка сотрудников');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      try {
        await axios.delete(`/api/staff/${id}`);
        await fetchEmployees();
      } catch (err) {
        setError('Ошибка при удалении сотрудника');
        console.error('Error deleting employee:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeData = {
      fullName: formData.get('fullName') as string,
      role: formData.get('role') as UserRole,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };

    try {
    if (editingEmployee) {
        await axios.put(`/api/staff/${editingEmployee.id}`, employeeData);
    } else {
        await axios.post('/api/staff', employeeData);
      }
      await fetchEmployees();
      setShowModal(false);
    } catch (err) {
      setError(editingEmployee ? 'Ошибка при обновлении сотрудника' : 'Ошибка при создании сотрудника');
      console.error('Error submitting employee:', err);
    }
  };

  const translateRole = (role: UserRole): string => {
    const translations = {
      [UserRole.ADMIN]: 'Администратор',
      [UserRole.MANAGER]: 'Менеджер',
      [UserRole.CASHIER]: 'Кассир',
      [UserRole.WAITER]: 'Официант'
    };
    return translations[role] || role;
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <Container>
      <Header>
        <Title>Управление персоналом</Title>
        <AddButton onClick={handleAddEmployee}>
          + Добавить сотрудника
        </AddButton>
      </Header>

      <Table>
        <thead>
          <tr>
            <Th>Имя</Th>
            <Th>Должность</Th>
            <Th>Email</Th>
            <Th>Статус</Th>
            <Th>Действия</Th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id}>
              <Td>{employee.fullName}</Td>
              <Td>{translateRole(employee.role)}</Td>
              <Td>{employee.username}</Td>
              <Td>{employee.status}</Td>
              <Td>
                <ActionButton onClick={() => handleEditEmployee(employee)}>
                  Редактировать
                </ActionButton>
                <ActionButton 
                  $variant="delete" 
                  onClick={() => handleDeleteEmployee(employee.id)}
                >
                  Удалить
                </ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showModal && (
        <Modal>
          <ModalContent>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>ФИО</Label>
                <Input 
                  name="fullName" 
                  required 
                  defaultValue={editingEmployee?.fullName}
                />
              </FormGroup>
              <FormGroup>
                <Label>Должность</Label>
                <Select 
                  name="role" 
                  required 
                  defaultValue={editingEmployee?.role}
                >
                  <option value={UserRole.WAITER}>Официант</option>
                  <option value={UserRole.CASHIER}>Кассир</option>
                  <option value={UserRole.MANAGER}>Менеджер</option>
                  <option value={UserRole.ADMIN}>Администратор</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  name="username" 
                  required 
                  defaultValue={editingEmployee?.username}
                />
              </FormGroup>
              {!editingEmployee && (
              <FormGroup>
                  <Label>Пароль</Label>
                <Input 
                    type="password" 
                    name="password" 
                  required 
                    minLength={6}
                />
              </FormGroup>
              )}
              <ButtonGroup>
                <ActionButton 
                  type="button" 
                  $variant="delete" 
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </ActionButton>
                <ActionButton type="submit">
                  {editingEmployee ? 'Сохранить' : 'Добавить'}
                </ActionButton>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default StaffManagement; 