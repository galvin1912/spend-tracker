import { Link, useParams } from "react-router-dom";
import { Card, Button } from "antd";

const TransactionsMobile = () => {
  const { trackerID } = useParams();

  return (
    <Card
      title="Danh sách giao dịch"
      extra={
        <Link to={`/tracker/detail/${trackerID}/transaction/create`}>
          <Button type="primary">Thêm giao dịch</Button>
        </Link>
      }
    ></Card>
  );
};

export default TransactionsMobile;
