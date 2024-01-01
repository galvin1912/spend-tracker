import { useState, useMemo } from "react";
import { Col, Row, Statistic, DatePicker } from "antd";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import { convertCurrency, convertShorterCurrency } from "../../../utils/numberUtils";
import dayjs from "dayjs";
import vi_VN from "../../../locale/vi_VN";

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

const GroupsAnalytics = ({ tracker }) => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const chartData = useMemo(
    () => ({
      labels: [dayjs(selectedMonth).format("MM/YYYY")],
      datasets: tracker?.groups?.map((group) => ({
        label: group?.groupName,
        data: [-Math.floor(Math.random() * 1000000)],
        backgroundColor: group?.color,
      })),
    }),
    [selectedMonth, tracker?.groups]
  );

  return (
    <>
      <DatePicker
        picker="month"
        className="mb-4"
        style={{ width: "100%" }}
        format={"MM/YYYY"}
        value={selectedMonth}
        onChange={(value) => setSelectedMonth(value)}
        disabledDate={(current) => current && current > dayjs()}
        locale={vi_VN.DataPicker}
      />
      <Bar data={chartData} options={chartOptions} />
      <Row gutter={[24, 24]} className="mt-4">
        <Col span={24} md={12}>
          <Statistic title="Tổng thu nhập" value={convertCurrency(123456789)} valueStyle={{ color: "#3f8600" }} />
        </Col>
        <Col span={24} md={12}>
          <Statistic title="Tổng chi tiêu" value={convertCurrency(123456789)} valueStyle={{ color: "#cf1322" }} />
        </Col>
        <Col span={24} md={12}>
          <Statistic title="Tổng tiền hiện có" value={convertCurrency(123456789)} />
        </Col>
      </Row>
    </>
  );
};

GroupsAnalytics.propTypes = {
  tracker: PropTypes.object.isRequired,
};

export default GroupsAnalytics;
