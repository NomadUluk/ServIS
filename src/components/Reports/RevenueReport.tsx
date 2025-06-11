import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axiosInstance from '../../utils/axios';

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

const ChartContainer = styled.div`
  height: 400px;
  width: 100%;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

const StatChange = styled.div<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

type Period = 'day' | 'week' | 'month';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface RevenueReportProps {
  dateRange: DateRange;
}

interface RevenueData {
  dailyData: Array<{
    date: string;
    revenue: number;
  }>;
  stats: {
    totalRevenue: number;
    averageRevenue: number;
    maxRevenue: number;
  };
}

const RevenueReport: React.FC<RevenueReportProps> = ({ dateRange }) => {
  const [period, setPeriod] = useState<Period>('day');
  const [data, setData] = useState<RevenueData>({
    dailyData: [],
    stats: {
      totalRevenue: 0,
      averageRevenue: 0,
      maxRevenue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get<RevenueData>('/reports/revenue', {
          params: {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          }
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
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
      </FiltersContainer>

      <StatsContainer>
        <StatCard>
          <StatLabel>Общая выручка</StatLabel>
          <StatValue>{formatCurrency(data.stats.totalRevenue)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Средняя выручка в день</StatLabel>
          <StatValue>{formatCurrency(data.stats.averageRevenue)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Максимальная выручка</StatLabel>
          <StatValue>{formatCurrency(data.stats.maxRevenue)}</StatValue>
        </StatCard>
      </StatsContainer>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.dailyData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('ky-KG')}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Выручка']}
              labelFormatter={(label: string) => new Date(label).toLocaleDateString('ky-KG')}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Выручка"
              stroke="#2D1B69"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Container>
  );
};

export default RevenueReport; 