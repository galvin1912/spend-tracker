import PropTypes from "prop-types";
import { useNavigate, useParams, createSearchParams, Link } from "react-router-dom";
import { Select, Space, Checkbox, DatePicker, Card, Button, Alert, Radio, Divider } from "antd";
import vi_VN from "../../../locale/vi_VN";
import dayjs from "dayjs";
import { useState } from "react";
import { convertCurrency } from "../../../utils/numberUtils";

const { RangePicker } = DatePicker;

const TrackerFilter = ({ filter, categories, isCategoriesLoading, thisMonthExpenseSum, thisMonthIncomeSum, categorySum }) => {
  const { trackerID } = useParams();
  const navigate = useNavigate();
  const [dateFilterType, setDateFilterType] = useState(filter.dateRange ? "range" : "month");

  const handleFilterChange = (value, key) => {
    const newFilter = { ...filter, [key]: value };

    // If using date range, remove the month filter and vice versa
    if (key === "dateRange") {
      delete newFilter.time;
    } else if (key === "time") {
      delete newFilter.dateRange;
      delete newFilter.dateRangeStart;
      delete newFilter.dateRangeEnd;
    }

    navigate({
      search: createSearchParams(newFilter).toString(),
    });
  };

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length !== 2) {
      return;
    }
    const [start, end] = dates;
    
    const newFilter = {
      ...filter,
      dateRange: true,
      dateRangeStart: start.format('YYYY-MM-DD'),
      dateRangeEnd: end.format('YYYY-MM-DD')
    };
    
    // Remove single month filter when using date range
    delete newFilter.time;
    
    navigate({
      search: createSearchParams(newFilter).toString(),
    });
  };

  const handleDateFilterTypeChange = (e) => {
    const type = e.target.value;
    setDateFilterType(type);
    
    // Clear the opposite filter type when switching
    if (type === "month") {
      const newFilter = { ...filter };
      delete newFilter.dateRange;
      delete newFilter.dateRangeStart;
      delete newFilter.dateRangeEnd;
      
      // Set default month if not already set
      if (!newFilter.time) {
        newFilter.time = dayjs().format('YYYY-MM-DD');
      }
      
      navigate({
        search: createSearchParams(newFilter).toString(),
      });
    } else {
      // If switching to range but no range is set yet, don't clear the month filter
      if (!filter.dateRangeStart) {
        return;
      }
      
      const newFilter = { ...filter };
      delete newFilter.time;
      
      navigate({
        search: createSearchParams(newFilter).toString(),
      });
    }
  };

  const renderCategorySum = Object.keys(categorySum).map((category) => {
    const categoryDetail = categories.find((categoryItem) => categoryItem.uid === category);
    const categoryName = categoryDetail?.name || "Không có danh mục";
    
    // Display date format based on filter type
    let timeDisplay;
    if (filter.dateRange) {
      const start = dayjs(filter.dateRangeStart).format("DD/MM/YYYY");
      const end = dayjs(filter.dateRangeEnd).format("DD/MM/YYYY");
      timeDisplay = `${start} - ${end}`;
    } else {
      timeDisplay = dayjs(filter.time).format("MM/YYYY");
    }
    
    const incomeMessage = categorySum[category].income ? (
      <>
        Tổng thu nhập: <strong className="text-success">{convertCurrency(categorySum[category].income)}</strong>
      </>
    ) : (
      ""
    );
    const dashIcon = categorySum[category].income && categorySum[category].expense ? " - " : "";
    const noTransactionMessage = !categorySum[category].income && !categorySum[category].expense ? "Không có giao dịch" : "";
    const expenseMessage = categorySum[category].expense ? (
      <>
        Tổng chi tiêu: <strong className="text-danger">{convertCurrency(categorySum[category].expense)}</strong>
      </>
    ) : (
      ""
    );

    return (
      <Alert
        key={category}
        type="info"
        className="mt-3"
        message={
          <span>
            Thống kê &quot;{categoryName}&quot; trong {filter.dateRange ? "khoảng" : "tháng"} {timeDisplay}: {incomeMessage} {dashIcon} {noTransactionMessage} {expenseMessage}
          </span>
        }
      />
    );
  });

  // Get date range values from filter
  const dateRangeValue = filter.dateRangeStart && filter.dateRangeEnd 
    ? [dayjs(filter.dateRangeStart), dayjs(filter.dateRangeEnd)] 
    : null;

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
        </Space>

        <Divider orientation="left">Khoảng thời gian</Divider>
        
        <div style={{ marginBottom: 16 }}>
          <Radio.Group value={dateFilterType} onChange={handleDateFilterTypeChange}>
            <Radio.Button value="month">Theo tháng</Radio.Button>
            <Radio.Button value="range">Khoảng tùy chọn</Radio.Button>
          </Radio.Group>
        </div>

        {dateFilterType === "month" ? (
          <DatePicker
            picker="month"
            format="MM/YYYY"
            value={filter.time ? dayjs(filter.time) : dayjs()}
            onChange={(value) => handleFilterChange(value, "time")}
            disabledDate={(current) => current && current > dayjs()}
            locale={vi_VN.DataPicker}
            allowClear={false}
            style={{ width: '100%', maxWidth: '300px' }}
          />
        ) : (
          <RangePicker
            format="DD/MM/YYYY"
            value={dateRangeValue}
            onChange={handleDateRangeChange}
            disabledDate={(current) => current && current > dayjs()}
            locale={vi_VN.DataPicker}
            style={{ width: '100%', maxWidth: '350px' }}
          />
        )}

        {thisMonthIncomeSum ? (
          <Alert
            type="success"
            showIcon
            className="mt-3"
            message={
              <span>
                Tổng thu nhập {filter.dateRange ? 'trong khoảng ' : 'trong tháng '}
                {filter.dateRange
                  ? `${dayjs(filter.dateRangeStart).format("DD/MM/YYYY")} - ${dayjs(filter.dateRangeEnd).format("DD/MM/YYYY")}`
                  : dayjs(filter.time).format("MM/YYYY")
                }: <strong className="text-success">{convertCurrency(thisMonthIncomeSum)}</strong>
              </span>
            }
          />
        ) : (
          ""
        )}

        {thisMonthExpenseSum ? (
          <Alert
            type="error"
            showIcon
            className="mt-3"
            message={
              <span>
                Tổng chi tiêu {filter.dateRange ? 'trong khoảng ' : 'trong tháng '}
                {filter.dateRange
                  ? `${dayjs(filter.dateRangeStart).format("DD/MM/YYYY")} - ${dayjs(filter.dateRangeEnd).format("DD/MM/YYYY")}`
                  : dayjs(filter.time).format("MM/YYYY")
                }: <strong className="text-danger">{convertCurrency(thisMonthExpenseSum)}</strong>
              </span>
            }
          />
        ) : (
          ""
        )}
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
