import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { List, Button, Card, Popconfirm } from "antd";
import { Groups } from "@styled-icons/material";
import { Trash } from "@styled-icons/bootstrap";
import { deleteOwnerGroup, getJoinedGroups, getOwnerGroups } from "../features/group/groupActions";

const Group = () => {
  const dispatch = useDispatch();

  const isOwnerGroupsLoading = useSelector((state) => state.group.isOwnerGroupsLoading);
  const isJoinedGroupsLoading = useSelector((state) => state.group.isJoinedGroupsLoading);
  const ownerGroups = useSelector((state) => state.group.ownerGroups);
  const joinedGroups = useSelector((state) => state.group.joinedGroups);

  useEffect(() => {
    dispatch(getOwnerGroups());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getJoinedGroups());
  }, [dispatch]);

  return (
    <div className="page-container">
      <Helmet
        title="Nhóm | GST"
        meta={[
          {
            name: "description",
            content: "Quản lý nhóm của bạn.",
          },
        ]}
      />

      <div className="page-header">
        <h1 className="page-title">Nhóm của tôi</h1>
        <div className="page-actions">
          <Link to="/group/create">
            <Button type="primary">Tạo nhóm</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 grid-cols-md-2">
        <Card
          title="Nhóm của tôi"
          bordered={false}
          loading={isOwnerGroupsLoading}
          className="page-card"
        >
          <List
            itemLayout="horizontal"
            dataSource={ownerGroups}
            locale={{ emptyText: 'Bạn chưa sở hữu nhóm nào.' }}
            renderItem={(item) => (
              <List.Item
                extra={
                  <Popconfirm
                    title="Bạn có chắc muốn xóa nhóm này?"
                    description="Hành động này không thể hoàn tác."
                    onConfirm={() => dispatch(deleteOwnerGroup(item.uid))}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button type="default" danger>
                      <Trash size={20} />
                    </Button>
                  </Popconfirm>
                }
              >
                <Link 
                  to={`/group/detail/${item.uid}`} 
                  style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'block' }}
                >
                  <List.Item.Meta 
                    avatar={<Groups size={24} />} 
                    title={<span style={{ color: 'var(--foreground)' }}>{item.groupName}</span>} 
                    {...(item.description && {
                      description: <span style={{ color: 'var(--muted-foreground)' }}>{item.description}</span>
                    })}
                  />
                </Link>
              </List.Item>
            )}
          />
        </Card>

        <Card 
          title="Nhóm đã tham gia" 
          bordered={false} 
          loading={isJoinedGroupsLoading}
          className="page-card"
        >
          <List
            itemLayout="horizontal"
            dataSource={joinedGroups}
            locale={{ emptyText: 'Bạn chưa tham gia nhóm nào.' }}
            renderItem={(item) => (
              <List.Item>
                <Link 
                  to={`/group/detail/${item.uid}`} 
                  style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'block' }}
                >
                  <List.Item.Meta 
                    avatar={<Groups size={24} />} 
                    title={<span style={{ color: 'var(--foreground)' }}>{item.groupName}</span>} 
                    {...(item.description && {
                      description: <span style={{ color: 'var(--muted-foreground)' }}>{item.description}</span>
                    })}
                  />
                </Link>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default Group;
