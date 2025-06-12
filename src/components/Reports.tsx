import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Container = styled.div`
  display: grid;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #2D1B69;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
`;

const ChartContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  height: 400px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const CardTitle = styled.h3`
  color: #718096;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
`;

const CardValue = styled.div`
  color: #2D1B69;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CardTrend = styled.div<{ $positive?: boolean }>`
  color: ${props => props.$positive ? '#10B981' : '#EF4444'};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background: #F8FAFC;
  color: #64748B;
  font-weight: 500;
  font-size: 0.875rem;
`;

const Td = styled.td`
  padding: 1rem;
  border-top: 1px solid #F1F5F9;
  color: #334155;
`;

// Временные данные для графиков
const revenueData = [
  { name: 'Пн', revenue: 15000 },
  { name: 'Вт', revenue: 18000 },
  { name: 'Ср', revenue: 16000 },
  { name: 'Чт', revenue: 20000 },
  { name: 'Пт', revenue: 25000 },
  { name: 'Сб', revenue: 30000 },
  { name: 'Вс', revenue: 28000 },
];

const ordersData = [
  { name: 'Пн', orders: 42 },
  { name: 'Вт', orders: 48 },
  { name: 'Ср', orders: 45 },
  { name: 'Чт', orders: 52 },
  { name: 'Пт', orders: 58 },
  { name: 'Сб', orders: 65 },
  { name: 'Вс', orders: 60 },
];

// Временные данные для таблицы
const topDishes = [
  { name: 'Пицца "Маргарита"', orders: 145, revenue: 43500 },
  { name: 'Паста "Карбонара"', orders: 98, revenue: 24500 },
  { name: 'Цезарь с курицей', orders: 87, revenue: 17400 },
  { name: 'Борщ', orders: 76, revenue: 11400 },
  { name: 'Стейк "Рибай"', orders: 65, revenue: 45500 },
];

const Reports = () => {
  return (
    <Container>
      <Header>
        <Title>Отчеты</Title>
      </Header>

      <Grid>
        <Card>
          <CardTitle>Выручка за сегодня</CardTitle>
          <CardValue>152,400 сом</CardValue>
          <CardTrend $positive>
            ↑ 12.5% с прошлой недели
          </CardTrend>
        </Card>
        <Card>
          <CardTitle>Заказов за сегодня</CardTitle>
          <CardValue>48</CardValue>
          <CardTrend $positive>
            ↑ 8.3% с прошлой недели
          </CardTrend>
        </Card>
        <Card>
          <CardTitle>Средний чек</CardTitle>
          <CardValue>1,175 сом</CardValue>
          <CardTrend>
            ↓ 2.1% с прошлой недели
          </CardTrend>
        </Card>
      </Grid>

      <ChartContainer>
        <Title style={{ marginBottom: '1.5rem' }}>Выручка за неделю</Title>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" name="Выручка" fill="#2D1B69" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer>
        <Title style={{ marginBottom: '1.5rem' }}>Количество заказов</Title>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ordersData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" name="Заказы" stroke="#2D1B69" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <Card>
        <Title style={{ marginBottom: '1.5rem' }}>Топ блюд</Title>
        <Table>
          <thead>
            <tr>
              <Th>Название</Th>
              <Th>Количество заказов</Th>
              <Th>Выручка</Th>
            </tr>
          </thead>
          <tbody>
            {topDishes.map((dish, index) => (
              <tr key={index}>
                <Td>{dish.name}</Td>
                <Td>{dish.orders}</Td>
                <Td>{dish.revenue.toLocaleString()} сом</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default Reports; 