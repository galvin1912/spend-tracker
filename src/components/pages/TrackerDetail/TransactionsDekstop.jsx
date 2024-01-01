import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Button, Table } from "antd";
import dayjs from "dayjs";
import { render } from "react-dom";

const columns = [
  {
    title: "Ngày",
    width: 150,
    dataIndex: "date",
    key: "date",
    render: (date) => dayjs(date).format("DD/MM/YYYY"),
  },
  {
    title: "Tên giao dịch",
    dataIndex: "name",
    key: "name",
    width: 300,
    render: (name) => name,
  },
];

const Transactions = () => {
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

export default Transactions;
