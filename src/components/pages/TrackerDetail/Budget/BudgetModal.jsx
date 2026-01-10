import PropTypes from "prop-types";
import { useState, useEffect, memo } from "react";
import { Modal, Typography, InputNumber, message } from "antd";
import GroupServices from "../../../../services/GroupServices";
import { translateError } from "../../../../utils/errorTranslator";

const BudgetModal = ({ visible, initialBudget, trackerID, groupDetail, onCancel, onSuccess }) => {
  const [budgetAmount, setBudgetAmount] = useState(null);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Update local state when initialBudget changes
  useEffect(() => {
    if (visible && initialBudget) {
      setBudgetAmount(initialBudget);
    }
  }, [visible, initialBudget]);

  // Handle budget save
  const handleSaveBudget = async () => {
    if (!budgetAmount || budgetAmount <= 0) {
      message.error("Vui lòng nhập số tiền ngân sách hợp lệ!");
      return;
    }

    setIsSavingBudget(true);
    try {
      await GroupServices.updateGroup(trackerID, { budget: budgetAmount });
      message.success("Cập nhật ngân sách thành công");
      onSuccess(budgetAmount);
    } catch (error) {
      message.error(translateError(error));
    } finally {
      setIsSavingBudget(false);
    }
  };

  return (
    <Modal
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          {groupDetail?.budget ? "Thay đổi ngân sách" : "Đặt ngân sách"}
        </Typography.Title>
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
          paddingLeft: "16px",
          paddingRight: "16px",
        },
      }}
      cancelButtonProps={{
        className: "rounded-xl",
        style: {
          fontWeight: 500,
          paddingLeft: "16px",
          paddingRight: "16px",
        },
      }}
      className="budget-modal"
      style={{ borderRadius: "16px" }}
    >
      <div style={{ marginBottom: "20px" }}>
        <Typography.Text style={{ fontSize: "15px", display: "block", marginBottom: "12px" }}>Nhập ngân sách tháng cho nhóm:</Typography.Text>
        <InputNumber
          style={{
            width: "100%",
            height: "46px",
            fontSize: "16px",
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
        />
      </div>
      <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
        Ngân sách giúp bạn theo dõi và kiểm soát chi tiêu hàng tháng của nhóm.
      </Typography.Text>
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
