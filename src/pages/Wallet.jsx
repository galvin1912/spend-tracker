import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { List, Button, Card } from "antd";
import { Wallet } from "@styled-icons/boxicons-solid";
import { getOwnerWallets, getJoinedWallets } from "../features/wallet/walletActions";
import UserServices from "../services/UserServices";

const WalletPage = () => {
  const dispatch = useDispatch();

  const ownerWallets = useSelector((state) => state.wallet.ownerWallets);
  const joinedWallets = useSelector((state) => state.wallet.joinedWallets);
  const isOwnerWalletsLoading = useSelector((state) => state.wallet.isOwnerWalletsLoading);
  const isJoinedWalletsLoading = useSelector((state) => state.wallet.isJoinedWalletsLoading);

  const [ownerInfos, setOwnerInfos] = useState({});

  useEffect(() => {
    dispatch(getOwnerWallets());
    dispatch(getJoinedWallets());
  }, [dispatch]);

  useEffect(() => {
    const loadOwnerInfos = async () => {
      if (!joinedWallets.length) {
        setOwnerInfos({});
        return;
      }

      const infos = {};
      await Promise.all(
        joinedWallets.map(async (wallet) => {
          if (wallet.owner) {
            try {
              const ownerInfo = await UserServices.fetchOtherUserInfo(wallet.owner);
              infos[wallet.uid] = ownerInfo;
            } catch (error) {
              // Silently fail, owner info will not be displayed
              infos[wallet.uid] = null;
            }
          }
        })
      );
      setOwnerInfos(infos);
    };

    loadOwnerInfos();
  }, [joinedWallets]);

  return (
    <div className="page-container">
      <Helmet
        title="Ví | GST"
        meta={[
          {
            name: "description",
            content: "Quản lý ví của bạn.",
          },
        ]}
      />

      <div className="page-header">
        <h1 className="page-title">Ví của tôi</h1>
        <div className="page-actions">
          <Link to="/wallet/create">
            <Button type="primary">Tạo ví</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 grid-cols-md-2">
        <Card
          title="Danh sách ví của tôi"
          bordered={false}
          loading={isOwnerWalletsLoading}
          className="page-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <List
            itemLayout="horizontal"
            dataSource={ownerWallets}
            locale={{ emptyText: 'Bạn chưa có ví nào.' }}
            renderItem={(item) => (
              <List.Item>
                <Link 
                  to={`/wallet/detail/${item.uid}`} 
                  style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'block' }}
                >
                  <List.Item.Meta 
                    avatar={<Wallet size={24} />} 
                    title={<span style={{ color: 'var(--foreground)' }}>{item.walletName}</span>} 
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
          title="Danh sách ví đã tham gia"
          bordered={false}
          loading={isJoinedWalletsLoading}
          className="page-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <List
            itemLayout="horizontal"
            dataSource={joinedWallets}
            locale={{ emptyText: 'Bạn chưa tham gia ví nào.' }}
            renderItem={(item) => {
              const ownerInfo = ownerInfos[item.uid];
              const title = ownerInfo?.fullName 
                ? `${item.walletName} (${ownerInfo.fullName})`
                : item.walletName;
              
              return (
                <List.Item>
                  <Link 
                    to={`/wallet/detail/${item.uid}`} 
                    style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'block' }}
                  >
                    <List.Item.Meta 
                      avatar={<Wallet size={24} />} 
                      title={<span style={{ color: 'var(--foreground)' }}>{title}</span>} 
                      {...(item.description && {
                        description: <span style={{ color: 'var(--muted-foreground)' }}>{item.description}</span>
                      })}
                    />
                  </Link>
                </List.Item>
              );
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default WalletPage;
