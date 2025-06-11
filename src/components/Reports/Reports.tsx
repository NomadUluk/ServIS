import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import RevenueReport from './RevenueReport';
import SalesReport from './SalesReport';
import SalaryReport from './SalaryReport';
import ExpensesReport from './ExpensesReport';

const ReportsContainer = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2D1B69;
  font-size: 1.8rem;
  margin-bottom: 1rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
`;

const DatePickerContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  .form-control {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 0.875rem;
    color: #2D1B69;
    
    &:focus {
      outline: none;
      border-color: #2D1B69;
    }
  }

  .react-datepicker-wrapper {
    width: auto;
  }

  .react-datepicker {
    font-family: inherit;
    border-color: #e2e8f0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .react-datepicker__header {
    background-color: #2D1B69;
    border-bottom: none;
    padding-top: 0.8rem;
  }

  .react-datepicker__current-month {
    color: white;
  }

  .react-datepicker__day-name {
    color: white;
  }

  .react-datepicker__day--selected {
    background-color: #2D1B69;
  }

  .react-datepicker__day--keyboard-selected {
    background-color: rgba(45, 27, 105, 0.5);
  }

  .react-datepicker__day:hover {
    background-color: rgba(45, 27, 105, 0.1);
  }
`;

const DateLabel = styled.span`
  color: #64748b;
  font-size: 0.875rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  color: ${props => props.$active ? '#2D1B69' : '#718096'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #2D1B69;
    transform: scaleX(${props => props.$active ? '1' : '0'});
    transition: transform 0.2s;
  }

  &:hover {
    color: #2D1B69;
  }
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

type ReportType = 'revenue' | 'sales' | 'salary' | 'expenses';

const Reports = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('revenue');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      if (date > endDate) {
        setEndDate(date);
      }
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date);
    }
  };

  const renderContent = () => {
    const dateRange = {
      startDate,
      endDate
    };

    switch (activeTab) {
      case 'revenue':
        return <RevenueReport dateRange={dateRange} />;
      case 'sales':
        return <SalesReport dateRange={dateRange} />;
      case 'salary':
        return <SalaryReport dateRange={dateRange} />;
      case 'expenses':
        return <ExpensesReport dateRange={dateRange} />;
      default:
        return null;
    }
  };

  return (
    <ReportsContainer>
      <Header>
        <Title>Отчеты</Title>
        <DatePickerContainer>
          <div>
            <DateLabel>С:</DateLabel>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd.MM.yyyy"
              placeholderText="Выберите дату"
              className="form-control"
            />
          </div>
          <div>
            <DateLabel>По:</DateLabel>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd.MM.yyyy"
              placeholderText="Выберите дату"
              className="form-control"
            />
          </div>
        </DatePickerContainer>
        <TabsContainer>
          <Tab 
            $active={activeTab === 'revenue'} 
            onClick={() => setActiveTab('revenue')}
          >
            Динамика выручки
          </Tab>
          <Tab 
            $active={activeTab === 'sales'} 
            onClick={() => setActiveTab('sales')}
          >
            Продажи и прибыль
          </Tab>
          <Tab 
            $active={activeTab === 'salary'} 
            onClick={() => setActiveTab('salary')}
          >
            Заработные платы
          </Tab>
          <Tab 
            $active={activeTab === 'expenses'} 
            onClick={() => setActiveTab('expenses')}
          >
            Траты
          </Tab>
        </TabsContainer>
      </Header>
      <ContentContainer>
        {renderContent()}
      </ContentContainer>
    </ReportsContainer>
  );
};

export default Reports; 