import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Col, Card, List, Button, Drawer } from "antd";
import { Analytics } from "@styled-icons/ionicons-outline";
import useMediaQuery from "../../../hooks/useMediaQuery";
import UserServices from "../../../services/UserServices";
import GroupsAnalytics from "./GroupsAnalytics";

const GroupsTracker = ({ tracker }) => {
  const isNotMobile = useMediaQuery("(min-width: 768px)");

  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const user = await UserServices.fetchOtherUserInfo(tracker?.owner);
      setUser(user);
    };

    getUser();
  }, [tracker?.owner]);

  return (
    <>
      <Col span={24} md={12}>
        <Card
          {...(user && {
            title: `Sở hữu bởi ${user?.fullName} (${user?.email})`,
          })}
          bordered={false}
          style={isNotMobile && { ...{ minHeight: "100%" } }}
          extra={
            !isNotMobile && (
              <Button type="primary" className="d-md-none" onClick={() => setIsAnalyticsVisible(true)}>
                <Analytics size="20" />
              </Button>
            )
          }
        >
          <List
            itemLayout="horizontal"
            dataSource={tracker?.groups}
            renderItem={(item) => (
              <Link to={`/tracker/detail/${item?.uid}`} className="text-decoration-none">
                <List.Item>
                  <List.Item.Meta title={item.groupName} description={item.description} />
                </List.Item>
              </Link>
            )}
          />
        </Card>
      </Col>

      {isNotMobile ? (
        <Col span={24} md={12}>
          <Card bordered={false} style={{ minHeight: "100%" }}>
            <GroupsAnalytics tracker={tracker} />
          </Card>
        </Col>
      ) : (
        <Drawer placement="right" closable={true} onClose={() => setIsAnalyticsVisible(false)} open={isAnalyticsVisible} width="100%" height="100%">
          <GroupsAnalytics tracker={tracker} />
        </Drawer>
      )}
    </>
  );
};

GroupsTracker.propTypes = {
  tracker: PropTypes.object.isRequired,
};

export default GroupsTracker;
