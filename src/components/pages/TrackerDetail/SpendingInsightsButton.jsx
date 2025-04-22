import PropTypes from "prop-types";
import { memo, useState } from "react";
import { Button, Modal } from "antd";
import SpendingInsights from './SpendingInsights';

const SpendingInsightsButton = ({ trackerID, categories }) => {
  const [isInsightsModalVisible, setIsInsightsModalVisible] = useState(false);
  
  return (
    <>
      <Button 
        type="default" 
        onClick={() => setIsInsightsModalVisible(true)} 
        style={{ marginBottom: 16 }}
      >
        Xem báo cáo chi tiêu
      </Button>

      <Modal
        open={isInsightsModalVisible}
        onCancel={() => setIsInsightsModalVisible(false)}
        footer={null}
        width={800}
        title="Báo cáo chi tiêu & Thống kê"
      >
        <SpendingInsights trackerID={trackerID} categories={categories} />
      </Modal>
    </>
  );
};

SpendingInsightsButton.propTypes = {
  trackerID: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
};

const MemoizedSpendingInsightsButton = memo(SpendingInsightsButton);
export default MemoizedSpendingInsightsButton;