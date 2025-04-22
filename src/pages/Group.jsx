import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { List, Button, Card, Popconfirm } from "antd";
import { Groups } from "@styled-icons/material";
import { Trash } from "@styled-icons/bootstrap";
import { useTranslation } from "react-i18next";
import { deleteOwnerGroup, getJoinedGroups, getOwnerGroups } from "../features/group/groupActions";

const Group = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

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
        title={`${t('groups')} | GST`}
        meta={[
          {
            name: "description",
            content: t('groupsDescription', 'Quản lý nhóm của bạn.'),
          },
        ]}
      />

      <div className="row">
        <div className="col-md-6">
          <Card
            className="mb-3 mb-md-0"
            title={t('myGroups')}
            bordered={false}
            loading={isOwnerGroupsLoading}
            extra={
              <Link to="/group/create">
                <Button type="primary">{t('createGroup')}</Button>
              </Link>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={ownerGroups}
              locale={{ emptyText: t('noOwnedGroups', 'Bạn chưa sở hữu nhóm nào.') }}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Popconfirm
                      title={t('deleteGroupConfirm')}
                      description={t('deleteGroupWarning')}
                      onConfirm={() => dispatch(deleteOwnerGroup(item.uid))}
                      okText={t('yes')}
                      cancelText={t('no')}
                    >
                      <Button type="default" danger>
                        <Trash size={20} />
                      </Button>
                    </Popconfirm>
                  }
                >
                  <Link to={`/group/detail/${item.uid}`} className="text-decoration-none text-dark d-flex flex-fill pe-3">
                    <List.Item.Meta avatar={<Groups size={32} />} title={item.groupName} description={item.description} />
                  </Link>
                </List.Item>
              )}
            />
          </Card>
        </div>

        <div className="col-md-6">
          <Card title={t('joinedGroups')} bordered={false} loading={isJoinedGroupsLoading}>
            <List
              itemLayout="horizontal"
              dataSource={joinedGroups}
              locale={{ emptyText: t('noJoinedGroups', 'Bạn chưa tham gia nhóm nào.') }}
              renderItem={(item) => (
                <List.Item>
                  <Link to={`/group/detail/${item.uid}`} className="text-decoration-none text-dark d-flex flex-fill pe-3">
                    <List.Item.Meta avatar={<Groups size={32} />} title={item.groupName} description={item.description} />
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
