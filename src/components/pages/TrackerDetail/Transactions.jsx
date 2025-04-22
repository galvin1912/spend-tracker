import { useMemo } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { Card, Button, Table, Tag, List, Descriptions, Badge, Typography } from "antd";
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
        render: (time) => {
          const date = dayjs(time.toDate());
          return (
            <div>
              <Typography.Text strong>{date.format("DD/MM/YYYY")}</Typography.Text>
              <div><Typography.Text type="secondary" style={{ fontSize: '12px' }}>{date.format("HH:mm")}</Typography.Text></div>
            </div>
          );
        },
      },
      {
        title: "Tên giao dịch",
        dataIndex: "name",
        key: "name",
        width: 250,
        render: (name) => <Typography.Text strong>{name}</Typography.Text>,
      },
      {
        title: "Số tiền",
        dataIndex: "amount",
        key: "amount",
        render: (amount, transaction) => (
          <Typography.Text
            strong
            className={transaction?.type === "income" ? "text-success" : "text-danger"}
            style={{ fontSize: '15px' }}
          >
            {transaction?.type === "income" ? "+" : ""}
            {convertCurrency(amount)}
          </Typography.Text>
        ),
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        width: 300,
        render: (description) => description || <Typography.Text type="secondary" italic>Chưa có mô tả</Typography.Text>,
      },
      {
        title: "Danh mục",
        dataIndex: "category",
        key: "category",
        render: (category) => {
          const categoryDetail = categories.find((categoryItem) => categoryItem.uid === category);
          if (!categoryDetail) return <Tag className="rounded-xl">Không có danh mục</Tag>;
          return (
            <Tag
              color={categoryDetail?.color}
              className="rounded-xl py-1 px-3"
              style={{ fontWeight: 500 }}
            >
              {categoryDetail?.name}
            </Tag>
          );
        },
      },
      {
        title: "Loại",
        dataIndex: "type",
        key: "type",
        render: (type) => (
          <Badge
            status={type === "income" ? "success" : "error"}
            text={
              <Typography.Text strong type={type === "income" ? "success" : "danger"}>
                {type === "income" ? "Thu nhập" : "Chi tiêu"}
              </Typography.Text>
            }
          />
        ),
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
        render: (updatedAt) => (updatedAt ? dayjs(updatedAt.toDate()).format("DD/MM/YYYY") : "--"),
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
            <Button type="primary" size="small" className="rounded-xl">Xem chi tiết</Button>
          </Link>
        ),
      },
    ],
    [categories, trackerID]
  );

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>Danh sách giao dịch</span>
          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
            ({transactions.length} giao dịch)
          </span>
        </div>
      }
      extra={
        <Link to={`/tracker/detail/${trackerID}/transaction/create`}>
          <Button type="primary" icon={<span className="me-1">+</span>}>
            Thêm giao dịch
          </Button>
        </Link>
      }
      className="shadow-hover rounded-2xl"
      style={{ overflow: 'hidden' }}
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
            hideOnSinglePage: transactions.length <= transactionPageSize,
            className: 'rounded-xl pagination-modern',
          }}
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
          className="transactions-table"
        />
      ) : (
        <List
          loading={isTransactionsLoading}
          dataSource={transactions}
          rowKey={(transaction) => transaction?.uid}
          locale={{ emptyText: "Không tìm thấy giao dịch" }}
          pagination={{
            pageSize: transactionPageSize,
            hideOnSinglePage: transactions.length <= transactionPageSize,
            className: 'rounded-xl pagination-modern',
          }}
          size="small"
          renderItem={(transaction, index) => {
            const categoryDetail = categories.find((categoryItem) => categoryItem.uid === transaction?.category);

            return (
              <List.Item 
                style={{ borderRadius: '12px', overflow: 'hidden' }} 
                className={`transaction-item shadow-hover ${index !== 0 ? "mt-3" : ""}`}
              >
                <Descriptions
                  column={1}
                  size="small"
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>
                        {dayjs(transaction?.time.toDate()).format("DD/MM/YYYY")}
                      </Typography.Text>
                      <Tag 
                        color={transaction?.type === "income" ? "green" : "red"}
                        className="rounded-xl"
                      >
                        {transaction?.type === "income" ? "Thu nhập" : "Chi tiêu"}
                      </Tag>
                    </div>
                  }
                  extra={
                    <Link to={`/tracker/detail/${trackerID}/transaction/detail/${transaction?.uid}`}>
                      <Button type="primary" size="small" className="rounded-xl">Chi tiết</Button>
                    </Link>
                  }
                  items={[
                    {
                      key: "name",
                      label: "Tên giao dịch",
                      children: <Typography.Text strong>{transaction?.name}</Typography.Text>,
                    },
                    {
                      key: "amount",
                      label: "Số tiền",
                      children: (
                        <Typography.Text
                          strong
                          className={transaction?.type === "income" ? "text-success" : "text-danger"}
                          style={{ fontSize: '16px' }}
                        >
                          {transaction?.type === "income" ? "+" : ""}
                          {convertCurrency(transaction?.amount)}
                        </Typography.Text>
                      ),
                    },
                    {
                      key: "category",
                      label: "Danh mục",
                      children: categoryDetail ? (
                        <Tag 
                          color={categoryDetail?.color} 
                          className="rounded-xl py-1 px-3"
                          style={{ fontWeight: 500 }}
                        >
                          {categoryDetail?.name}
                        </Tag>
                      ) : (
                        <Tag className="rounded-xl">Không có danh mục</Tag>
                      ),
                    },
                    {
                      key: "description",
                      label: "Mô tả",
                      children: transaction?.description || <Typography.Text type="secondary" italic>Chưa có mô tả</Typography.Text>,
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
