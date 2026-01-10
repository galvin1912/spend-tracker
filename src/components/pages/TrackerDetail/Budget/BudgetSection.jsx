import PropTypes from "prop-types";
import { memo } from "react";
import { Typography, Button, Card } from "antd";
import { WalletOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { convertCurrency } from "../../../../utils/numberUtils";

const BudgetSection = ({ groupDetail, onBudgetClick }) => {
  return (
    <Card
      className="budget-section-card"
      style={{
        borderRadius: "16px",
        border: "1px solid var(--border)",
        background: "var(--card)",
        boxShadow: "var(--shadow-sm)",
        transition: "all 0.3s ease",
      }}
      bodyStyle={{
        padding: "20px",
      }}
      hoverable
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
            <Typography.Title level={5} style={{ margin: 0, fontWeight: 600, color: "var(--card-foreground)" }}>
              Ngân sách tháng
            </Typography.Title>
          </div>
          <Button
            type={groupDetail?.budget ? "default" : "primary"}
            onClick={onBudgetClick}
            icon={groupDetail?.budget ? <EditOutlined /> : <PlusOutlined />}
            className="rounded-xl"
            style={{
              fontWeight: 500,
              height: "36px",
              borderRadius: "10px",
            }}
          >
            {groupDetail?.budget ? "Chỉnh sửa" : "Đặt ngân sách"}
          </Button>
        </div>

        {/* Budget Amount */}
        {groupDetail?.budget ? (
          <div
            style={{
              padding: "20px",
              background: "linear-gradient(135deg, var(--muted) 0%, var(--secondary) 100%)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              textAlign: "center",
            }}
          >
            <Typography.Text
              type="secondary"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "8px",
                color: "var(--muted-foreground)",
              }}
            >
              Tổng ngân sách
            </Typography.Text>
            <Typography.Title
              level={2}
              style={{
                margin: 0,
                color: "var(--card-foreground)",
                fontWeight: 700,
                fontSize: "28px",
                lineHeight: "1.2",
              }}
            >
              {convertCurrency(groupDetail.budget)}
            </Typography.Title>
          </div>
        ) : (
          <div
            style={{
              padding: "24px",
              background: "var(--muted)",
              borderRadius: "12px",
              border: "2px dashed var(--border)",
              textAlign: "center",
            }}
          >
            <Typography.Text
              type="secondary"
              style={{
                fontSize: "14px",
                color: "var(--muted-foreground)",
                display: "block",
              }}
            >
              Chưa có ngân sách được đặt cho tháng này
            </Typography.Text>
          </div>
        )}
      </div>
    </Card>
  );
};

BudgetSection.propTypes = {
  groupDetail: PropTypes.object,
  onBudgetClick: PropTypes.func.isRequired,
};

const MemoizedBudgetSection = memo(BudgetSection);
export default MemoizedBudgetSection;
