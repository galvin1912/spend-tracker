import { useMemo } from "react";
import PropTypes from "prop-types";

const SaveStatus = ({ status }) => {
  const statusConfig = useMemo(() => {
    switch (status) {
      case "saving":
        return {
          icon: "🟡",
          text: "Đang lưu...",
          color: "#faad14",
        };
      case "saved":
        return {
          icon: "🟢",
          text: "Đã lưu",
          color: "#52c41a",
        };
      case "error":
        return {
          icon: "🔴",
          text: "Lỗi – sẽ sync lại",
          color: "#ff4d4f",
        };
      default:
        return null;
    }
  }, [status]);

  if (!statusConfig) {
    return null;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        color: statusConfig.color,
        fontWeight: 500,
      }}
    >
      <span>{statusConfig.icon}</span>
      <span>{statusConfig.text}</span>
    </div>
  );
};

SaveStatus.propTypes = {
  status: PropTypes.oneOf(["saving", "saved", "error"]),
};

export default SaveStatus;
