import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Progress, Typography, Row, Col, Tooltip, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import { convertCurrency } from '../../../../utils/numberUtils';

const { Title, Text } = Typography;

/**
 * Budget Timeline Component
 * 
 * Visualizes budget spending throughout the month to help users
 * track if they're on pace with their budget
 */
const BudgetTimeline = ({ totalExpense, budget, dateRange }) => {
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [idealSpending, setIdealSpending] = useState(0);
  const [currentSpending, setCurrentSpending] = useState(0);
  const [dailyBudget, setDailyBudget] = useState(0);
  const [spendingStatus, setSpendingStatus] = useState('normal'); // 'normal', 'warning', or 'danger'

  // Calculate timeline statistics based on the current date
  useEffect(() => {
    // Handle date calculations 
    const now = dayjs();
    
    let start, end;
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      // Custom date range
      start = dayjs(dateRange.startDate);
      end = dayjs(dateRange.endDate);
    } else {
      // Current month
      start = now.startOf('month');
      end = now.endOf('month');
    }
    
    const totalDays = end.diff(start, 'day') + 1;
    const elapsed = Math.min(now.diff(start, 'day') + 1, totalDays);
    
    setDaysElapsed(elapsed);
    setDaysInMonth(totalDays);
    
    // Calculate ideal and actual spending
    const idealDailyBudget = budget / totalDays;
    const idealSpendToDate = idealDailyBudget * elapsed;
    const actualSpendToDate = Math.abs(totalExpense);
    
    setDailyBudget(idealDailyBudget);
    setIdealSpending(idealSpendToDate);
    setCurrentSpending(actualSpendToDate);
    
    // Determine spending status
    const spendingRatio = actualSpendToDate / idealSpendToDate;
    if (spendingRatio > 1.2) {
      setSpendingStatus('danger');
    } else if (spendingRatio > 1) {
      setSpendingStatus('warning');
    } else {
      setSpendingStatus('normal');
    }
  }, [totalExpense, budget, dateRange]);

  // Calculate percentage of month elapsed and budget used
  const percentElapsed = Math.round((daysElapsed / daysInMonth) * 100);
  const percentBudgetUsed = Math.round((currentSpending / budget) * 100);
  
  // Determine if user is over or under budget compared to the elapsed time
  const budgetDifference = idealSpending - currentSpending;
  const isOverBudget = budgetDifference < 0;
  
  // Timeline UI states
  const statusColors = {
    normal: {
      color: '#10b981', // Green
      stroke: '#d1fae5',
      text: 'Đúng dự kiến'
    },
    warning: {
      color: '#f59e0b', // Amber
      stroke: '#fef3c7',
      text: 'Hơi quá'
    },
    danger: {
      color: '#ef4444', // Red
      stroke: '#fee2e2',
      text: 'Quá nhiều'
    }
  };

  return (
    <Card 
      title={
        <Title level={5} style={{ margin: 0 }}>
          Tiến độ chi tiêu
        </Title>
      }
      className="shadow-hover rounded-2xl"
      style={{ marginBottom: 24 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Time elapsed progress */}
        <div>
          <Space style={{ marginBottom: 8, justifyContent: 'space-between', width: '100%' }}>
            <Text>Thời gian trôi qua</Text>
            <Text strong>{percentElapsed}%</Text>
          </Space>
          <Progress 
            percent={percentElapsed} 
            showInfo={false} 
            strokeColor="#3b82f6"
            trailColor="#e2e8f0"
            style={{ marginBottom: 4 }}
          />
          <Text type="secondary">
            Ngày {daysElapsed} / {daysInMonth}
          </Text>
        </div>

        {/* Budget used progress */}
        <div>
          <Space style={{ marginBottom: 8, justifyContent: 'space-between', width: '100%' }}>
            <Text>Ngân sách đã dùng</Text>
            <Text strong style={{ color: isOverBudget && percentBudgetUsed > percentElapsed ? '#ef4444' : '#10b981' }}>
              {percentBudgetUsed}%
            </Text>
          </Space>
          <Progress 
            percent={percentBudgetUsed} 
            showInfo={false} 
            strokeColor={isOverBudget && percentBudgetUsed > percentElapsed ? '#ef4444' : '#10b981'}
            trailColor="#e2e8f0"
            style={{ marginBottom: 4 }}
          />
          <Text type="secondary">
            {convertCurrency(currentSpending)} / {convertCurrency(budget)}
          </Text>
        </div>
        
        {/* Compare actual vs ideal spending */}
        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          <Col span={24}>
            <Card 
              size="small" 
              style={{ 
                borderRadius: 12, 
                backgroundColor: statusColors[spendingStatus].stroke,
                borderColor: statusColors[spendingStatus].color
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>Tình trạng chi tiêu:</Text>
                  <Tag color={statusColors[spendingStatus].color} className="rounded-xl">
                    {statusColors[spendingStatus].text}
                  </Tag>
                </div>
                
                <div>
                  <Text>
                    {isOverBudget ? (
                      <>
                        Bạn đã chi <Text strong type="danger">{convertCurrency(Math.abs(budgetDifference))}</Text> nhiều hơn dự kiến
                      </>
                    ) : (
                      <>
                        Bạn đã chi <Text strong type="success">{convertCurrency(Math.abs(budgetDifference))}</Text> ít hơn dự kiến
                      </>
                    )}
                  </Text>
                </div>
                
                <div>
                  <Text type="secondary">
                    Ngân sách hàng ngày: <Text strong>{convertCurrency(dailyBudget)}</Text>
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
        
        {/* Projected spending */}
        <div>
          <Text>
            Nếu tiếp tục chi tiêu với tốc độ này, bạn sẽ dùng khoảng{' '}
            <Tooltip title="Dựa trên mức chi tiêu hiện tại">
              <Text strong style={{ color: currentSpending / daysElapsed * daysInMonth > budget ? '#ef4444' : '#10b981' }}>
                {convertCurrency(currentSpending / daysElapsed * daysInMonth)}
              </Text>
            </Tooltip>{' '}
            đến cuối kỳ ({percentBudgetUsed > 100 ? (
              <Text type="danger">đã vượt {convertCurrency(currentSpending - budget)} so với ngân sách</Text>
            ) : (
              <Text type="secondary">còn {convertCurrency(budget - currentSpending)}</Text>
            )})
          </Text>
        </div>
      </Space>
    </Card>
  );
};

BudgetTimeline.propTypes = {
  totalExpense: PropTypes.number.isRequired,
  budget: PropTypes.number.isRequired,
  dateRange: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object
  })
};

export default BudgetTimeline;