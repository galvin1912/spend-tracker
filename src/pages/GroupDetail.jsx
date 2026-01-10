import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Form, Input, ColorPicker, Button, Card } from "antd";
import dayjs from "../configs/dayjs";
import GroupServices from "../services/GroupServices";
import GroupDetailImage from "../assets/4380.jpg";
import { translateError } from "../utils/errorTranslator";
import messageUtil from "../utils/messageUtil";

const GroupDetail = () => {
  
  // This is used to get groupID from URL
  const { groupID } = useParams();

  // This is used to navigate to other page
  const navigate = useNavigate();

  // This is used to create form instance
  const [form] = Form.useForm();

  // This is used to get user from redux store
  const { user } = useSelector((state) => state.user);


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
        messageUtil.error(translateError(error));
      }
    };

    getGroupDetail();
  }, [form, groupID]);

  // This function is used to handle change color
  const handleChangeColor = (value) => {
    form.setFieldsValue({
      color: value.toHexString(),
    });
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
      messageUtil.success("Cập nhật nhóm thành công");
      navigate("/group");
    } catch (error) {
      messageUtil.error(translateError(error));
    }
  };

  return (
    <div className="page-container">
      <Helmet
        title="Chi tiết nhóm | GST"
        meta={[
          {
            name: "description",
            content: "Xem và quản lý chi tiết nhóm.",
          },
        ]}
      />

      <div className="page-header">
        <h1 className="page-title">Chi tiết nhóm</h1>
        <div className="page-actions">
          <Link to="/group">
            <Button danger>Quay lại</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 grid-cols-md-2">
        <div>
          <Card
            title="Thông tin nhóm"
            className="page-card"
            style={{ marginBottom: '1.5rem' }}
          >
            <Form form={form} name="groupDetailForm" layout="vertical" autoComplete="off" onFinish={handleUpdateGroup} disabled={!isOwnerGroup}>
              <Form.Item
                label="Tên nhóm"
                name="groupName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên nhóm!",
                  },
                  {
                    max: 50,
                    message: "Tên nhóm không được vượt quá 50 ký tự!",
                  },
                  {
                    whitespace: true,
                    message: "Tên nhóm không được để trống",
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
                  {
                    whitespace: true,
                    message: "Mô tả không được để trống",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Màu sắc (hiển thị trên biểu đồ)"
                name="color"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn màu sắc!",
                  },
                ]}
              >
                <ColorPicker format="hex" showText onChangeComplete={handleChangeColor} />
              </Form.Item>

              <Form.Item label="Tạo lúc" name="createdAt">
                <Input disabled />
              </Form.Item>

              <Form.Item label="Cập nhật lúc" name="updatedAt">
                <Input disabled />
              </Form.Item>

              <Form.Item>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to="/group">
                    <Button type="default">
                      Hủy
                    </Button>
                  </Link>
                  <Button type="primary" htmlType="submit">
                    Cập nhật
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>

        <div>
          <Card className="page-card" style={{ position: 'sticky', top: '80px' }}>
            <img 
              src={GroupDetailImage} 
              alt="Chi tiết nhóm" 
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
