import { useState, useMemo, useEffect } from "react";
import { Col, Row, Statistic, DatePicker, message } from "antd";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import { convertCurrency, convertShorterCurrency } from "../../../utils/numberUtils";
import dayjs from "../../../configs/dayjs";
import vi_VN from "../../../locale/vi_VN";
import TrackerServices from "../../../services/TrackerServices";
import { translateError } from "../../../utils/errorTranslator";

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
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
  const [isStatisticLoading, setIsStatisticLoading] = useState(false);
  const [thisMonthTotalIncome, setThisMonthTotalIncome] = useState(0);
  const [thisMonthTotalExpense, setThisMonthTotalExpense] = useState(0);
  const [incomeDatasets, setIncomeDatasets] = useState([]);
  const [expenseDatasets, setExpenseDatasets] = useState([]);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const expenseChartData = useMemo(
    () => ({
      labels: [dayjs(selectedMonth).format("MM/YYYY")],
      datasets: expenseDatasets,
    }),
    [selectedMonth, expenseDatasets]
  );

  const incomeChartData = useMemo(
    () => ({
      labels: [dayjs(selectedMonth).format("MM/YYYY")],
      datasets: incomeDatasets,
    }),
    [selectedMonth, incomeDatasets]
  );

  // get statistic
  useEffect(() => {
    if (!tracker?.groups?.length) return;

    const getStatistic = async () => {
      setIsStatisticLoading(true);

      try {
        // get statistic
        const statisticPromises = [];

        tracker?.groups?.forEach((group) => {
          const expenseFilter = { time: selectedMonth, timeType: "month", type: "expense" };
          const incomeFilter = { time: selectedMonth, timeType: "month", type: "income" };
          statisticPromises.push(TrackerServices.getTransactionsSum(group?.uid, expenseFilter));
          statisticPromises.push(TrackerServices.getTransactionsSum(group?.uid, incomeFilter));
        });

        const statistics = await Promise.all(statisticPromises);

        // calculate total income and expense
        let totalIncome = 0;
        let totalExpense = 0;

        // statistics: [expense, income, expense, income, ...]
        statistics.forEach((statistic, index) => {
          if (index % 2 === 0) {
            totalExpense += statistic;
          }
          if (index % 2 === 1) {
            totalIncome += statistic;
          }
        });

        setThisMonthTotalIncome(totalIncome);
        setThisMonthTotalExpense(totalExpense);

        // calculate balance of this month for each group
        const expenseDatasets = [];
        const incomeDatasets = [];

        // statistics: [expense, income, expense, income, ...]
        tracker?.groups?.forEach((group, index) => {
          expenseDatasets.push({
            label: group?.groupName,
            data: [statistics[index * 2]],
            backgroundColor: group?.color,
          });
          incomeDatasets.push({
            label: group?.groupName,
            data: [statistics[index * 2 + 1]],
            backgroundColor: group?.color,
          });
        });

        setExpenseDatasets(expenseDatasets);
        setIncomeDatasets(incomeDatasets);
      } catch (error) {
        message.error(translateError(error));
      } finally {
        setIsStatisticLoading(false);
      }
    };

    getStatistic();
  }, [selectedMonth, tracker]);

  // get balance
  useEffect(() => {
    if (!tracker?.groups?.length) return;

    const getBalance = async () => {
      setIsBalanceLoading(true);

      try {
        // get balance
        const balancePromises = [];

        tracker?.groups?.forEach((group) => {
          const allFilter = { type: "all" };
          balancePromises.push(TrackerServices.getTransactionsSum(group?.uid, allFilter));
        });

        const balances = await Promise.all(balancePromises);

        // calculate balance of this month for each group
        let totalBalance = 0;

        balances.forEach((balance) => {
          totalBalance += balance;
        });

        setBalance(totalBalance);
      } catch (error) {
        message.error(translateError(error));
      } finally {
        setIsBalanceLoading(false);
      }
    };

    getBalance();
  }, [tracker]);

  return (
    <>
      <DatePicker
        allowClear={false}
        picker="month"
        className="mb-4"
        style={{ width: "100%" }}
        format={"MM/YYYY"}
        value={selectedMonth}
        onChange={(value) => setSelectedMonth(value)}
        disabledDate={(current) => current && current > dayjs()}
        locale={vi_VN.DataPicker}
      />
      <Bar
        data={expenseChartData}
        options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Thống kê chi tiêu' } } }}
      />
      <Bar
        data={incomeChartData}
        options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Thống kê thu nhập' } } }}
      />
      <Row gutter={[24, 24]} className="mt-4">
        <Col span={24} md={12}>
          <Statistic
            title={`Tổng thu nhập (${dayjs(selectedMonth).format("MM/YYYY")})`}
            value={convertCurrency(thisMonthTotalIncome)}
            valueStyle={{ color: "#3f8600" }}
            loading={isStatisticLoading}
          />
        </Col>
        <Col span={24} md={12}>
          <Statistic
            title={`Tổng chi tiêu (${dayjs(selectedMonth).format("MM/YYYY")})`}
            value={convertCurrency(thisMonthTotalExpense)}
            valueStyle={{ color: "#cf1322" }}
            loading={isStatisticLoading}
          />
        </Col>
        <Col span={24} md={12}>
          <Statistic
            title="Tổng số dư còn lại"
            value={convertCurrency(balance)}
            valueStyle={{ color: "rgba(0,0,0,0.88)" }}
            loading={isBalanceLoading}
          />
        </Col>
      </Row>
    </>
  );
};

GroupsAnalytics.propTypes = {
  tracker: PropTypes.object.isRequired,
};

export default GroupsAnalytics;
