import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Form, Input, ColorPicker, Button, Row, Col, Card, Select } from "antd";
import { createGroup } from "../features/group/groupActions";
import { getOwnerWallets } from "../features/wallet/walletActions";
import GroupImage from "../assets/89z_2203_w009_n001_120b_p14_120.jpg";
import { translateError } from "../utils/errorTranslator";
import messageUtil from "../utils/messageUtil";

const GroupCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const isCreatingGroup = useSelector((state) => state.group.isCreatingGroup);
  const wallets = useSelector((state) => state.wallet.ownerWallets);
  const [walletsLoading, setWalletsLoading] = useState(false);

  useEffect(() => {
    const loadWallets = async () => {
      setWalletsLoading(true);
      try {
        await dispatch(getOwnerWallets());
      } catch (error) {
        messageUtil.error(translateError(error) || "Không thể tải danh sách ví");
      } finally {
        setWalletsLoading(false);
      }
    };
    loadWallets();
  }, [dispatch]);

  const handleChangeColor = (value) => {
    form.setFieldsValue({
      color: value.toHexString(),
    });
  };

  const onFinish = (values) => {
    dispatch(createGroup(values)).then(() => navigate("/group"));
  };

  return (
    <>
      <Helmet
        title="Tạo nhóm | GST"
        meta={[
          {
            name: "description",
            content: "Tạo nhóm mới.",
          },
        ]}
      />

      <Row gutter={[24, 12]}>
        <Col span={24} md={12}>
          <Card
            title="Tạo nhóm"
            extra={
              <Link to="/group">
                <Button danger>Quay lại</Button>
              </Link>
            }
          >
            <Form
              name="groupCreateForm"
              form={form}
              initialValues={{
                groupName: "",
                description: "",
                color: "#1677FF",
              }}
              layout="vertical"
              autoComplete="off"
              onFinish={onFinish}
            >
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
                <Input placeholder="Nhập tên nhóm" />
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  {
                    max: 500,
                    message: "Mô tả không được vượt quá 500 ký tự!",
                  },
                ]}
              >
                <Input.TextArea placeholder="Nhập mô tả" />
              </Form.Item>

              <Form.Item
                label="Ví"
                name="walletID"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ví!",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn ví"
                  loading={walletsLoading}
                  disabled={walletsLoading || wallets.length === 0}
                >
                  {wallets.map((wallet) => (
                    <Select.Option key={wallet.uid} value={wallet.uid}>
                      {wallet.walletName}
                    </Select.Option>
                  ))}
                </Select>
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

              <Form.Item>
                <Link to="/group">
                  <Button className="me-2" type="default" disabled={isCreatingGroup}>
                    Hủy
                  </Button>
                </Link>
                <Button type="primary" htmlType="submit" loading={isCreatingGroup}>
                  Tạo nhóm
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={24} md={12}>
          <img src={GroupImage} alt="Nhóm" className="img-fluid" />
        </Col>
      </Row>
    </>
  );
};

export default GroupCreate;
