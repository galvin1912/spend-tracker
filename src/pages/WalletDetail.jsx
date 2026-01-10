import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { Form, Input, List, Button, Avatar, Card } from "antd";
import { PersonAdd } from "@styled-icons/evaicons-solid";
import { PersonRemove } from "@styled-icons/material-rounded";
import { debounce } from "lodash";
import dayjs from "../configs/dayjs";
import WalletServices from "../services/WalletServices";
import GroupServices from "../services/GroupServices";
import GroupDetailImage from "../assets/4380.jpg";
import UserServices from "../services/UserServices";
import { translateError } from "../utils/errorTranslator";
import messageUtil from "../utils/messageUtil";
import { updateWallet, addMember, removeMember } from "../features/wallet/walletActions";

const WalletDetail = () => {
  const { walletID } = useParams();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { user } = useSelector((state) => state.user);

  const [searchText, setSearchText] = useState("");
  const [memberOptionsLoading, setMemberOptionsLoading] = useState(false);
  const [memberOptions, setMemberOptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberInfos, setMemberInfos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [walletDetail, setWalletDetail] = useState(null);

  const isOwnerWallet = useMemo(() => {
    return walletDetail?.owner === user?.uid;
  }, [walletDetail, user]);

  useEffect(() => {
    if (!walletID) return;

    const getWalletDetail = async () => {
      try {
        const wallet = await WalletServices.getDetail(walletID);
        setWalletDetail(wallet);
        form.setFieldsValue({
          walletName: wallet?.walletName || "",
          description: wallet?.description || "",
          createdAt: wallet?.createdAt ? dayjs(wallet.createdAt.toDate()).format("DD/MM/YYYY HH:mm") : "",
          updatedAt: wallet?.updatedAt ? dayjs(wallet.updatedAt.toDate()).format("DD/MM/YYYY HH:mm") : "",
        });
        setMembers(wallet?.members || []);
      } catch (error) {
        messageUtil.error(translateError(error));
      }
    };

    getWalletDetail();
  }, [form, walletID]);

  useEffect(() => {
    if (!walletID || !walletDetail?.groups?.length) return;

    const getGroups = async () => {
      try {
        const groupsData = await Promise.all(
          walletDetail.groups.map(async (groupID) => {
            try {
              return await GroupServices.getDetail(groupID);
            } catch (error) {
              return null;
            }
          })
        );
        setGroups(groupsData.filter(Boolean));
      } catch (error) {
        messageUtil.error(translateError(error));
      }
    };

    getGroups();
  }, [walletID, walletDetail]);

  useEffect(() => {
    if (!members.length) {
      setMemberInfos([]);
      return;
    }

    const getMemberInfo = async () => {
      try {
        const memberInfosData = await Promise.all(
          members.map(async (uid) => {
            try {
              return await UserServices.fetchOtherUserInfo(uid);
            } catch (error) {
              return null;
            }
          })
        );
        setMemberInfos(memberInfosData.filter(Boolean));
      } catch (error) {
        messageUtil.error(translateError(error));
      }
    };

    getMemberInfo();
  }, [members]);

  const handleSearchMember = (event) => {
    const { value } = event.target;
    setSearchText(value);

    if (!value || value.length < 3) {
      setMemberOptions([]);
      return;
    }

    const searchMember = async () => {
      setMemberOptionsLoading(true);
      try {
        const users = await WalletServices.searchMember(value);
        const options = users.map((user) => ({
          uid: user.uid,
          label: `${user.fullName} (${user.email})`,
        }));

        const filterOptions = options.filter((option) => {
          return option.uid !== user.uid && !members.find((memberUid) => memberUid === option.uid);
        });

        setMemberOptions(filterOptions);
      } catch (error) {
        messageUtil.error(translateError(error));
      } finally {
        setMemberOptionsLoading(false);
      }
    };

    debounce(searchMember, 500)();
  };

  const handleAddMember = async (uid) => {
    try {
      await dispatch(addMember(walletID, uid));
      const updatedWallet = await WalletServices.getDetail(walletID);
      setMembers(updatedWallet.members || []);
      setMemberOptions([]);
      setSearchText("");
    } catch (error) {
      // Error handled in action
    }
  };

  const handleRemoveMember = async (uid) => {
    try {
      await dispatch(removeMember(walletID, uid));
      const updatedWallet = await WalletServices.getDetail(walletID);
      setMembers(updatedWallet.members || []);
    } catch (error) {
      // Error handled in action
    }
  };

  const handleUpdateWallet = async (values) => {
    const { walletName, description } = values;

    try {
      await dispatch(updateWallet(walletID, { walletName, description }));
      const updatedWallet = await WalletServices.getDetail(walletID);
      setWalletDetail(updatedWallet);
    } catch (error) {
      // Error handled in action
    }
  };

  return (
    <div className="page-container">
      <Helmet
        title="Chi tiết ví | GST"
        meta={[
          {
            name: "description",
            content: "Xem và quản lý chi tiết ví.",
          },
        ]}
      />

      <div className="page-header">
        <h1 className="page-title">Chi tiết ví</h1>
        <div className="page-actions">
          <Link to="/wallet">
            <Button danger>Quay lại</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 grid-cols-md-2">
        <div>
          <Card
            title="Thông tin ví"
            className="page-card"
            style={{ marginBottom: '1.5rem' }}
          >
            <Form form={form} name="walletDetailForm" layout="vertical" autoComplete="off" onFinish={handleUpdateWallet} disabled={!isOwnerWallet}>
              <Form.Item
                label="Tên ví"
                name="walletName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên ví!",
                  },
                  {
                    max: 50,
                    message: "Tên ví không được vượt quá 50 ký tự!",
                  },
                  {
                    whitespace: true,
                    message: "Tên ví không được để trống",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  {
                    max: 200,
                    message: "Mô tả không được vượt quá 200 ký tự!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Tạo lúc" name="createdAt">
                <Input disabled />
              </Form.Item>

              <Form.Item label="Cập nhật lúc" name="updatedAt">
                <Input disabled />
              </Form.Item>

              <Form.Item>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to="/wallet">
                    <Button type="default">
                      Hủy
                    </Button>
                  </Link>
                  {isOwnerWallet && (
                    <Button type="primary" htmlType="submit">
                      Cập nhật
                    </Button>
                  )}
                </div>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Thành viên" className="page-card" style={{ marginBottom: '1.5rem' }}>
            {isOwnerWallet && (
              <Input 
                placeholder="Tìm thành viên theo email" 
                allowClear 
                value={searchText} 
                onChange={handleSearchMember}
                style={{ marginBottom: '1rem' }}
              />
            )}
            {searchText.length >= 3 && (
              <List
                bordered
                dataSource={memberOptions}
                loading={memberOptionsLoading}
                locale={{ emptyText: <i>Không có kết quả phù hợp</i> }}
                style={{ marginBottom: '1rem' }}
                renderItem={(memberOption) => (
                  <List.Item 
                    style={{ cursor: "pointer" }} 
                    extra={<PersonAdd size={20} />} 
                    onClick={() => handleAddMember(memberOption.uid)}
                  >
                    <span>{memberOption.label}</span>
                  </List.Item>
                )}
              />
            )}
            {memberInfos.length > 0 && (
              <List
                dataSource={memberInfos}
                renderItem={(memberInfo) => (
                  <List.Item
                    extra={
                      isOwnerWallet && (
                        <Button type="text" onClick={() => handleRemoveMember(memberInfo?.uid)}>
                          <PersonRemove size={20} />
                        </Button>
                      )
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar>{memberInfo?.fullName?.charAt(0).toUpperCase()}</Avatar>}
                      title={<span style={{ color: 'var(--foreground)' }}>{memberInfo?.fullName}</span>}
                      description={<span style={{ color: 'var(--muted-foreground)' }}>{memberInfo?.email}</span>}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card title="Nhóm trong ví" className="page-card">
            {groups.length > 0 ? (
              <List
                dataSource={groups}
                renderItem={(group) => (
                  <List.Item>
                    <Link 
                      to={`/group/detail/${group.uid}`} 
                      style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'block' }}
                    >
                      <List.Item.Meta
                        title={<span style={{ color: 'var(--foreground)' }}>{group.groupName}</span>}
                        {...(group.description && {
                          description: <span style={{ color: 'var(--muted-foreground)' }}>{group.description}</span>
                        })}
                      />
                    </Link>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--muted-foreground)' }}>
                Chưa có nhóm nào trong ví này
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="page-card" style={{ position: 'sticky', top: '80px' }}>
            <img 
              src={GroupDetailImage} 
              alt="Chi tiết ví" 
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletDetail;
