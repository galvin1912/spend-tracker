import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Row, Col, Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import GroupsTracker from "../components/pages/Tracker/GroupsTracker";
import { getTrackers } from "../features/tracker/trackerActions";

const Tracker = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isTrackersLoading = useSelector((state) => state.tracker.isTrackersLoading);
  const trackers = useSelector((state) => state.tracker.trackers);

  useEffect(() => {
    dispatch(getTrackers());
  }, [dispatch]);

  return (
    <>
      <Helmet
        title={`${t('trackers')} | GST`}
        meta={[
          {
            name: "description",
            content: t('trackersDescription'),
          },
        ]}
      />

      <Row gutter={[24, 12]}>
        {trackers?.length && !isTrackersLoading ? trackers?.map((tracker) => <GroupsTracker key={tracker?.owner} tracker={tracker} />) : null}

        {(!trackers?.length && !isTrackersLoading) && (
          <Col span={24}>
            <Alert
              message={t('noTrackers')}
              description={t('noTrackersDescription')}
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
