import { useState } from "react";
import { Col, Card, List, Button, Drawer } from "antd";
import { Analytics } from "@styled-icons/ionicons-outline";
import useMediaQuery from "../../../hooks/useMediaQuery";
import GroupsAnalytics from "./GroupsAnalytics";

const mockList = [
  {
    groupName: "Group 1",
    description: "Description 1",
  },
  {
    groupName: "Group 2",
    description: "Description 2",
  },
  {
    groupName: "Group 3",
    description: "Description 3",
  },
  {
    groupName: "Group 4",
    description: "Description 4",
  },
  {
    groupName: "Group 5",
    description: "Description 5",
  },
  {
    groupName: "Group 6",
    description: "Description 6",
  },
];

const GroupsTracker = () => {
  const isNotMobile = useMediaQuery("(min-width: 768px)");

  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(false);

  return (
    <>
      <Col span={24} md={12}>
        <Card
          title={`Sở hữu bởi Galvin Nguyen (haidangnguyen1912@gmail.com)`}
          bordered={false}
          style={isNotMobile && { ...{ minHeight: "100%" } }}
          extra={
            !isNotMobile && (
              <Button
                type="primary"
                className="d-md-none"
                onClick={() => setIsAnalyticsVisible(true)}
              >
                <Analytics size="20" />
              </Button>
            )
          }
        >
          <List
            itemLayout="horizontal"
            dataSource={mockList}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.groupName}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>

      {isNotMobile ? (
        <Col span={24} md={12}>
          <Card bordered={false} style={{ minHeight: "100%" }}>
            <GroupsAnalytics />
          </Card>
        </Col>
      ) : (
        <Drawer
          placement="right"
          closable={true}
          onClose={() => setIsAnalyticsVisible(false)}
          open={isAnalyticsVisible}
          width="100%"
          height="100%"
        >
          <GroupsAnalytics />
        </Drawer>
      )}
    </>
  );
};

export default GroupsTracker;
