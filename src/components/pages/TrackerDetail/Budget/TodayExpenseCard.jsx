import PropTypes from "prop-types";
import { memo } from "react";
import { Typography } from "antd";
import { convertCurrency } from "../../../../utils/numberUtils";

const TodayExpenseCard = ({ todaySum }) => {

  if (!todaySum) return null;

  return (
    <div
      className="shadow-hover rounded-xl"
      style={{
        padding: "12px 16px",
        background: "linear-gradient(to right, #fef2f2, #ffe4e6)",
        border: "1px solid #fecdd3",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography.Text style={{ fontSize: "16px" }}>
        <Typography.Text strong>Hôm nay</Typography.Text> đã chi tiêu:
      </Typography.Text>
      <Typography.Text
        strong
        className="text-danger"
        style={{
          fontSize: "18px",
          background: "rgba(255, 255, 255, 0.6)",
          padding: "4px 12px",
          borderRadius: "16px",
        }}
      >
        {convertCurrency(todaySum)}
      </Typography.Text>
    </div>
  );
};

TodayExpenseCard.propTypes = {
  todaySum: PropTypes.number.isRequired,
};

const MemoizedTodayExpenseCard = memo(TodayExpenseCard);
export default MemoizedTodayExpenseCard;
