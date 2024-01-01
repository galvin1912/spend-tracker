import PropTypes from "prop-types";
import {
  useNavigate,
  useParams,
  createSearchParams,
  Link,
} from "react-router-dom";
import { Select, Space, Checkbox, DatePicker, Card, Button } from "antd";
import vi_VN from "../../../locale/vi_VN";
import dayjs from "dayjs";

const TrackerFilter = ({ filter, categories, isCategoriesLoading }) => {
  const { trackerID } = useParams();

  const navigate = useNavigate();

  const handleFilterChange = (value, key) => {
    const newFilter = { ...filter, [key]: value };

    navigate({
      search: createSearchParams(newFilter).toString(),
    });
  };

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
          />

          <Checkbox
            checked={filter.showChart}
            onChange={(e) => handleFilterChange(e.target.checked, "showChart")}
            disabled
          >
            Hiển thị biểu đồ
          </Checkbox>
        </Space>
      </Card>

      <Card
        style={{ marginTop: 12 }}
        title={
          <Link
            to={`/tracker/detail/${trackerID}/category/list`}
            className="text-dark text-decoration-none"
          >
            Danh mục (nhấn để xem danh sách)
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
          options={[
            { label: "Không có danh mục", value: "uncategorized" },
            ...categories.map((category) => ({
              label: category?.name,
              value: category?.uid,
            })),
          ]}
          value={filter.categories.split(",")}
          onChange={(value) =>
            handleFilterChange(value.toString(), "categories")
          }
        />
      </Card>
    </>
  );
};

TrackerFilter.propTypes = {
  filter: PropTypes.object,
  categories: PropTypes.array,
  isCategoriesLoading: PropTypes.bool,
};

export default TrackerFilter;
