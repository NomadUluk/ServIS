import React, { useState } from 'react';
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

const StatChange = styled.div<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ExpensesTable = styled.div`
  margin-top: 2rem;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TableTitle = styled.h3`
  color: #2D1B69;
  font-size: 1.2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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

const CategoryBadge = styled.span<{ $color: string }>`
  background-color: ${props => props.$color}20;
  color: ${props => props.$color};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
`;

// Временные данные для демонстрации
const mockExpensesData = [
  { date: '2024-01-01', amount: 45000 },
  { date: '2024-01-02', amount: 38000 },
  { date: '2024-01-03', amount: 42000 },
  { date: '2024-01-04', amount: 35000 },
  { date: '2024-01-05', amount: 48000 },
  { date: '2024-01-06', amount: 41000 },
  { date: '2024-01-07', amount: 39000 },
];

const categoryData = [
  { name: 'Продукты', value: 180000, color: '#2D1B69' },
  { name: 'Оборудование', value: 85000, color: '#4C3399' },
  { name: 'Коммунальные услуги', value: 45000, color: '#6B4BC6' },
  { name: 'Реклама', value: 35000, color: '#8A63F3' },
  { name: 'Прочее', value: 25000, color: '#A98DFF' },
];

const expensesList = [
  { date: '2024-01-07', description: 'Закупка продуктов', category: 'Продукты', amount: 28500 },
  { date: '2024-01-07', description: 'Ремонт печи', category: 'Оборудование', amount: 15000 },
  { date: '2024-01-06', description: 'Оплата электричества', category: 'Коммунальные услуги', amount: 12000 },
  { date: '2024-01-06', description: 'Реклама в соцсетях', category: 'Реклама', amount: 8000 },
  { date: '2024-01-05', description: 'Хозяйственные товары', category: 'Прочее', amount: 5000 },
];

type Period = 'day' | 'week' | 'month';
type Category = 'all' | 'products' | 'equipment' | 'utilities' | 'advertising' | 'other';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ExpensesReportProps {
  dateRange: DateRange;
}

const ExpensesReport: React.FC<ExpensesReportProps> = ({ dateRange }) => {
  const [period, setPeriod] = useState<Period>('day');
  const [category, setCategory] = useState<Category>('all');

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ky-KG', {
      style: 'currency',
      currency: 'KGS',
      currencyDisplay: 'symbol',
      maximumFractionDigits: 0
    }).format(value) + ' сом';
  };

  // Фильтрация данных по выбранному диапазону
  const filteredData = mockExpensesData.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
  });

  // Фильтрация списка расходов
  const filteredExpensesList = expensesList.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
  });

  const getCategoryColor = (categoryName: string): string => {
    const category = categoryData.find(c => c.name === categoryName);
    return category?.color || '#2D1B69';
  };

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
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          <option value="all">Все категории</option>
          <option value="products">Продукты</option>
          <option value="equipment">Оборудование</option>
          <option value="utilities">Коммунальные услуги</option>
          <option value="advertising">Реклама</option>
          <option value="other">Прочее</option>
        </Select>
      </FiltersContainer>

      <StatsGrid>
        <StatCard>
          <StatLabel>Общие расходы</StatLabel>
          <StatValue>{formatCurrency(370000)}</StatValue>
          <StatChange $positive={false}>
            +8.5% к прошлому периоду
          </StatChange>
        </StatCard>
        <StatCard>
          <StatLabel>Средние расходы в день</StatLabel>
          <StatValue>{formatCurrency(41100)}</StatValue>
          <StatChange $positive={true}>
            -2.3% к прошлому периоду
          </StatChange>
        </StatCard>
        <StatCard>
          <StatLabel>Крупнейшая категория трат</StatLabel>
          <StatValue>Продукты</StatValue>
          <StatChange $positive={true}>
            48.6% от общих расходов
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsContainer>
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
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
                dataKey="amount" 
                name="Расходы" 
                fill="#2D1B69" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsContainer>

      <ExpensesTable>
        <TableHeader>
          <TableTitle>Последние расходы</TableTitle>
        </TableHeader>
        <Table>
          <thead>
            <tr>
              <Th>Дата</Th>
              <Th>Описание</Th>
              <Th>Категория</Th>
              <Th>Сумма</Th>
            </tr>
          </thead>
          <tbody>
            {filteredExpensesList.map((expense, index) => (
              <tr key={index}>
                <Td>{new Date(expense.date).toLocaleDateString('ky-KG')}</Td>
                <Td>{expense.description}</Td>
                <Td>
                  <CategoryBadge $color={getCategoryColor(expense.category)}>
                    {expense.category}
                  </CategoryBadge>
                </Td>
                <TdValue>{formatCurrency(expense.amount)}</TdValue>
              </tr>
            ))}
          </tbody>
        </Table>
      </ExpensesTable>
    </Container>
  );
};

export default ExpensesReport; 