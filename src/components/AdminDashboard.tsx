import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import StaffManagement from './StaffManagement';
import Reports from './Reports';
import MenuManagement from './MenuManagement';
import AccountSettings from './AccountSettings';
import { logout } from '../utils/auth';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #2D1B69;
  color: white;
  padding: 2rem 1rem;
  position: fixed;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  padding: 0 1rem;
  color: white;
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  text-decoration: none;
  border-radius: 12px;
  background-color: ${props => props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const BottomMenu = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  margin-left: 250px;
  background-color: #f8fafc;
  min-height: 100vh;
  overflow-y: auto;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h2`
  color: #2D1B69;
  margin-bottom: 1.5rem;
`;

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.replace('/login');
      return;
    }
  }, []);

  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('/admin/reports', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <Logo>Кабинет управляющего</Logo>
        <NavMenu>
          <NavItem to="/admin/reports" $active={location.pathname === '/admin/reports'}>
            📊 Отчеты
          </NavItem>
          <NavItem to="/admin/staff" $active={location.pathname === '/admin/staff'}>
            👥 Управление персоналом
          </NavItem>
          <NavItem to="/admin/menu" $active={location.pathname === '/admin/menu'}>
            🍽️ Управление меню
          </NavItem>
        </NavMenu>
        <BottomMenu>
          <Button onClick={() => setShowSettings(true)}>
            ⚙️ Настройки аккаунта
          </Button>
          <Button onClick={handleLogout}>
            🚪 Выйти
          </Button>
        </BottomMenu>
      </Sidebar>
      <MainContent>
        <Routes>
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/" element={<Navigate to="/admin/reports" replace />} />
        </Routes>
      </MainContent>

      {showSettings && (
        <Modal onClick={() => setShowSettings(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Настройки аккаунта</ModalTitle>
            <AccountSettings onClose={() => setShowSettings(false)} />
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard; 