import PropTypes from "prop-types";
import { useNavigate, useParams, createSearchParams, Link } from "react-router-dom";
import { Select, Space, Checkbox, DatePicker, Card, Button, Alert } from "antd";
import vi_VN from "../../../locale/vi_VN";
import dayjs from "dayjs";
import { convertCurrency } from "../../../utils/numberUtils";

const TrackerFilter = ({ filter, categories, isCategoriesLoading, thisMonthExpenseSum, thisMonthIncomeSum, categorySum }) => {
  const { trackerID } = useParams();

  const navigate = useNavigate();

  const handleFilterChange = (value, key) => {
    const newFilter = { ...filter, [key]: value };

    navigate({
      search: createSearchParams(newFilter).toString(),
    });
  };

  const renderCategorySum = Object.keys(categorySum).map((category) => {
    const categoryDetail = categories.find((categoryItem) => categoryItem.uid === category);

    const categoryName = categoryDetail?.name || "Không có danh mục";
    const time = dayjs(filter.time).format("MM/YYYY");

    return (
      <Alert
        key={category}
        type="info"
        className="mt-3"
        message={
          <span>
            Thống kê &quot;{categoryName}&quot; trong tháng {time}: Tổng thu nhập:{" "}
            <strong className="text-success">{convertCurrency(categorySum[category].income)}</strong> - Tổng chi tiêu:{" "}
            <strong className="text-danger">{convertCurrency(categorySum[category].expense)}</strong>
          </span>
        }
      />
    );
  });

  return (
    <>
      <Card title="Bộ lọc chung">
        <Space size="middle" wrap>
          <Select
            options={[
              { value: "all", label: "Tất cả" },
              { value: "income", label: "Thu nhập" },
              { value: "expense", label: "Chi tiêu" },
            ]}
            value={filter.type}
            onChange={(value) => handleFilterChange(value, "type")}
            style={{ width: 100 }}
          />

          <Select
            options={[
              { value: "default", label: "Mặc định", disabled: true },
              { value: "date", label: "Ngày" },
              { value: "amount", label: "Số tiền" },
            ]}
            value={filter.sortBy}
            onChange={(value) => handleFilterChange(value, "sortBy")}
          />

          <DatePicker
            picker="month"
            format="MM/YYYY"
            value={filter.time}
            onChange={(value) => handleFilterChange(value, "time")}
            disabledDate={(current) => current && current > dayjs()}
            locale={vi_VN.DataPicker}
            allowClear={false}
          />
        </Space>

        <Alert
          type="success"
          showIcon
          className="mt-3"
          message={
            <span>
              Tổng thu nhập trong tháng {dayjs(filter.time).format("MM/YYYY")}:{" "}
              <strong className="text-success">{convertCurrency(thisMonthIncomeSum)}</strong>
            </span>
          }
        />

        <Alert
          type="error"
          showIcon
          className="mt-3"
          message={
            <span>
              Tổng chi tiêu trong tháng {dayjs(filter.time).format("MM/YYYY")}:{" "}
              <strong className="text-danger">{convertCurrency(thisMonthExpenseSum)}</strong>
            </span>
          }
        />
      </Card>

      <Card
        style={{ marginTop: 12 }}
        title={
          <Link to={`/tracker/detail/${trackerID}/category/list`} className="text-dark text-decoration-none">
            Danh mục (nhấp vào để xem danh sách)
          </Link>
        }
        extra={
          <Link to={`/tracker/detail/${trackerID}/category/create`}>
            <Button type="primary">Tạo danh mục</Button>
          </Link>
        }
        loading={isCategoriesLoading}
      >
        <Checkbox.Group
          options={categories.map((category) => ({
            label: category?.name,
            value: category?.uid,
          }))}
          value={filter.categories.split(",")}
          onChange={(value) => handleFilterChange(value.toString(), "categories")}
        />

        {categorySum && renderCategorySum}
      </Card>
    </>
  );
};

TrackerFilter.propTypes = {
  filter: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  isCategoriesLoading: PropTypes.bool.isRequired,
  thisMonthExpenseSum: PropTypes.number.isRequired,
  thisMonthIncomeSum: PropTypes.number.isRequired,
  categorySum: PropTypes.object.isRequired,
};

export default TrackerFilter;
