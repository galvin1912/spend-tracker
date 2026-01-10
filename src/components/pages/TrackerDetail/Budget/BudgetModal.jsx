import PropTypes from "prop-types";
import { useState, useEffect, memo } from "react";
import { Modal, Typography, InputNumber, Card } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import GroupServices from "../../../../services/GroupServices";
import { translateError } from "../../../../utils/errorTranslator";
import messageUtil from "../../../../utils/messageUtil";

const BudgetModal = ({ visible, initialBudget, trackerID, groupDetail, onCancel, onSuccess }) => {
  const [budgetAmount, setBudgetAmount] = useState(null);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Update local state when initialBudget changes
  useEffect(() => {
    if (visible) {
      setBudgetAmount(initialBudget || null);
    } else {
      // Reset when modal closes
      setBudgetAmount(null);
    }
  }, [visible, initialBudget]);

  // Handle budget save
  const handleSaveBudget = async () => {
    if (!budgetAmount || budgetAmount <= 0) {
      messageUtil.error("Vui lòng nhập số tiền ngân sách hợp lệ!");
      return;
    }

    setIsSavingBudget(true);
    try {
      await GroupServices.updateGroup(trackerID, { budget: budgetAmount });
      messageUtil.success("Cập nhật ngân sách thành công");
      onSuccess(budgetAmount);
    } catch (error) {
      messageUtil.error(translateError(error));
    } finally {
      setIsSavingBudget(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            <WalletOutlined style={{ fontSize: "20px", color: "var(--card)" }} />
          </div>
          <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            {groupDetail?.budget ? "Thay đổi ngân sách" : "Đặt ngân sách"}
          </Typography.Title>
        </div>
      }
      open={visible}
      onOk={handleSaveBudget}
      onCancel={onCancel}
      confirmLoading={isSavingBudget}
      okText="Lưu ngân sách"
      cancelText="Hủy"
      okButtonProps={{
        className: "rounded-xl",
        style: {
          fontWeight: 500,
          paddingLeft: "20px",
          paddingRight: "20px",
          height: "40px",
          borderRadius: "10px",
        },
      }}
      cancelButtonProps={{
        className: "rounded-xl",
        style: {
          fontWeight: 500,
          paddingLeft: "20px",
          paddingRight: "20px",
          height: "40px",
          borderRadius: "10px",
        },
      }}
      className="budget-modal"
      styles={{
        content: {
          borderRadius: "16px",
        },
      }}
      width={520}
    >
      <div style={{ padding: "8px 0" }}>
        <Card
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
          bodyStyle={{
            padding: "20px",
          }}
        >
          <Typography.Text
            style={{
              fontSize: "14px",
              display: "block",
              marginBottom: "16px",
              color: "var(--card-foreground)",
              fontWeight: 500,
            }}
          >
            Nhập ngân sách tháng cho nhóm:
          </Typography.Text>
          <InputNumber
            style={{
              width: "100%",
              height: "48px",
              fontSize: "18px",
              borderRadius: "12px",
            }}
            value={budgetAmount}
            onChange={(value) => setBudgetAmount(value)}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            min={1}
            prefix="₫"
            placeholder="Nhập số tiền ngân sách"
            size="large"
            className="budget-input"
            autoFocus
          />
        </Card>
        <Typography.Text
          type="secondary"
          style={{
            fontSize: "13px",
            lineHeight: "1.6",
            color: "var(--muted-foreground)",
            display: "block",
          }}
        >
          💡 Ngân sách giúp bạn theo dõi và kiểm soát chi tiêu hàng tháng của nhóm một cách hiệu quả.
        </Typography.Text>
      </div>
    </Modal>
  );
};

BudgetModal.defaultProps = {
  initialBudget: 0,
};

BudgetModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  initialBudget: PropTypes.number,
  trackerID: PropTypes.string.isRequired,
  groupDetail: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

const MemoizedBudgetModal = memo(BudgetModal);
export default MemoizedBudgetModal;
