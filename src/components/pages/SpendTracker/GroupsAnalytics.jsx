import { Col, Row, Statistic, DatePicker } from "antd";
import { Bar } from "react-chartjs-2";
import {
  convertCurrency,
  convertShorterCurrency,
} from "../../../utils/numberUtils";
import vi_VN from "antd/locale/vi_VN";

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Thống kê chi tiêu",
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.dataset.label || "";
          const value = context.parsed.y || 0;
          return `${label}: ${convertCurrency(value)}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return value !== 0 ? convertShorterCurrency(value) : 0;
        },
      },
    },
  },
};

const mockChartData = {
  labels: ["Tháng 12 2023"],
  datasets: [
    {
      label: "Group 1",
      data: [12980291],
      backgroundColor: "#1890ff",
    },
    {
      label: "Group 2",
      data: [52919774],
      backgroundColor: "#2fc25b",
    },
    {
      label: "Group 3",
      data: [1762888],
      backgroundColor: "#facc14",
    },
    {
      label: "Group 4",
      data: [92919774],
      backgroundColor: "#13c2c2",
    },
    {
      label: "Group 5",
      data: [1298086],
      backgroundColor: "#eb2f96",
    },
    {
      label: "Group 6",
      data: [32512141],
      backgroundColor: "#722ed1",
    },
  ],
};

const GroupsAnalytics = () => {
  return (
    <>
      <DatePicker
        picker="month"
        className="mb-4"
        style={{ width: "100%" }}
        format={"MM/YYYY"}
        disabledDate={(current) => current && current > new Date()}
        locale={{
          ...vi_VN.DatePicker,
          lang: {
            ...vi_VN.DatePicker.lang,
            monthPlaceholder: "Chọn tháng để xem thống kê",
            shortMonths: [
              "Th.1",
              "Th.2",
              "Th.3",
              "Th.4",
              "Th.5",
              "Th.6",
              "Th.7",
              "Th.8",
              "Th.9",
              "Th.10",
              "Th.11",
              "Th.12",
            ]
          },
        }}
      />
      <Bar data={mockChartData} options={chartOptions} />
      <Row gutter={[24, 24]} className="mt-4">
        <Col span={24} md={12}>
          <Statistic
            title="Tổng thu nhập"
            value={convertCurrency(123456789)}
            valueStyle={{ color: "#3f8600" }}
          />
        </Col>
        <Col span={24} md={12}>
          <Statistic
            title="Tổng chi tiêu"
            value={convertCurrency(123456789)}
            valueStyle={{ color: "#cf1322" }}
          />
        </Col>
        <Col span={24} md={12}>
          <Statistic
            title="Tổng tiền hiện có"
            value={convertCurrency(123456789)}
          />
        </Col>
      </Row>
    </>
  );
};

export default GroupsAnalytics;
