import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Empty } from "antd";
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
    <div className="page-container">
      <Helmet
        title="Quản lý chi tiêu | GST"
        meta={[
          {
            name: "description",
            content: "Xem và quản lý các chi tiêu của bạn",
          },
        ]}
      />

      <div className="page-header">
        <h1 className="page-title">Quản lý chi tiêu</h1>
      </div>

      {isTrackersLoading ? (
        <div className="grid grid-cols-1 grid-cols-md-2">
          <div className="page-card">
            <Empty description="Đang tải..." />
          </div>
        </div>
      ) : trackers?.length > 0 ? (
        <div className="grid grid-cols-1 grid-cols-md-2">
          {trackers.map((tracker) => (
            <GroupsTracker key={tracker?.owner} tracker={tracker} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">Chưa có quản lý chi tiêu nào</h3>
          <p className="empty-state-description">
            Bạn chưa có quản lý chi tiêu nào. Hãy tạo nhóm để bắt đầu theo dõi chi tiêu của bạn.
          </p>
        </div>
      )}
    </div>
  );
};

export default Tracker;
