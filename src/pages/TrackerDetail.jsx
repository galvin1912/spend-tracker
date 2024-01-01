import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import { Row, Col, Typography, message } from "antd";
import dayjs from "dayjs";
import TrackerFilter from "../components/pages/TrackerDetail/TrackerFilter";
import TrackerChart from "../components/pages/TrackerDetail/TrackerChart";
import { convertCurrency } from "../utils/numberUtils";
import TrackerServices from "../services/TrackerServices";
import GroupServices from "../services/GroupServices";
import Transactions from "../components/pages/TrackerDetail/Transactions";

const TrackerDetail = () => {
  const { trackerID } = useParams();

  const [searchParams] = useSearchParams();

  const [trackerDetail, setTrackerDetail] = useState(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [todaySum, setTodaySum] = useState(0);
  const [thisMonthExpenseSum, setThisMonthExpenseSum] = useState(0);
  const [thisMonthIncomeSum, setThisMonthIncomeSum] = useState(0);
  const [categorySum, setCategorySum] = useState({});
  
  const transactionPageSize = useMemo(() => 15, []);

  // filter from search params
  const filter = useMemo(() => {
    return {
      type: searchParams.get("type") || "all",
      sortBy: searchParams.get("sortBy") || "default",
      time: searchParams.get("time") ? dayjs(searchParams.get("time")) : dayjs(),
      showChart: searchParams.get("showChart") === "true",
      categories: searchParams.get("categories") || "",
    };
  }, [searchParams]);

  /** Effect **/
  // get tracker detail
  useEffect(() => {
    const getTrackerDetail = async () => {
      try {
        const groupDetail = await GroupServices.getDetail(trackerID);
        const trackerDetail = await TrackerServices.getDetail(trackerID);
        setTrackerDetail({
          ...trackerDetail,
          groupName: groupDetail.groupName,
        });
      } catch (error) {
        message.error(error.message);
      }
    };

    getTrackerDetail();
  }, [trackerID]);

  // get categories
  useEffect(() => {
    const getCategories = async () => {
      setIsCategoriesLoading(true);

      try {
        const categories = await TrackerServices.getCategories(trackerID);
        setCategories(categories);
      } catch (error) {
        message.error(error.message);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    getCategories();
  }, [trackerID]);

  // get transactions
  useEffect(() => {
    const getTransactions = async () => {
      setIsTransactionsLoading(true);

      try {
        const transactions = await TrackerServices.getTransactions(trackerID, filter);
        setTransactions(transactions);
      } catch (error) {
        message.error(error.message);
      } finally {
        setIsTransactionsLoading(false);
      }
    };

    getTransactions();
  }, [trackerID, filter]);

  // get today sum
  useEffect(() => {
    const getTodaySum = async () => {
      try {
        const todaySum = await TrackerServices.getTransactionsTodayExpenseSum(trackerID);
        setTodaySum(todaySum);
      } catch (error) {
        message.error(error.message);
      }
    };

    getTodaySum();
  }, [trackerID]);

  // get this month expense sum
  useEffect(() => {
    const getThisMonthSum = async () => {
      try {
        const newFilter = { time: filter.time, type: "expense" };
        const thisMonthSum = await TrackerServices.getTransactionsMonthSum(trackerID, newFilter);
        setThisMonthExpenseSum(thisMonthSum);
      } catch (error) {
        message.error(error.message);
      }
    };

    getThisMonthSum();
  }, [filter.time, trackerID]);

  // get this month income sum
  useEffect(() => {
    const getThisMonthSum = async () => {
      try {
        const newFilter = { time: filter.time, type: "income" };
        const thisMonthSum = await TrackerServices.getTransactionsMonthSum(trackerID, newFilter);
        setThisMonthIncomeSum(thisMonthSum);
      } catch (error) {
        message.error(error.message);
      }
    };

    getThisMonthSum();
  }, [filter, trackerID]);

  // get this month income and expense sum when categories change
  useEffect(() => {
    if (!filter.categories) {
      setCategorySum({});
      return;
    }

    const getThisMonthSum = async () => {
      try {
        const categorySumPromises = [];
        const categories = filter.categories.split(",");
        categories.forEach((category) => {
          const expenseFilter = { time: filter.time, type: "expense", category };
          const incomeFilter = { time: filter.time, type: "income", category };
          categorySumPromises.push(TrackerServices.getTransactionsMonthSum(trackerID, expenseFilter));
          categorySumPromises.push(TrackerServices.getTransactionsMonthSum(trackerID, incomeFilter));
        });

        const categorySum = await Promise.all(categorySumPromises);

        const categorySumObject = {};
        categories.forEach((category, index) => {
          categorySumObject[category] = {
            expense: categorySum[index * 2],
            income: categorySum[index * 2 + 1],
          };
        });

        setCategorySum(categorySumObject);
      } catch (error) {
        message.error(error.message);
      }
    };

    getThisMonthSum();
  }, [filter.categories, filter.time, trackerID]);

  return (
    <>
      <Helmet
        title="Thống kê chi tiêu | GST"
        meta={[
          {
            name: "description",
            content: "Thống kê chi tiêu",
          },
        ]}
      />

      <Row gutter={[24, 12]}>
        <Col span={24}>
          <Typography.Title level={2}>{trackerDetail?.groupName}</Typography.Title>
          <p className="lead">
            <mark>
              Hôm nay đã chi tiêu <strong className="text-danger">{convertCurrency(todaySum)}</strong>
            </mark>
          </p>
          <TrackerFilter
            filter={filter}
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
            thisMonthExpenseSum={thisMonthExpenseSum}
            thisMonthIncomeSum={thisMonthIncomeSum}
            categorySum={categorySum}
          />
          {filter.showChart && <TrackerChart />}
        </Col>

        <Col span={24}>
          <Transactions
            categories={categories}
            transactionPageSize={transactionPageSize}
            transactions={transactions}
            isTransactionsLoading={isTransactionsLoading}
          />
        </Col>
      </Row>
    </>
  );
};

export default TrackerDetail;
