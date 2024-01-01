import { Link, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  DatePicker,
  Card,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import TransactionBg from "../assets/transaction-bg.jpg";

const TrackerTransactionCreate = () => {
  const { trackerID } = useParams();

  const [form] = Form.useForm();

  return (
    <Row gutter={[24, 12]}>
      <Col span={24} md={12}>
        <Card
          title="Thêm giao dịch"
          extra={
            <Link to={`/tracker/detail/${trackerID}`}>
              <Button danger>Quay lại</Button>
            </Link>
          }
        >
          <Form
            name="transactionCreateForm"
            form={form}
            autoComplete="off"
            layout="vertical"
            onFinish={() => {}}
            initialValues={{
              time: dayjs(),
              name: "",
              description: "",
              amount: "",
              type: "",
              category: "",
            }}
          >
            <Form.Item
              label="Thời gian"
              name="time"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian",
                },
              ]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={24} md={12}>
        <img src={TransactionBg} alt="Transaction" className="img-fluid" />
      </Col>
    </Row>
  );
};

export default TrackerTransactionCreate;
