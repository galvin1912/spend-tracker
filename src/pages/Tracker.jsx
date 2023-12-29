import { Row } from "antd";
import GroupsTracker from "../components/pages/SpendTracker/GroupsTracker";

const Tracker = () => {
  return (
    <Row gutter={[24, 12]}>
      <GroupsTracker />
    </Row>
  );
};

export default Tracker;
