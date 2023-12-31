import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Row, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import GroupsTracker from "../components/pages/Tracker/GroupsTracker";
import { getTrackers } from "../features/tracker/trackerActions";

const Tracker = () => {
  const dispatch = useDispatch();

  const isTrackersLoading = useSelector(
    (state) => state.tracker.isTrackersLoading
  );
  const trackers = useSelector((state) => state.tracker.trackers);

  useEffect(() => {
    dispatch(getTrackers());
  }, [dispatch]);

  return (
    <>
      <Helmet
        title="Thống kê | GST"
        meta={[
          {
            name: "description",
            content: "Thống kê chi tiêu của bạn",
          },
        ]}
      />

      <Spin spinning={isTrackersLoading}>
        <Row gutter={[24, 12]}>
          {trackers?.map((tracker) => (
            <GroupsTracker key={tracker?.owner} tracker={tracker} />
          ))}
        </Row>
      </Spin>
    </>
  );
};

export default Tracker;
