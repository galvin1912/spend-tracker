import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Typography, Button, Modal } from "antd";
import { convertCurrency } from "../../../../utils/numberUtils";

const BudgetWarningSystem = ({ groupDetail, thisMonthExpenseSum, remainingDays }) => {
  const [warningShown, setWarningShown] = useState(false);
  
  // Reset warning shown when groupDetail or expense sum changes
  useEffect(() => {
    setWarningShown(false);
  }, [groupDetail?.budget]);

  useEffect(() => {
    // Check if budget exists and warning hasn't been shown yet
    if (groupDetail?.budget && thisMonthExpenseSum < 0 && !warningShown) {
      const budgetUsedPercentage = Math.abs(thisMonthExpenseSum) / groupDetail.budget * 100;
      
      // Only show warning if we've spent more than 60% of budget
      if (budgetUsedPercentage < 60) return;
      
      // Define warning colors and styles based on severity
      let warningStyle = {};
      let iconType = '⚠️';
      let badgeColor = '';
      let buttonStyle = {};
      
      if (budgetUsedPercentage >= 80) {
        // Critical warning (80% or more of the budget)
        warningStyle = {
          background: 'linear-gradient(to right, #fef2f2, #fee2e2)',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px 20px',
        };
        badgeColor = '#ef4444';
        iconType = '🚨';
        buttonStyle = {
          background: '#ef4444',
          borderColor: '#ef4444'
        };
      } else {
        // Warning (60% or more of the budget)
        warningStyle = {
          background: 'linear-gradient(to right, #fffbeb, #fef3c7)',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '16px 20px',
        };
        badgeColor = '#f59e0b';
        iconType = '⚠️';
        buttonStyle = {
          background: '#f59e0b',
          borderColor: '#f59e0b'
        };
      }
      
      // Store modal reference so we can close it
      let warningModal;
      
      // Handle close modal
      const handleCloseWarning = () => {
        setWarningShown(true);
        warningModal.destroy();
      };
      
      // Configure the modal options with modern styling
      const modalConfig = {
        title: null,
        className: 'budget-warning-modal',
        icon: null,
        centered: true,
        width: 420,
        footer: null,
        maskClosable: false,
        closable: false,
        content: (
          <div style={warningStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ fontSize: '28px', lineHeight: '1' }}>
                {iconType}
              </div>
              <div style={{ flex: 1 }}>
                <Typography.Title level={4} style={{ margin: '0 0 8px 0' }}>
                  Cảnh báo ngân sách
                </Typography.Title>
                
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text>
                    Còn <Typography.Text strong>{remainingDays} ngày</Typography.Text> nữa mới hết tháng mà đã chi:
                  </Typography.Text>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginTop: '12px'
                  }}>
                    <Typography.Text style={{ fontWeight: 500 }}>
                      {convertCurrency(Math.abs(thisMonthExpenseSum))}/{convertCurrency(groupDetail.budget)}
                    </Typography.Text>
                    <Typography.Text style={{ 
                      fontWeight: 600,
                      color: badgeColor,
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '20px',
                      padding: '2px 10px',
                    }}>
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
                    height: '38px'
                  }}
                >
                  Đã hiểu
                </Button>
              </div>
            </div>
          </div>
        ),
      };
      
      // Show the styled modal and store the reference
      warningModal = Modal.info(modalConfig);
    }
  }, [groupDetail, thisMonthExpenseSum, remainingDays, warningShown]);
  
  // This is a utility component that renders nothing to the DOM
  return null;
};

BudgetWarningSystem.propTypes = {
  groupDetail: PropTypes.object.isRequired,
  thisMonthExpenseSum: PropTypes.number.isRequired,
  remainingDays: PropTypes.number.isRequired,
};

export default BudgetWarningSystem;