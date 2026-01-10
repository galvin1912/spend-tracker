import PropTypes from "prop-types";
import { Typography, Progress, Card, Row, Col } from "antd";
import { BarChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
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
  
  // Calculate budget usage percentage (allow over 100% to show overspending)
  const budgetUsedPercentage = groupDetail?.budget && Number(groupDetail.budget) > 0
    ? Math.abs(thisMonthExpenseSum) / groupDetail.budget * 100
    : 0;
  
  // Determine status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage >= 100) return "var(--destructive)"; // Red for over budget
    if (percentage >= 80) return "var(--warning)";  // Amber for approaching budget
    return "var(--success)";  // Green for healthy budget
  };

  const statusColor = getStatusColor(budgetUsedPercentage);
  
  // Calculate actual percentage for display (cap at 100% for progress bar visual, but show real % in text)
  const displayPercentage = Math.min(budgetUsedPercentage, 100);
  
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
    <Card
      className="budget-report-card"
      style={{
        borderRadius: "16px",
        border: "1px solid var(--border)",
        background: "var(--card)",
        boxShadow: "var(--shadow-sm)",
      }}
      bodyStyle={{
        padding: "24px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, var(--accent) 0%, #D4B85F 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(201, 162, 77, 0.2)",
          }}
        >
          <BarChartOutlined style={{ fontSize: "20px", color: "var(--card)" }} />
        </div>
        <div style={{ flex: 1 }}>
          <Typography.Title level={5} style={{ margin: 0, fontWeight: 600, color: "var(--card-foreground)" }}>
            Báo cáo ngân sách
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
            {getDateDisplay()}
          </Typography.Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Budget Usage Section */}
        <Col span={24}>
          <div
            style={{
              padding: "20px",
              background: "var(--muted)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
            }}
          >
            <Typography.Text
              type="secondary"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                display: "block",
                marginBottom: "12px",
                color: "var(--muted-foreground)",
              }}
            >
              Đã sử dụng ngân sách
            </Typography.Text>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <Typography.Text 
                strong 
                style={{ 
                  fontSize: "16px", 
                  color: "var(--card-foreground)",
                  whiteSpace: "nowrap",
                }}
              >
                {convertCurrency(Math.abs(thisMonthExpenseSum))}
              </Typography.Text>
              <Typography.Text
                strong
                style={{
                  fontSize: "18px",
                  color: statusColor,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {Number.isFinite(budgetUsedPercentage) ? budgetUsedPercentage.toFixed(1) : 0}%
              </Typography.Text>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <Typography.Text
                type="secondary"
                style={{
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                  whiteSpace: "nowrap",
                }}
              >
                Tổng ngân sách: {convertCurrency(groupDetail.budget)}
              </Typography.Text>
            </div>

            <Progress 
              percent={displayPercentage} 
              showInfo={false} 
              strokeColor={statusColor}
              strokeWidth={8}
              style={{
                borderRadius: "4px",
              }}
            />
            
            {budgetUsedPercentage > 100 && (
              <Typography.Text
                type="danger"
                style={{
                  fontSize: "12px",
                  display: "block",
                  marginTop: "8px",
                  fontWeight: 500,
                }}
              >
                ⚠️ Đã vượt quá ngân sách {convertCurrency(Math.abs(thisMonthExpenseSum) - groupDetail.budget)}
              </Typography.Text>
            )}
          </div>
        </Col>

        {/* Income vs Expense Section */}
        <Col span={24}>
          <div
            style={{
              padding: "20px",
              background: "var(--muted)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Typography.Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  display: "block",
                  lineHeight: "1.5",
                  color: "var(--muted-foreground)",
                }}
              >
                Thu nhập và Chi tiêu
              </Typography.Text>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Income */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "rgba(111, 143, 114, 0.1)",
                  borderRadius: "10px",
                  border: "1px solid rgba(111, 143, 114, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ArrowUpOutlined style={{ fontSize: "16px", color: "var(--success)" }} />
                  <Typography.Text style={{ fontSize: "14px", color: "var(--card-foreground)" }}>
                    Thu nhập
                  </Typography.Text>
                </div>
                <Typography.Text
                  strong
                  style={{
                    fontSize: "16px",
                    color: "var(--success)",
                    fontWeight: 600,
                  }}
                >
                  {convertCurrency(thisMonthIncomeSum)}
                </Typography.Text>
              </div>

              {/* Expense */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "rgba(168, 78, 59, 0.1)",
                  borderRadius: "10px",
                  border: "1px solid rgba(168, 78, 59, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                  <ArrowDownOutlined style={{ fontSize: "16px", color: "var(--destructive)", flexShrink: 0 }} />
                  <Typography.Text 
                    style={{ 
                      fontSize: "14px", 
                      color: "var(--card-foreground)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Chi tiêu
                  </Typography.Text>
                </div>
                <Typography.Text
                  strong
                  style={{
                    fontSize: "16px",
                    color: "var(--destructive)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                    flexShrink: 0,
                  }}
                >
                  {convertCurrency(Math.abs(thisMonthExpenseSum))}
                </Typography.Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
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