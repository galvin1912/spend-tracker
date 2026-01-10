import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { Typography, Button, App } from "antd";
import { convertCurrency } from "../../../../utils/numberUtils";

const BudgetWarningSystem = ({ isCurrentMonth, isUsingDateRange, groupDetail, thisMonthExpenseSum, remainingDays }) => {
  const [warningShown, setWarningShown] = useState(false);
  // Get notification API from App context to show modal
  const { modal } = App.useApp();
  // Store the current modal instance
  const modalInstanceRef = useRef(null);

  // Reset warning shown when groupDetail or expense sum changes
  useEffect(() => {
    setWarningShown(false);
  }, [groupDetail?.budget]);

  useEffect(() => {
    if (!(isCurrentMonth && !isUsingDateRange && groupDetail?.budget)) {
      return;
    }

    // Check if budget exists and warning hasn't been shown yet
    if (groupDetail?.budget && thisMonthExpenseSum < 0 && !warningShown) {
      const budgetUsedPercentage = groupDetail.budget > 0
        ? (Math.abs(thisMonthExpenseSum) / groupDetail.budget) * 100
        : 0;

      // Only show warning if we've spent more than 60% of budget
      if (budgetUsedPercentage < 60) return;

      // Define warning colors and styles based on severity
      let warningStyle = {};
      let iconType = "⚠️";
      let badgeColor = "";
      let buttonStyle = {};

      if (budgetUsedPercentage >= 100) {
        // Critical warning (100% or more - over budget)
        warningStyle = {
          background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        };
        badgeColor = "var(--destructive)";
        iconType = "🚨";
        buttonStyle = {
          background: "var(--destructive)",
          borderColor: "var(--destructive)",
        };
      } else if (budgetUsedPercentage >= 80) {
        // Critical warning (80% or more of the budget)
        warningStyle = {
          background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        };
        badgeColor = "var(--destructive)";
        iconType = "⚠️";
        buttonStyle = {
          background: "var(--destructive)",
          borderColor: "var(--destructive)",
        };
      } else {
        // Warning (60% or more of the budget)
        warningStyle = {
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
        };
        badgeColor = "var(--warning)";
        iconType = "⚠️";
        buttonStyle = {
          background: "var(--warning)",
          borderColor: "var(--warning)",
        };
      }

      // Handle close modal
      const handleCloseWarning = () => {
        setWarningShown(true);
        // Close the modal instance
        if (modalInstanceRef.current) {
          modalInstanceRef.current.destroy();
          modalInstanceRef.current = null;
        }
      };

      // Configure the modal options with modern styling
      const instance = modal.info({
        title: null,
        className: "budget-warning-modal",
        icon: null,
        centered: true,
        width: 480,
        footer: null,
        maskClosable: false,
        closable: false,
        styles: {
          content: {
            padding: 0,
            borderRadius: "16px",
            overflow: "hidden",
          },
        },
        content: (
          <div
            style={{
              ...warningStyle,
              padding: "24px",
              borderRadius: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                {iconType}
              </div>
              <div style={{ flex: 1 }}>
                <Typography.Title level={4} style={{ margin: "0 0 4px 0", fontWeight: 600 }}>
                  Cảnh báo ngân sách
                </Typography.Title>
                <Typography.Text
                  type="secondary"
                  style={{
                    fontSize: "14px",
                    display: "block",
                    marginBottom: "20px",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Còn {remainingDays} ngày nữa mới hết tháng mà đã chi:
                </Typography.Text>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <Typography.Text
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Đã chi tiêu
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        fontWeight: 700,
                        fontSize: "18px",
                        color: badgeColor,
                        background: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "8px",
                        padding: "4px 12px",
                      }}
                    >
                      {Number.isFinite(budgetUsedPercentage) ? budgetUsedPercentage.toFixed(0) : 0}%
                    </Typography.Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography.Text
                      strong
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "var(--card-foreground)",
                      }}
                    >
                      {convertCurrency(Math.abs(thisMonthExpenseSum))}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: "14px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      / {convertCurrency(groupDetail.budget)}
                    </Typography.Text>
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  onClick={handleCloseWarning}
                  className="rounded-xl"
                  style={{
                    ...buttonStyle,
                    fontWeight: 500,
                    height: "42px",
                    borderRadius: "10px",
                    fontSize: "15px",
                  }}
                >
                  Đã hiểu
                </Button>
              </div>
            </div>
          </div>
        ),
      });
      
      // Store the reference to current modal instance
      modalInstanceRef.current = instance;
    }
    
    // Clean up function to close any open modal when component unmounts
    return () => {
      if (modalInstanceRef.current) {
        modalInstanceRef.current.destroy();
        modalInstanceRef.current = null;
      }
    };
  }, [groupDetail, thisMonthExpenseSum, remainingDays, warningShown, isCurrentMonth, isUsingDateRange, modal]);

  // This is a utility component that renders nothing to the DOM
  return null;
};

BudgetWarningSystem.propTypes = {
  isCurrentMonth: PropTypes.bool.isRequired,
  isUsingDateRange: PropTypes.bool.isRequired,
  groupDetail: PropTypes.object.isRequired,
  thisMonthExpenseSum: PropTypes.number.isRequired,
  remainingDays: PropTypes.number.isRequired,
};

export default BudgetWarningSystem;
