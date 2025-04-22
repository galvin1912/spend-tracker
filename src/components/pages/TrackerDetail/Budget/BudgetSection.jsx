import PropTypes from "prop-types";
import { memo } from "react";
import { Typography, Button } from "antd";
import { useTranslation } from "react-i18next";
import { convertCurrency } from "../../../../utils/numberUtils";

const BudgetSection = ({ groupDetail, onBudgetClick }) => {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-2xl shadow-hover"
      style={{
        marginBottom: "20px",
        padding: "16px 20px",
        background: "linear-gradient(to right, #f0f9ff, #e0f2fe)",
        border: "1px solid #bae6fd",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography.Text style={{ fontSize: "16px", fontWeight: 500 }}>{t("budget")}</Typography.Text>
        <Button
          type="primary"
          onClick={onBudgetClick}
          className="rounded-xl"
          style={{
            background: groupDetail?.budget ? "var(--primary-color)" : "#3b82f6",
            borderColor: groupDetail?.budget ? "var(--primary-color)" : "#3b82f6",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          icon={<span style={{ fontSize: "16px" }}>{groupDetail?.budget ? "✏️" : "+"}</span>}
        >
          {groupDetail?.budget ? t("editBudget") : t("setBudget")}
        </Button>
      </div>

      {groupDetail?.budget && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            background: "rgba(255, 255, 255, 0.7)",
            borderRadius: "12px",
          }}
        >
          <Typography.Title
            level={3}
            style={{
              margin: 0,
              color: "#0369a1",
              fontWeight: 600,
            }}
          >
            {convertCurrency(groupDetail.budget)}
          </Typography.Title>
        </div>
      )}
    </div>
  );
};

BudgetSection.propTypes = {
  groupDetail: PropTypes.object.isRequired,
  onBudgetClick: PropTypes.func.isRequired,
};

const MemoizedBudgetSection = memo(BudgetSection);
export default MemoizedBudgetSection;
