import PropTypes from "prop-types";
import { Typography, Progress } from "antd";
import { convertCurrency } from "../../../../utils/numberUtils";

const BudgetReport = ({ 
  groupDetail, 
  thisMonthExpenseSum, 
  thisMonthIncomeSum,
  selectedMonth,
  isDateRange,
  dateRangeStart,
  dateRangeEnd,
  isWeekFilter
}) => {
  
  // Calculate budget usage percentage
  const budgetUsedPercentage = groupDetail?.budget && Number(groupDetail.budget) > 0
    ? Math.min(
        Math.abs(thisMonthExpenseSum) / groupDetail.budget * 100, 
        100
      )
    : 0;
  
  // Determine status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage >= 100) return "#ef4444"; // Red for over budget
    if (percentage >= 80) return "#f59e0b";  // Amber for approaching budget
    return "#10b981";  // Green for healthy budget
  };
  
  // Format date range, week, or month for display
  const getDateDisplay = () => {
    if (isDateRange && dateRangeStart && dateRangeEnd) {
      return `${dateRangeStart.format('DD/MM/YYYY')} - ${dateRangeEnd.format('DD/MM/YYYY')}`;
    }
    if (isWeekFilter) {
      const weekStart = selectedMonth.startOf('week').format('DD/MM/YYYY');
      const weekEnd = selectedMonth.endOf('week').format('DD/MM/YYYY');
      return `${weekStart} - ${weekEnd}`;
    }
    return selectedMonth.format('MMMM YYYY');
  };
  
  return (
    <div
      style={{
        background: "linear-gradient(to right, #f0f9ff, #e0f2fe)",
        border: "1px solid #bae6fd",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "20px",
        cursor: "not-allowed",
      }}
    >
      <Typography.Title level={4} style={{ margin: "0 0 12px 0" }}>
        Báo cáo ngân sách
        <Typography.Text type="secondary" style={{ fontSize: "16px", fontWeight: "normal", marginLeft: "8px" }}>
          {getDateDisplay()}
        </Typography.Text>
      </Typography.Title>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {/* Budget usage */}
        <div style={{ minWidth: "250px", flex: "1" }}>
          <Typography.Text style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>
            Đã sử dụng
          </Typography.Text>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <Typography.Text strong>
              {convertCurrency(Math.abs(thisMonthExpenseSum))}/{convertCurrency(groupDetail.budget)}
            </Typography.Text>
            <Typography.Text
              strong
              style={{
                color: getStatusColor(budgetUsedPercentage)
              }}
            >
              {Number.isFinite(budgetUsedPercentage) ? budgetUsedPercentage.toFixed(0) : 0}%
            </Typography.Text>
          </div>
          <Progress 
            percent={budgetUsedPercentage} 
            showInfo={false} 
            strokeColor={getStatusColor(budgetUsedPercentage)}
            size="small"
          />
        </div>
        
        {/* Income vs Expense */}
        <div style={{ minWidth: "250px", flex: "1" }}>
          <Typography.Text style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>
            Thu nhập và Chi tiêu
          </Typography.Text>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <div>
              <Typography.Text type="success" style={{ marginRight: "4px" }}>
                Thu nhập: 
              </Typography.Text>
              <Typography.Text strong style={{ color: "#10b981" }}>
                {convertCurrency(thisMonthIncomeSum)}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text type="danger" style={{ marginRight: "4px" }}>
                Chi tiêu: 
              </Typography.Text>
              <Typography.Text strong style={{ color: "#ef4444" }}>
                {convertCurrency(Math.abs(thisMonthExpenseSum))}
              </Typography.Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

BudgetReport.propTypes = {
  groupDetail: PropTypes.object.isRequired,
  thisMonthExpenseSum: PropTypes.number.isRequired,
  thisMonthIncomeSum: PropTypes.number.isRequired,
  selectedMonth: PropTypes.object.isRequired,
  isDateRange: PropTypes.bool.isRequired,
  dateRangeStart: PropTypes.object,
  dateRangeEnd: PropTypes.object,
  isWeekFilter: PropTypes.bool
};

export default BudgetReport;