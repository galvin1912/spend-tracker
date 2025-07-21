import PropTypes from "prop-types";
import { memo, useEffect, useState, useCallback } from "react";
import { Card, Typography } from "antd";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title } from "chart.js";
import TrackerServices from "../../../services/TrackerServices";
import dayjs from "../../../configs/dayjs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title);

const SpendingInsights = ({ trackerID, categories = [] }) => {
  const { t } = useTranslation();
  const [trendData, setTrendData] = useState({ labels: [], data: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], data: [] });
  const [monthCompareData, setMonthCompareData] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!trackerID) return;

    setLoading(true);
    try {
      // 1. Expense trends by month (last 6 months)
      const now = dayjs();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = now.subtract(i, "month");
        months.push({
          label: d.format("MMM YY"),
          start: d.startOf("month"),
          end: d.endOf("month"),
        });
      }
      const trendLabels = months.map((m) => m.label);
      const trendDataArr = await Promise.all(
        months.map(async (m) => {
          const sum = await TrackerServices.getTransactionsSum(trackerID, {
            time: {
              startOf: () => m.start,
              endOf: () => m.end,
            },
            timeType: "month",
            type: "expense",
          });
          return Math.abs(sum || 0);
        })
      );
      setTrendData({ labels: trendLabels, data: trendDataArr });

      // 2. Category analysis (this month)
      const catLabels = categories.map((cat) => cat.name);
      const catDataArr = await Promise.all(
        categories.map(async (cat) => {
          const sum = await TrackerServices.getTransactionsSum(trackerID, {
            time: now,
            timeType: "month",
            type: "expense",
            category: cat.uid,
          });
          return Math.abs(sum || 0);
        })
      );
      setCategoryData({ labels: catLabels, data: catDataArr });

      // 3. Monthly comparison (last 6 months)
      setMonthCompareData({ labels: trendLabels, data: trendDataArr });
    } catch (error) {
      console.error("Error fetching spending insights:", error);
    } finally {
      setLoading(false);
    }
  }, [trackerID, categories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter out categories with 0 sum for chart clarity
  const filteredCatLabels = categoryData.labels.filter((_, i) => categoryData.data[i] > 0);
  const filteredCatData = categoryData.data.filter((val) => val > 0);

  return (
    <div style={{ marginTop: 32 }}>
      <Typography.Title level={3}>{t("spendingAnalysisReport")}</Typography.Title>

      <Card style={{ marginBottom: 24 }} loading={loading}>
        <Typography.Title level={5}>{t("monthlySpendingTrend")}</Typography.Title>
        <Line
          data={{
            labels: trendData.labels,
            datasets: [
              {
                label: t("expense"),
                data: trendData.data,
                fill: false,
                borderColor: "#007bff",
                backgroundColor: "#007bff",
              },
            ],
          }}
        />
      </Card>

      <Card style={{ marginBottom: 24 }} loading={loading}>
        <Typography.Title level={5}>{t("categoryAnalysisThisMonth")}</Typography.Title>
        <Doughnut
          data={{
            labels: filteredCatLabels,
            datasets: [
              {
                data: filteredCatData,
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF"],
              },
            ],
          }}
        />
      </Card>

      <Card loading={loading}>
        <Typography.Title level={5}>{t("monthlyComparison")}</Typography.Title>
        <Bar
          data={{
            labels: monthCompareData.labels,
            datasets: [
              {
                label: t("expense"),
                data: monthCompareData.data,
                backgroundColor: ["#28a745", "#007bff", "#ffc107", "#dc3545", "#6c757d", "#ff9800"],
              },
            ],
          }}
        />
      </Card>
    </div>
  );
};

SpendingInsights.propTypes = {
  trackerID: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
};

const MemoizedSpendingInsights = memo(SpendingInsights);
export default MemoizedSpendingInsights;
