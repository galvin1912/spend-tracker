import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Row, Col, Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import GroupsTracker from "../components/pages/Tracker/GroupsTracker";
import { getTrackers } from "../features/tracker/trackerActions";

const Tracker = () => {
  const dispatch = useDispatch();

  const isTrackersLoading = useSelector((state) => state.tracker.isTrackersLoading);
  const trackers = useSelector((state) => state.tracker.trackers);

  useEffect(() => {
    dispatch(getTrackers());
  }, [dispatch]);

  return (
    <>
      <Helmet
        title="Quản lý chi tiêu | GST"
        meta={[
          {
            name: "description",
            content: "Xem và quản lý các chi tiêu của bạn",
          },
        ]}
      />

      <Row gutter={[24, 12]}>
        {trackers?.length && !isTrackersLoading ? trackers?.map((tracker) => <GroupsTracker key={tracker?.owner} tracker={tracker} />) : null}

        {(!trackers?.length && !isTrackersLoading) && (
          <Col span={24}>
            <Alert
              message="Không tìm thấy quản lý chi tiêu nào"
              description="Bạn chưa có quản lý chi tiêu nào. Hãy tạo nhóm để bắt đầu."
              type="info"
              showIcon
            />
          </Col>
        )}
      </Row>
    </>
  );
};

export default Tracker;
