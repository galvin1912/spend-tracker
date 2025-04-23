import PropTypes from "prop-types";
import { useState, useEffect, memo } from "react";
import { Modal, Typography, InputNumber, message } from "antd";
import { useTranslation } from "react-i18next";
import GroupServices from "../../../../services/GroupServices";

const BudgetModal = ({ visible, initialBudget, trackerID, groupDetail, onCancel, onSuccess }) => {
  const { t } = useTranslation();
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
      message.error(t("validBudgetError"));
      return;
    }

    setIsSavingBudget(true);
    try {
      await GroupServices.updateGroup(trackerID, { budget: budgetAmount });
      message.success(t("budgetUpdateSuccess"));
      onSuccess(budgetAmount);
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsSavingBudget(false);
    }
  };

  return (
    <Modal
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          {groupDetail?.budget ? t("changeBudget") : t("setGroupBudget")}
        </Typography.Title>
      }
      open={visible}
      onOk={handleSaveBudget}
      onCancel={onCancel}
      confirmLoading={isSavingBudget}
      okText={t("saveBudget")}
      cancelText={t("cancel")}
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
        <Typography.Text style={{ fontSize: "15px", display: "block", marginBottom: "12px" }}>{t("enterBudget")}</Typography.Text>
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
          placeholder={t("enterBudgetPlaceholder")}
          size="large"
          className="budget-input"
        />
      </div>
      <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
        {t("budgetHelp")}
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
