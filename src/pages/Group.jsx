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
    <>
      <Helmet
        title="Nhóm | GST"
        meta={[
          {
            name: "description",
            content: "Quản lý nhóm của bạn.",
          },
        ]}
      />

      <div className="row">
        <div className="col-md-6">
          <Card
            className="mb-3 mb-md-0"
            title="Nhóm của tôi"
            bordered={false}
            loading={isOwnerGroupsLoading}
            extra={
              <Link to="/group/create">
                <Button type="primary">Tạo nhóm</Button>
              </Link>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={ownerGroups}
              locale={{ emptyText: "Bạn chưa sở hữu nhóm nào." }}
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
                    className="text-decoration-none d-block w-100 text-dark"
                  >
                    <List.Item.Meta
                      avatar={<Groups size={32} />}
                      title={item.groupName}
                      description={item.description}
                    />
                  </Link>
                </List.Item>
              )}
            />
          </Card>
        </div>

        <div className="col-md-6">
          <Card
            title="Nhóm tôi tham gia"
            bordered={false}
            loading={isJoinedGroupsLoading}
          >
            <List
              itemLayout="horizontal"
              dataSource={joinedGroups}
              locale={{ emptyText: "Bạn chưa tham gia nhóm nào." }}
              renderItem={(item) => (
                <List.Item>
                  <Link
                    to={`/group/detail/${item.uid}`}
                    className="text-decoration-none d-block w-100 text-dark"
                  >
                    <List.Item.Meta
                      avatar={<Groups size={32} />}
                      title={item.groupName}
                      description={item.description}
                    />
                  </Link>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default Group;
