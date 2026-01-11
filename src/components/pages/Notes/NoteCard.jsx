import { memo, useMemo } from "react";
import { Card, Button, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { Pin, Trash, Archive } from "@styled-icons/boxicons-regular";
import { Pin as PinSolid, Archive as ArchiveSolid } from "@styled-icons/boxicons-solid";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const NoteCard = memo(({ note, onClick, isSelected, onPin, onArchive, onDelete }) => {
  const preview = useMemo(() => {
    if (note.plainText) {
      return note.plainText.length > 100
        ? note.plainText.substring(0, 100) + "..."
        : note.plainText;
    }
    return "";
  }, [note.plainText]);

  const timeAgo = useMemo(() => {
    if (note.updatedAt) {
      const updatedAt = typeof note.updatedAt === "number" 
        ? dayjs(note.updatedAt) 
        : dayjs(note.updatedAt.toMillis?.() || note.updatedAt);
      return updatedAt.fromNow();
    }
    return "";
  }, [note.updatedAt]);

  const handleMenuClick = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation(); // Prevent card click
    }
  };

  const handlePinClick = (info) => {
    if (info && info.stopPropagation) {
      info.stopPropagation();
    }
    if (onPin) onPin(note.id);
  };

  const handleArchiveClick = (info) => {
    if (info && info.stopPropagation) {
      info.stopPropagation();
    }
    if (onArchive) onArchive(note.id);
  };

  const handleDeleteClick = (info) => {
    if (info && info.stopPropagation) {
      info.stopPropagation();
    }
    if (onDelete) onDelete(note.id);
  };

  const menuItems = [
    {
      key: "pin",
      label: note.isPinned ? "Bỏ ghim" : "Ghim",
      icon: note.isPinned ? <PinSolid size="16" /> : <Pin size="16" />,
      onClick: handlePinClick,
    },
    {
      key: "archive",
      label: note.isArchived ? "Bỏ lưu trữ" : "Lưu trữ",
      icon: note.isArchived ? <ArchiveSolid size="16" /> : <Archive size="16" />,
      onClick: handleArchiveClick,
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <Trash size="16" />,
      danger: true,
      onClick: handleDeleteClick,
    },
  ];

  return (
    <Card
      hoverable
      onClick={onClick}
      style={{
        marginBottom: 0,
        cursor: "pointer",
        border: isSelected ? "2px solid #1890ff" : "1px solid #f0f0f0",
        borderLeft: "none",
        borderRight: "none",
        borderRadius: 0,
        backgroundColor: isSelected ? "#f0f7ff" : "#fff",
      }}
      styles={{ body: { padding: "12px" } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        {note.isPinned && (
          <Pin size="16" style={{ color: "#faad14", flexShrink: 0, marginTop: "2px" }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              marginBottom: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {note.title || "Untitled"}
          </div>
          {preview && (
            <div
              style={{
                fontSize: "12px",
                color: "#8c8c8c",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {preview}
            </div>
          )}
          {timeAgo && (
            <div style={{ fontSize: "11px", color: "#bfbfbf" }}>
              {timeAgo}
            </div>
          )}
        </div>
        <div onClick={handleMenuClick}>
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="topRight">
            <Button
              type="text"
              icon={<MoreOutlined />}
              size="small"
              style={{ flexShrink: 0 }}
              onClick={handleMenuClick}
            />
          </Dropdown>
        </div>
      </div>
    </Card>
  );
});

NoteCard.propTypes = {
  note: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  onPin: PropTypes.func,
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
};

NoteCard.displayName = "NoteCard";

export default NoteCard;
