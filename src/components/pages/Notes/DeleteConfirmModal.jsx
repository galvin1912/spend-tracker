import { useState, useEffect, useRef } from "react";
import { Modal, Button } from "antd";
import PropTypes from "prop-types";

const DeleteConfirmModal = ({ visible, onCancel, onConfirm, onUndo }) => {
  const [countdown, setCountdown] = useState(5);
  const undoTimeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const timeout = setTimeout(() => {
        if (onUndo) {
          onUndo();
        }
      }, 5000);

      undoTimeoutRef.current = timeout;

      return () => {
        clearInterval(timer);
        clearTimeout(timeout);
      };
    } else {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
      }
    }
  }, [visible, onUndo]);

  const handleUndo = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    if (onUndo) {
      onUndo();
    }
    onCancel();
  };

  return (
    <Modal
      title="Xác nhận xóa"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="undo" type="primary" onClick={handleUndo} disabled={countdown === 0}>
          Hoàn tác ({countdown}s)
        </Button>,
        <Button key="confirm" danger onClick={onConfirm}>
          Xóa vĩnh viễn
        </Button>,
      ]}
    >
      <p>Ghi chú đã được xóa. Bạn có thể hoàn tác trong {countdown} giây.</p>
    </Modal>
  );
};

DeleteConfirmModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onUndo: PropTypes.func,
};

export default DeleteConfirmModal;
