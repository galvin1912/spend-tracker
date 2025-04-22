import PropTypes from "prop-types";
import { memo, useState } from "react";
import { Button, Modal } from "antd";
import { useTranslation } from "react-i18next";
import SpendingInsights from "./SpendingInsights";

const SpendingInsightsButton = ({ trackerID, categories }) => {
  const { t } = useTranslation();
  const [isInsightsModalVisible, setIsInsightsModalVisible] = useState(false);

  return (
    <>
      <Button type="default" onClick={() => setIsInsightsModalVisible(true)} style={{ marginBottom: 16 }}>
        {t("spendingInsights")}
      </Button>

      <Modal
        open={isInsightsModalVisible}
        onCancel={() => setIsInsightsModalVisible(false)}
        footer={null}
        width={800}
        title={t("spendingInsightsTitle")}
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
