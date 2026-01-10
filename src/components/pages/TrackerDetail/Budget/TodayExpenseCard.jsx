import PropTypes from "prop-types";
import { memo } from "react";
import { Typography, Card } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { convertCurrency } from "../../../../utils/numberUtils";

const TodayExpenseCard = ({ todaySum }) => {
  if (!todaySum) return null;

  return (
    <Card
      className="today-expense-card"
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.15)",
              flexShrink: 0,
            }}
          >
            <ShoppingCartOutlined style={{ fontSize: "22px", color: "var(--destructive)" }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Typography.Text
              type="secondary"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                display: "block",
                marginBottom: "4px",
                color: "var(--muted-foreground)",
              }}
            >
              Chi tiêu hôm nay
            </Typography.Text>
          </div>
        </div>
        <div
          style={{
            padding: "10px 18px",
            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            borderRadius: "10px",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <Typography.Text
            strong
            style={{
              fontSize: "18px",
              color: "var(--destructive)",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {convertCurrency(todaySum)}
          </Typography.Text>
        </div>
      </div>
    </Card>
  );
};

TodayExpenseCard.propTypes = {
  todaySum: PropTypes.number.isRequired,
};

const MemoizedTodayExpenseCard = memo(TodayExpenseCard);
export default MemoizedTodayExpenseCard;
