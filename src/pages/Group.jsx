import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { List, Button, Card, Collapse } from "antd";
import { Groups } from "@styled-icons/material";
import { Wallet } from "@styled-icons/boxicons-solid";
import { getOwnerWallets, getJoinedWallets } from "../features/wallet/walletActions";
import GroupServices from "../services/GroupServices";

const Group = () => {
  const dispatch = useDispatch();

  const ownerWallets = useSelector((state) => state.wallet.ownerWallets);
  const joinedWallets = useSelector((state) => state.wallet.joinedWallets);
  const isOwnerWalletsLoading = useSelector((state) => state.wallet.isOwnerWalletsLoading);
  const isJoinedWalletsLoading = useSelector((state) => state.wallet.isJoinedWalletsLoading);

  const [ownerGroupsByWallet, setOwnerGroupsByWallet] = useState({});
  const [joinedGroupsByWallet, setJoinedGroupsByWallet] = useState({});

  useEffect(() => {
    dispatch(getOwnerWallets());
    dispatch(getJoinedWallets());
  }, [dispatch]);

  useEffect(() => {
    const loadGroupsByWallet = async (wallets, setGroupsMap) => {
      if (!wallets.length) {
        setGroupsMap({});
        return;
      }

      const groupsMap = {};
      
      for (const wallet of wallets) {
        if (!wallet.groups || wallet.groups.length === 0) {
          groupsMap[wallet.uid] = [];
          continue;
        }

        try {
          const walletGroups = await Promise.all(
            wallet.groups.map(async (groupID) => {
              try {
                return await GroupServices.getDetail(groupID);
              } catch (error) {
                return null;
              }
            })
          );
          groupsMap[wallet.uid] = walletGroups.filter(Boolean);
        } catch (error) {
          groupsMap[wallet.uid] = [];
        }
      }

      setGroupsMap(groupsMap);
    };

    loadGroupsByWallet(ownerWallets, setOwnerGroupsByWallet);
    loadGroupsByWallet(joinedWallets, setJoinedGroupsByWallet);
  }, [ownerWallets, joinedWallets]);

  const createCollapseItems = (wallets, groupsByWallet) => {
    return wallets.map((wallet) => {
      const walletGroups = groupsByWallet[wallet.uid] || [];
      
      return {
        key: wallet.uid,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={20} />
            <span style={{ fontWeight: 500 }}>{wallet.walletName}</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginLeft: 'auto' }}>
              ({walletGroups.length} nhóm)
            </span>
          </div>
        ),
        children: walletGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--muted-foreground)' }}>
            Chưa có nhóm nào trong ví này
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={walletGroups}
            renderItem={(group) => (
              <List.Item>
                <Link 
                  to={`/group/detail/${group.uid}`} 
                  style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'block' }}
                >
                  <List.Item.Meta 
                    avatar={<Groups size={20} />} 
                    title={<span style={{ color: 'var(--foreground)' }}>{group.groupName}</span>} 
                    {...(group.description && {
                      description: <span style={{ color: 'var(--muted-foreground)' }}>{group.description}</span>
                    })}
                  />
                </Link>
              </List.Item>
            )}
          />
        ),
      };
    });
  };

  const ownerCollapseItems = useMemo(() => {
    return createCollapseItems(ownerWallets, ownerGroupsByWallet);
  }, [ownerWallets, ownerGroupsByWallet]);

  const joinedCollapseItems = useMemo(() => {
    return createCollapseItems(joinedWallets, joinedGroupsByWallet);
  }, [joinedWallets, joinedGroupsByWallet]);

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

      <div className="grid grid-cols-1">
        <Card
          title="Nhóm theo ví của tôi"
          bordered={false}
          loading={isOwnerWalletsLoading}
          className="page-card"
          style={{ marginBottom: '1.5rem' }}
        >
          {ownerWallets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
              Bạn chưa có ví nào. Hãy tạo ví để bắt đầu.
            </div>
          ) : (
            <Collapse items={ownerCollapseItems} />
          )}
        </Card>

        <Card
          title="Nhóm theo ví đã tham gia"
          bordered={false}
          loading={isJoinedWalletsLoading}
          className="page-card"
        >
          {joinedWallets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
              Bạn chưa tham gia ví nào.
            </div>
          ) : (
            <Collapse items={joinedCollapseItems} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Group;
