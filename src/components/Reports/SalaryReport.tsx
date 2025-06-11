import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axiosInstance from '../../utils/axios';
import { UserRole } from '../../database/enums';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  color: #2D1B69;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #2D1B69;
  }
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  height: 400px;
`;

const ChartContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatLabel = styled.div`
  color: #64748b;
  font-size: 0.875rem;
`;

const StatValue = styled.div`
  color: #2D1B69;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  color: #64748b;
  font-weight: 500;
  border-bottom: 1px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const TdValue = styled(Td)`
  color: #2D1B69;
  font-weight: 500;
`;

type Period = 'day' | 'week' | 'month';
type Position = 'all' | keyof typeof UserRole;

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface SalaryReportProps {
  dateRange: DateRange;
}

interface SalaryData {
  positionData: Array<{
    name: string;
    value: number;
  }>;
  employeeData: Array<{
    name: string;
    position: string;
    shifts: number;
    salary: number;
  }>;
  stats: {
    totalSalary: number;
    employeeCount: number;
  };
}

const COLORS = ['#2D1B69', '#4C3399', '#6B4BC6', '#8A63F3', '#A98DFF'];

const SalaryReport: React.FC<SalaryReportProps> = ({ dateRange }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [position, setPosition] = useState<Position>('all');
  const [data, setData] = useState<SalaryData>({
    positionData: [],
    employeeData: [],
    stats: {
      totalSalary: 0,
      employeeCount: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get<SalaryData>('/reports/salary', {
          params: {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          }
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching salary data:', err);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange.startDate, dateRange.endDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KGS'
    }).format(value);
  };

  if (loading) {
    return <div>Загрузка данных...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <Container>
      <FiltersContainer>
        <Select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value as Period)}
        >
          <option value="day">По дням</option>
          <option value="week">По неделям</option>
          <option value="month">По месяцам</option>
        </Select>
        <Select
          value={position}
          onChange={(e) => setPosition(e.target.value as Position)}
        >
          <option value="all">Все должности</option>
          <option value="MANAGER">Менеджеры</option>
          <option value="WAITER">Официанты</option>
          <option value="CASHIER">Кассиры</option>
          <option value="ADMIN">Администраторы</option>
        </Select>
      </FiltersContainer>

      <StatsGrid>
        <StatCard>
          <StatLabel>Общие расходы на зарплаты</StatLabel>
          <StatValue>{formatCurrency(data.stats.totalSalary)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Количество сотрудников</StatLabel>
          <StatValue>{data.stats.employeeCount}</StatValue>
        </StatCard>
      </StatsGrid>

      <ChartsContainer>
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.positionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.positionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsContainer>

      <Table>
        <thead>
          <tr>
            <Th>Сотрудник</Th>
            <Th>Должность</Th>
            <Th>Кол-во смен</Th>
            <Th>Зарплата</Th>
          </tr>
        </thead>
        <tbody>
          {data.employeeData.map((employee, index) => (
            <tr key={index}>
              <Td>{employee.name}</Td>
              <Td>{employee.position}</Td>
              <Td>{employee.shifts}</Td>
              <TdValue>{formatCurrency(employee.salary)}</TdValue>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default SalaryReport; 