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

const StatChange = styled.div<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TopItemsContainer = styled.div`
  margin-top: 2rem;
`;

const TopItemsTitle = styled.h3`
  color: #2D1B69;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const ItemCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ItemName = styled.div`
  color: #2D1B69;
  font-weight: 500;
`;

const ItemSales = styled.div`
  color: #64748b;
  font-size: 0.875rem;
`;

type Period = 'day' | 'week' | 'month';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface SalesReportProps {
  dateRange: DateRange;
}

interface SalesData {
  dailyData: Array<{
    date: string;
    sales: number;
    profit: number;
  }>;
  topSellingItems: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  stats: {
    totalSales: number;
    averageCheck: number;
    totalProfit: number;
  };
}

const SalesReport: React.FC<SalesReportProps> = ({ dateRange }) => {
  const [period, setPeriod] = useState<Period>('day');
  const [data, setData] = useState<SalesData>({
    dailyData: [],
    topSellingItems: [],
    stats: {
      totalSales: 0,
      averageCheck: 0,
      totalProfit: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get<SalesData>('/reports/sales', {
          params: {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          }
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching sales data:', err);
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

      <StatsGrid>
        <StatCard>
          <StatLabel>Общие продажи</StatLabel>
          <StatValue>{formatCurrency(data.stats.totalSales)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Общая прибыль</StatLabel>
          <StatValue>{formatCurrency(data.stats.totalProfit)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Средний чек</StatLabel>
          <StatValue>{formatCurrency(data.stats.averageCheck)}</StatValue>
        </StatCard>
      </StatsGrid>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
              formatter={(value: number) => [formatCurrency(value), 'Сумма']}
              labelFormatter={(label: string) => new Date(label).toLocaleDateString('ky-KG')}
            />
            <Legend />
            <Bar 
              dataKey="sales" 
              name="Продажи" 
              fill="#2D1B69" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="profit" 
              name="Прибыль" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <TopItemsContainer>
        <TopItemsTitle>Топ продаж</TopItemsTitle>
        <ItemsList>
          {data.topSellingItems.map((item, index) => (
            <ItemCard key={index}>
              <ItemInfo>
                <ItemName>{item.name}</ItemName>
                <ItemSales>Продано: {item.sales} шт.</ItemSales>
              </ItemInfo>
              <StatValue>{formatCurrency(item.revenue)}</StatValue>
            </ItemCard>
          ))}
        </ItemsList>
      </TopItemsContainer>
    </Container>
  );
};

export default SalesReport; 