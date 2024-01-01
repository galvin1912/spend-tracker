import { useMemo } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { Card, Button, Table, Tag, List, Descriptions } from "antd";
import dayjs from "dayjs";
import useMediaQuery from "../../../hooks/useMediaQuery";
import { convertCurrency } from "../../../utils/numberUtils";

const Transactions = ({ transactions, isTransactionsLoading, categories, transactionPageSize }) => {
  const { trackerID } = useParams();

  const isNotMobile = useMediaQuery("(min-width: 768px)");

  const columns = useMemo(
    () => [
      {
        title: "Ngày",
        width: 150,
        dataIndex: "time",
        key: "time",
        render: (time) => dayjs(time.toDate()).format("DD/MM/YYYY"),
      },
      {
        title: "Tên giao dịch",
        dataIndex: "name",
        key: "name",
        width: 250,
        render: (name) => name,
      },
      {
        title: "Số tiền",
        dataIndex: "amount",
        key: "amount",
        render: (amount, transaction) => (
          <span className={transaction?.type === "income" ? "text-success" : "text-danger"}>
            {transaction?.type === "income" ? "+" : ""}
            {convertCurrency(amount)}
          </span>
        ),
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        width: 300,
        render: (description) => description || "...",
      },
      {
        title: "Danh mục",
        dataIndex: "category",
        key: "category",
        render: (category) => {
          const categoryDetail = categories.find((categoryItem) => categoryItem.uid === category);
          if (!categoryDetail) return <Tag>Không có danh mục</Tag>;
          return <Tag color={categoryDetail?.color}>{categoryDetail?.name}</Tag>;
        },
      },
      {
        title: "Loại",
        dataIndex: "type",
        key: "type",
        render: (type) => <Tag color={type === "income" ? "green" : "red"}>{type === "income" ? "Thu nhập" : "Chi tiêu"}</Tag>,
      },
      {
        title: "Tạo lúc",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (createdAt) => dayjs(createdAt.toDate()).format("DD/MM/YYYY"),
      },
      {
        title: "Cập nhật lúc",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 150,
        render: (updatedAt) => (updatedAt ? dayjs(updatedAt.toDate()).format("DD/MM/YYYY") : "..."),
      },
      {
        title: "Hành động",
        dataIndex: "action",
        key: "action",
        width: 150,
        align: "center",
        fixed: "right",
        render: (_, transaction) => (
          <Link to={`/tracker/detail/${trackerID}/transaction/detail/${transaction?.uid}`}>
            <Button>Xem chi tiết</Button>
          </Link>
        ),
      },
    ],
    [categories, trackerID]
  );

  return (
    <Card
      title="Danh sách giao dịch"
      extra={
        <Link to={`/tracker/detail/${trackerID}/transaction/create`}>
          <Button type="primary">Thêm giao dịch</Button>
        </Link>
      }
    >
      {isNotMobile ? (
        <Table
          loading={isTransactionsLoading}
          columns={columns}
          dataSource={transactions}
          rowKey={(transaction) => transaction?.uid}
          scroll={{ x: 2000 }}
          locale={{ emptyText: "Không tìm thấy giao dịch" }}
          pagination={{
            pageSize: transactionPageSize,
          }}
        />
      ) : (
        <List
          loading={isTransactionsLoading}
          dataSource={transactions}
          rowKey={(transaction) => transaction?.uid}
          locale={{ emptyText: "Không tìm thấy giao dịch" }}
          pagination={{
            pageSize: transactionPageSize,
          }}
          size="small"
          renderItem={(transaction, index) => {
            const categoryDetail = categories.find((categoryItem) => categoryItem.uid === transaction?.category);

            return (
              <List.Item style={{ backgroundColor: "rgba(0,0,0,0.03)" }} className={index !== 0 ? "mt-3" : ""}>
                <Descriptions
                  column={1}
                  size="small"
                  title={dayjs(transaction?.time.toDate()).format("DD/MM/YYYY")}
                  extra={
                    <Link to={`/tracker/detail/${trackerID}/transaction/detail/${transaction?.uid}`}>
                      <Button size="small">Xem chi tiết</Button>
                    </Link>
                  }
                  items={[
                    {
                      key: "name",
                      label: "Tên giao dịch",
                      children: transaction?.name,
                    },
                    {
                      key: "amount",
                      label: "Số tiền",
                      children: (
                        <span className={transaction?.type === "income" ? "text-success" : "text-danger"}>
                          {transaction?.type === "income" ? "+" : ""}
                          {convertCurrency(transaction?.amount)}
                        </span>
                      ),
                    },
                    {
                      key: "category",
                      label: "Danh mục",
                      children: categoryDetail ? <Tag color={categoryDetail?.color}>{categoryDetail?.name}</Tag> : <Tag>Không có danh mục</Tag>,
                    },
                    {
                      key: "type",
                      label: "Loại",
                      children: (
                        <Tag color={transaction?.type === "income" ? "green" : "red"}>{transaction?.type === "income" ? "Thu nhập" : "Chi tiêu"}</Tag>
                      ),
                    },
                    {
                      key: "description",
                      label: "Mô tả",
                      children: transaction?.description || "...",
                    },
                  ]}
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

Transactions.propTypes = {
  transactions: PropTypes.array.isRequired,
  isTransactionsLoading: PropTypes.bool.isRequired,
  transactionPageSize: PropTypes.number.isRequired,
  categories: PropTypes.array.isRequired,
};

export default Transactions;
