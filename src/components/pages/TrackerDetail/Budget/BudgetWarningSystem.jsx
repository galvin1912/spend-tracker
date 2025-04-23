import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { Typography, Button, App } from "antd";
import { useTranslation } from "react-i18next";
import { convertCurrency } from "../../../../utils/numberUtils";

const BudgetWarningSystem = ({ isCurrentMonth, isUsingDateRange, groupDetail, thisMonthExpenseSum, remainingDays }) => {
  const { t } = useTranslation();
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
      const budgetUsedPercentage = (Math.abs(thisMonthExpenseSum) / groupDetail.budget) * 100;

      // Only show warning if we've spent more than 60% of budget
      if (budgetUsedPercentage < 60) return;

      // Define warning colors and styles based on severity
      let warningStyle = {};
      let iconType = "⚠️";
      let badgeColor = "";
      let buttonStyle = {};

      if (budgetUsedPercentage >= 80) {
        // Critical warning (80% or more of the budget)
        warningStyle = {
          background: "linear-gradient(to right, #fef2f2, #fee2e2)",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          padding: "16px 20px",
        };
        badgeColor = "#ef4444";
        iconType = "🚨";
        buttonStyle = {
          background: "#ef4444",
          borderColor: "#ef4444",
        };
      } else {
        // Warning (60% or more of the budget)
        warningStyle = {
          background: "linear-gradient(to right, #fffbeb, #fef3c7)",
          border: "1px solid #fde68a",
          borderRadius: "12px",
          padding: "16px 20px",
        };
        badgeColor = "#f59e0b";
        iconType = "⚠️";
        buttonStyle = {
          background: "#f59e0b",
          borderColor: "#f59e0b",
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
        width: 420,
        footer: null,
        maskClosable: false,
        closable: false,
        content: (
          <div style={warningStyle}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ fontSize: "28px", lineHeight: "1" }}>{iconType}</div>
              <div style={{ flex: 1 }}>
                <Typography.Title level={4} style={{ margin: "0 0 8px 0" }}>
                  {t("budgetWarningTitle")}
                </Typography.Title>

                <div style={{ marginBottom: "16px" }}>
                  <Typography.Text>{t("daysRemaining", { remainingDays })}</Typography.Text>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(255, 255, 255, 0.6)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      marginTop: "12px",
                    }}
                  >
                    <Typography.Text style={{ fontWeight: 500 }}>
                      {convertCurrency(Math.abs(thisMonthExpenseSum))}/{convertCurrency(groupDetail.budget)}
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        fontWeight: 600,
                        color: badgeColor,
                        background: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "20px",
                        padding: "2px 10px",
                      }}
                    >
                      {budgetUsedPercentage.toFixed(0)}%
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
                    height: "38px",
                  }}
                >
                  {t("understandWarning")}
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
  }, [groupDetail, thisMonthExpenseSum, remainingDays, warningShown, t, isCurrentMonth, isUsingDateRange, modal]);

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
