import PropTypes from "prop-types";
import { useNavigate, useParams, createSearchParams, Link } from "react-router-dom";
import { Select, Space, Checkbox, DatePicker, Card, Button, Alert, Radio, Divider, Typography, Row, Col } from "antd";
import vi_VN from "../../../locale/vi_VN";
import dayjs from "../../../configs/dayjs";
import { useState } from "react";
import { convertCurrency } from "../../../utils/numberUtils";

const { RangePicker } = DatePicker;

const TrackerFilter = ({ filter, categories, isCategoriesLoading, thisMonthExpenseSum, thisMonthIncomeSum, categorySum }) => {
  const { trackerID } = useParams();
  const navigate = useNavigate();
  const [dateFilterType, setDateFilterType] = useState(filter.dateRange ? "range" : filter.timeType === "week" ? "week" : "month");

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
      dateRangeStart: start.format("YYYY-MM-DD"),
      dateRangeEnd: end.format("YYYY-MM-DD"),
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
      delete newFilter.timeType;
      newFilter.time = dayjs().format("YYYY-MM-DD");

      navigate({
        search: createSearchParams(newFilter).toString(),
      });
    } else if (type === "week") {
      const newFilter = { ...filter };
      delete newFilter.dateRange;
      delete newFilter.dateRangeStart;
      delete newFilter.dateRangeEnd;
      delete newFilter.timeType;
      newFilter.time = dayjs().format("YYYY-MM-DD");
      newFilter.timeType = "week";

      navigate({
        search: createSearchParams(newFilter).toString(),
      });
    }
  };

  // Generate category sum alerts
  const renderCategorySum = Object.keys(categorySum).map((category) => {
    const categoryDetail = categories.find((cat) => cat.uid === category);
    const categoryName = categoryDetail?.name || "Không có danh mục";

    let timeDisplay;
    if (filter.dateRange && filter.dateRangeStart && filter.dateRangeEnd) {
      const start = dayjs(filter.dateRangeStart).format("DD/MM/YYYY");
      const end = dayjs(filter.dateRangeEnd).format("DD/MM/YYYY");
      timeDisplay = `${start} - ${end}`;
    } else if (filter.timeType === "week") {
      const weekStart = dayjs(filter.time).startOf("week").format("DD/MM/YYYY");
      const weekEnd = dayjs(filter.time).endOf("week").format("DD/MM/YYYY");
      timeDisplay = `${weekStart} - ${weekEnd}`;
    } else {
      timeDisplay = dayjs(filter.time).format("MM/YYYY");
    }

    const incomeMessage = categorySum[category].income ? (
      <>
        Tổng thu nhập:{" "}
        <Typography.Text strong className="text-success">
          {convertCurrency(categorySum[category].income)}
        </Typography.Text>
      </>
    ) : (
      ""
    );
    const dashIcon = categorySum[category].income && categorySum[category].expense ? " - " : "";
    const noTransactionMessage = !categorySum[category].income && !categorySum[category].expense ? "Không tìm thấy giao dịch" : "";
    const expenseMessage = categorySum[category].expense ? (
      <>
        Tổng chi tiêu:{" "}
        <Typography.Text strong className="text-danger">
          {convertCurrency(categorySum[category].expense)}
        </Typography.Text>
      </>
    ) : (
      ""
    );

    return (
      <Alert
        key={category}
        type="info"
        className="mt-3 rounded-xl"
        showIcon
        message={
          <Typography.Text>
            Thống kê cho &quot;<Typography.Text strong>{categoryName}</Typography.Text>&quot; {filter.dateRange ? "trong khoảng" : filter.timeType === "week" ? "trong tuần" : "trong tháng"}{" "}
            {timeDisplay}: {incomeMessage} {dashIcon} {noTransactionMessage} {expenseMessage}
          </Typography.Text>
        }
      />
    );
  });

  // Get date range values from filter
  const dateRangeValue = filter.dateRangeStart && filter.dateRangeEnd ? [dayjs(filter.dateRangeStart), dayjs(filter.dateRangeEnd)] : null;

  return (
    <>
      <Card
        title={
          <Typography.Title level={5} style={{ margin: 0 }}>
            Lọc và Sắp xếp
          </Typography.Title>
        }
        className="shadow-hover rounded-2xl"
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <Space size="middle" wrap style={{ marginBottom: 16 }}>
              <Select
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "income", label: "Thu nhập" },
                  { value: "expense", label: "Chi tiêu" },
                ]}
                value={filter.type}
                onChange={(value) => handleFilterChange(value, "type")}
                style={{ width: 120 }}
                className="rounded-xl"
              />

              <Select
                options={[
                  { value: "default", label: "Sắp xếp mặc định", disabled: true },
                  { value: "date", label: "Ngày" },
                  { value: "amount", label: "Số tiền" },
                ]}
                value={filter.sortBy}
                onChange={(value) => handleFilterChange(value, "sortBy")}
                style={{ width: 120 }}
                className="rounded-xl"
              />
            </Space>
          </Col>

          <Col xs={24}>
            <Divider orientation="left">
              <Typography.Text strong>Khoảng thời gian</Typography.Text>
            </Divider>

            <div style={{ marginBottom: 16 }}>
              <Radio.Group value={dateFilterType} onChange={handleDateFilterTypeChange} buttonStyle="solid" className="date-filter-tabs">
                <Radio.Button value="month" className="rounded-l-xl">
                  Theo tháng
                </Radio.Button>
                <Radio.Button value="week">
                  Theo tuần
                </Radio.Button>
                <Radio.Button value="range" className="rounded-r-xl">
                  Khoảng tùy chọn
                </Radio.Button>
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
                style={{ width: "100%", maxWidth: "300px" }}
                className="rounded-xl"
              />
            ) : dateFilterType === "week" ? (
              <DatePicker
                picker="week"
                format="YYYY-[W]WW"
                value={filter.time ? dayjs(filter.time) : dayjs()}
                onChange={(value) => {
                  const newFilter = { ...filter, time: value, timeType: "week" };
                  delete newFilter.dateRange;
                  delete newFilter.dateRangeStart;
                  delete newFilter.dateRangeEnd;
                  navigate({
                    search: createSearchParams(newFilter).toString(),
                  });
                }}
                disabledDate={(current) => current && current > dayjs()}
                locale={vi_VN.DataPicker}
                allowClear={false}
                style={{ width: "100%", maxWidth: "300px" }}
                className="rounded-xl"
              />
            ) : (
              <RangePicker
                format="DD/MM/YYYY"
                value={dateRangeValue}
                onChange={handleDateRangeChange}
                disabledDate={(current) => current && current > dayjs()}
                locale={vi_VN.DataPicker}
                style={{ width: "100%", maxWidth: "350px" }}
                className="rounded-xl"
              />
            )}
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {thisMonthIncomeSum ? (
            <Col xs={24} md={12}>
              <Alert
                type="success"
                showIcon
                className="rounded-xl"
                message={
                  <Typography.Text>
                    Tổng thu nhập {filter.dateRange ? "trong khoảng" : filter.timeType === "week" ? "trong tuần" : "trong tháng"}
                    <Typography.Text strong>
                      {filter.dateRange
                        ? `${dayjs(filter.dateRangeStart).format("DD/MM/YYYY")} - ${dayjs(filter.dateRangeEnd).format("DD/MM/YYYY")}`
                        : filter.timeType === "week"
                        ? `${dayjs(filter.time).startOf("week").format("DD/MM/YYYY")} - ${dayjs(filter.time).endOf("week").format("DD/MM/YYYY")}`
                        : dayjs(filter.time).format("MM/YYYY")}
                    </Typography.Text>
                    :{" "}
                    <Typography.Text strong className="text-success">
                      {convertCurrency(thisMonthIncomeSum)}
                    </Typography.Text>
                  </Typography.Text>
                }
              />
            </Col>
          ) : null}

          {thisMonthExpenseSum ? (
            <Col xs={24} md={12}>
              <Alert
                type="error"
                showIcon
                className="rounded-xl"
                message={
                  <Typography.Text>
                    Tổng chi tiêu {filter.dateRange ? "trong khoảng" : filter.timeType === "week" ? "trong tuần" : "trong tháng"}
                    <Typography.Text strong>
                      {filter.dateRange
                        ? `${dayjs(filter.dateRangeStart).format("DD/MM/YYYY")} - ${dayjs(filter.dateRangeEnd).format("DD/MM/YYYY")}`
                        : filter.timeType === "week"
                        ? `${dayjs(filter.time).startOf("week").format("DD/MM/YYYY")} - ${dayjs(filter.time).endOf("week").format("DD/MM/YYYY")}`
                        : dayjs(filter.time).format("MM/YYYY")}
                    </Typography.Text>
                    :{" "}
                    <Typography.Text strong className="text-danger">
                      {convertCurrency(thisMonthExpenseSum)}
                    </Typography.Text>
                  </Typography.Text>
                }
              />
            </Col>
          ) : null}
        </Row>
      </Card>

      <Card
        title={
          <Link to={`/tracker/detail/${trackerID}/category/list`} className="text-dark text-decoration-none">
            <Typography.Title level={5} style={{ margin: 0 }}>
              Danh mục
              <Typography.Text type="secondary" style={{ fontSize: "14px", fontWeight: "normal", marginLeft: "8px" }}>
                (nhấp vào để xem danh sách)
              </Typography.Text>
            </Typography.Title>
          </Link>
        }
        extra={
          <Link to={`/tracker/detail/${trackerID}/category/create`}>
            <Button type="primary" icon={<span className="me-1">+</span>}>
              Tạo danh mục
            </Button>
          </Link>
        }
        loading={isCategoriesLoading}
        className="shadow-hover rounded-2xl"
      >
        <div className="category-checkboxes">
          <Checkbox.Group
            options={categories.map((category) => ({
              label: category?.name,
              value: category?.uid,
              style: {
                borderRadius: "20px",
                padding: "4px 12px",
                margin: "0 8px 8px 0",
                border: "1px solid #e2e8f0",
                backgroundColor: category?.color ? `${category?.color}20` : undefined,
              },
            }))}
            value={filter.categories ? filter.categories.split(",") : []}
            onChange={(value) => handleFilterChange(value.toString(), "categories")}
          />
        </div>

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
