import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Row, Col, Card } from "antd";
import { createWallet } from "../features/wallet/walletActions";
import GroupImage from "../assets/89z_2203_w009_n001_120b_p14_120.jpg";

const WalletCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const isCreatingWallet = useSelector((state) => state.wallet.isCreatingWallet);

  const onFinish = async (values) => {
    try {
      await dispatch(createWallet(values));
      navigate("/wallet");
    } catch (error) {
      // Error already handled in action
    }
  };

  return (
    <>
      <Helmet
        title="Tạo ví | GST"
        meta={[
          {
            name: "description",
            content: "Tạo ví mới.",
          },
        ]}
      />

      <Row gutter={[24, 12]}>
        <Col span={24} md={12}>
          <Card
            title="Tạo ví"
            extra={
              <Link to="/wallet">
                <Button danger>Quay lại</Button>
              </Link>
            }
          >
            <Form
              name="walletCreateForm"
              form={form}
              initialValues={{
                walletName: "",
                description: "",
              }}
              layout="vertical"
              autoComplete="off"
              onFinish={onFinish}
            >
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
                <Input placeholder="Nhập tên ví" />
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

              <Form.Item>
                <Link to="/wallet">
                  <Button className="me-2" type="default" disabled={isCreatingWallet}>
                    Hủy
                  </Button>
                </Link>
                <Button type="primary" htmlType="submit" loading={isCreatingWallet}>
                  Tạo ví
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={24} md={12}>
          <img src={GroupImage} alt="Ví" className="img-fluid" />
        </Col>
      </Row>
    </>
  );
};

export default WalletCreate;
