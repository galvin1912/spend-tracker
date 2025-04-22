import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Row, Col, Form, Input, ColorPicker, List, Button, Avatar, Card, message } from "antd";
import { PersonAdd } from "@styled-icons/evaicons-solid";
import { PersonRemove } from "@styled-icons/material-rounded";
import { debounce } from "lodash";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import GroupServices from "../services/GroupServices";
import GroupDetailImage from "../assets/4380.jpg";
import UserServices from "../services/UserServices";

const GroupDetail = () => {
  const { t } = useTranslation();
  
  // This is used to get groupID from URL
  const { groupID } = useParams();

  // This is used to navigate to other page
  const navigate = useNavigate();

  // This is used to create form instance
  const [form] = Form.useForm();

  // This is used to get user from redux store
  const { user } = useSelector((state) => state.user);

  // This state is used to store member and search text
  const [searchText, setSearchText] = useState("");
  const [memberOptionsLoading, setMemberOptionsLoading] = useState(false);
  const [memberOptions, setMemberOptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberInfos, setMemberInfos] = useState([]);

  // This is used to check if current user is owner of group
  const isOwnerGroup = useMemo(() => {
    return user?.groups?.find((group) => group === groupID);
  }, [user, groupID]);

  // This effect is used to get group detail
  useEffect(() => {
    if (!groupID) return;

    const getGroupDetail = async () => {
      try {
        const group = await GroupServices.getDetail(groupID);
        form.setFieldsValue({
          groupName: group?.groupName || "",
          description: group?.description || "",
          color: group?.color || "#1677FF",
          createdAt: group?.createdAt ? dayjs(group.createdAt.toDate()).format("DD/MM/YYYY HH:mm") : "",
          updatedAt: group?.updatedAt ? dayjs(group.updatedAt.toDate()).format("DD/MM/YYYY HH:mm") : "",
        });
      } catch (error) {
        message.error(error.message);
      }
    };

    getGroupDetail();
  }, [form, groupID]);

  // This effect is used to get members
  useEffect(() => {
    if (!groupID) return;

    const getMembers = async () => {
      try {
        const members = await GroupServices.getMembers(groupID);
        setMembers(members.map((member) => member.uid));
      } catch (error) {
        message.error(error.message);
      }
    };

    getMembers();
  }, [groupID]);

  // This effect is used to get member info
  useEffect(() => {
    if (!groupID) return;

    const getMemberInfo = async () => {
      try {
        const memberInfos = await Promise.all(
          members.map(async (uid) => {
            const memberInfo = await UserServices.fetchOtherUserInfo(uid);
            return memberInfo;
          })
        );
        setMemberInfos(memberInfos);
      } catch (error) {
        message.error(error.message);
      }
    };

    getMemberInfo();
  }, [groupID, members]);

  // This function is used to handle change color
  const handleChangeColor = (value) => {
    form.setFieldsValue({
      color: value.toHexString(),
    });
  };

  // This function is used to search member by email
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
        const users = await GroupServices.searchMember(value);
        const options = users.map((user) => ({
          uid: user.uid,
          label: `${user.fullName} (${user.email})`,
        }));

        // Filter options that already in members or current user
        const filterOptions = options.filter((option) => {
          return option.uid !== user.uid && !members.find((memberUid) => memberUid === option.uid);
        });

        setMemberOptions(filterOptions);
      } catch (error) {
        message.error(error.message);
      } finally {
        setMemberOptionsLoading(false);
      }
    };

    debounce(searchMember, 500)();
  };

  // This function is used to add member to group
  const handleAddMember = async (uid) => {
    try {
      // add member to group
      await GroupServices.addMember(groupID, uid);
      await GroupServices.updateGroup(groupID, {
        members: [...members, uid],
      });
      message.success(t("addMemberSuccess"));

      // store member uid
      setMembers([...members, uid]);

      // reset member options and search text
      setMemberOptions([]);
      setSearchText("");
    } catch (error) {
      message.error(error.message);
    }
  };

  // This function is used to remove member from group
  const handleRemoveMember = async (uid) => {
    try {
      // remove member from group
      await GroupServices.removeMember(groupID, uid);
      await GroupServices.updateGroup(groupID, {
        members: members.filter((memeberUid) => memeberUid !== uid),
      });
      message.success(t("removeMemberSuccess"));

      // remove member uid from members
      const newMembers = members.filter((memeberUid) => memeberUid !== uid);
      setMembers(newMembers);
    } catch (error) {
      message.error(error.message);
    }
  };

  // This function is used to handle form submit
  const handleUpdateGroup = async (values) => {
    console.log(values);
    const { groupName, description, color } = values;

    try {
      await GroupServices.updateGroup(groupID, {
        groupName,
        description,
        color,
      });
      message.success(t("groupUpdateSuccess"));
      navigate("/group");
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <>
      <Helmet
        title={`${t("groupDetail")} | GST`}
        meta={[
          {
            name: "description",
            content: t("groupDetailDescription"),
          },
        ]}
      />

      <Row gutter={[24, 12]}>
        <Col span={24} md={12}>
          <Card
            title={t("groupDetail")}
            extra={
              <Link to="/group">
                <Button danger>{t("back")}</Button>
              </Link>
            }
          >
            <Form form={form} name="groupDetailForm" layout="vertical" autoComplete="off" onFinish={handleUpdateGroup} disabled={!isOwnerGroup}>
              <Form.Item
                label={t("groupName")}
                name="groupName"
                rules={[
                  {
                    required: true,
                    message: t("required", { field: t("groupName").toLowerCase() }),
                  },
                  {
                    max: 50,
                    message: t("maxLength", { field: t("groupName").toLowerCase(), length: 50 }),
                  },
                  {
                    whitespace: true,
                    message: t("emptyField", { field: t("groupName").toLowerCase() }),
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t("description")}
                name="description"
                rules={[
                  {
                    max: 200,
                    message: t("maxLength", { field: t("description").toLowerCase(), length: 200 }),
                  },
                  {
                    whitespace: true,
                    message: t("emptyField", { field: t("description").toLowerCase() }),
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t("groupColor")}
                name="color"
                rules={[
                  {
                    required: true,
                    message: t("selectColor"),
                  },
                ]}
              >
                <ColorPicker format="hex" showText onChangeComplete={handleChangeColor} />
              </Form.Item>

              <Form.Item label={t("createdAt")} name="createdAt">
                <Input disabled />
              </Form.Item>

              <Form.Item label={t("updatedAt")} name="updatedAt">
                <Input disabled />
              </Form.Item>

              <Form.Item>
                <Link to="/group">
                  <Button className="me-2" type="default">
                    {t("cancel")}
                  </Button>
                </Link>
                <Button type="primary" htmlType="submit">
                  {t("update")}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title={t("members")} className="mt-3">
            {isOwnerGroup && (
              <Input placeholder={t("enterMemberEmail")} allowClear value={searchText} onChange={handleSearchMember} />
            )}
            {searchText.length >= 3 && (
              <List
                bordered
                className="mt-1"
                dataSource={memberOptions}
                loading={memberOptionsLoading}
                locale={{ emptyText: <i>{t("noMatchingResults")}</i> }}
                renderItem={(memeberOption) => (
                  <List.Item style={{ cursor: "pointer" }} extra={<PersonAdd size={20} />} onClick={() => handleAddMember(memeberOption.uid)}>
                    <span>{memeberOption.label}</span>
                  </List.Item>
                )}
              />
            )}
            {members.length > 0 && (
              <List
                dataSource={memberInfos}
                renderItem={(memberInfo) => (
                  <List.Item
                    extra={
                      isOwnerGroup && (
                        <Button type="text" onClick={() => handleRemoveMember(memberInfo?.uid)}>
                          <PersonRemove size={20} />
                        </Button>
                      )
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar>{memberInfo?.fullName?.charAt(0).toUpperCase()}</Avatar>}
                      title={memberInfo?.fullName}
                      description={memberInfo?.email}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col span={24} md={12}>
          <img src={GroupDetailImage} alt={t("groupDetail")} className="img-fluid" />
        </Col>
      </Row>
    </>
  );
};

export default GroupDetail;
