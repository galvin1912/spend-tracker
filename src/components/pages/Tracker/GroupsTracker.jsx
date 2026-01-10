import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Card, List, Button, Drawer } from "antd";
import { Analytics } from "@styled-icons/ionicons-outline";
import useMediaQuery from "../../../hooks/useMediaQuery";
import UserServices from "../../../services/UserServices";
import GroupsAnalytics from "./GroupsAnalytics";

const GroupsTracker = ({ tracker }) => {
  const isNotMobile = useMediaQuery("(min-width: 768px)");

  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(false);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const getOwner = async () => {
      if (tracker?.walletOwner) {
        const ownerInfo = await UserServices.fetchOtherUserInfo(tracker.walletOwner);
        setOwner(ownerInfo);
      }
    };

    getOwner();
  }, [tracker?.walletOwner]);

  const cardTitle = tracker?.walletName && owner 
    ? `${tracker.walletName} (${owner.fullName})`
    : tracker?.walletName || 'Ví';

  if (isNotMobile) {
    // Desktop: Show both cards side by side
    return (
      <>
        <Card
          title={cardTitle}
          bordered={false}
          style={{ minHeight: "100%" }}
          className="page-card"
        >
          <List
            itemLayout="horizontal"
            dataSource={tracker?.groups || []}
            locale={{ emptyText: 'Chưa có nhóm nào trong ví này' }}
            renderItem={(item) => (
              <Link to={`/tracker/detail/${item?.uid}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <List.Item style={{ cursor: 'pointer' }}>
                  <List.Item.Meta 
                    title={<span style={{ color: 'var(--foreground)' }}>{item.groupName}</span>} 
                    {...(item.description && {
                      description: <span style={{ color: 'var(--muted-foreground)' }}>{item.description}</span>
                    })}
                  />
                </List.Item>
              </Link>
            )}
          />
        </Card>
        <Card bordered={false} style={{ minHeight: "100%" }} className="page-card">
          <GroupsAnalytics tracker={tracker} />
        </Card>
      </>
    );
  }

  // Mobile: Show list card, analytics in drawer
  return (
    <>
      <Card
        title={cardTitle}
        bordered={false}
        extra={
          <Button type="primary" onClick={() => setIsAnalyticsVisible(true)}>
            <Analytics size="20" />
          </Button>
        }
        className="page-card"
      >
        <List
          itemLayout="horizontal"
          dataSource={tracker?.groups || []}
          locale={{ emptyText: 'Chưa có nhóm nào trong ví này' }}
          renderItem={(item) => (
            <Link to={`/tracker/detail/${item?.uid}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <List.Item style={{ cursor: 'pointer' }}>
                <List.Item.Meta 
                  title={<span style={{ color: 'var(--foreground)' }}>{item.groupName}</span>} 
                  {...(item.description && {
                    description: <span style={{ color: 'var(--muted-foreground)' }}>{item.description}</span>
                  })}
                />
              </List.Item>
            </Link>
          )}
        />
      </Card>
      <Drawer 
        placement="right" 
        closable={true} 
        onClose={() => setIsAnalyticsVisible(false)} 
        open={isAnalyticsVisible} 
        width="100%" 
        height="100%"
      >
        <GroupsAnalytics tracker={tracker} />
      </Drawer>
    </>
  );
};

GroupsTracker.propTypes = {
  tracker: PropTypes.object.isRequired,
};

export default GroupsTracker;
