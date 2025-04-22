import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import { Row, Col, Typography, message } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import TrackerFilter from "../components/pages/TrackerDetail/TrackerFilter";
import TrackerServices from "../services/TrackerServices";
import GroupServices from "../services/GroupServices";
import Transactions from "../components/pages/TrackerDetail/Transactions";
import SpendingInsightsButton from "../components/pages/TrackerDetail/SpendingInsightsButton";
import { BudgetSection, TodayExpenseCard, BudgetWarningSystem, BudgetModal } from "../components/pages/TrackerDetail/Budget";

const TrackerDetail = () => {
  const { t } = useTranslation();
  const { trackerID } = useParams();
  const [searchParams] = useSearchParams();

  // Basic tracker states
  const [trackerDetail, setTrackerDetail] = useState(null);
  const [groupDetail, setGroupDetail] = useState(null);

  // Categories and transactions
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Transaction sums
  const [todaySum, setTodaySum] = useState(0);
  const [thisMonthExpenseSum, setThisMonthExpenseSum] = useState(0);
  const [thisMonthIncomeSum, setThisMonthIncomeSum] = useState(0);
  const [categorySum, setCategorySum] = useState({});

  // Budget modal
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(null);

  const transactionPageSize = useMemo(() => 15, []);

  // filter from search params
  const filter = useMemo(() => {
    return {
      type: searchParams.get("type") || "all",
      sortBy: searchParams.get("sortBy") || "default",
      time: searchParams.get("time") ? dayjs(searchParams.get("time")) : dayjs(),
      categories: searchParams.get("categories") || "",
      dateRange: searchParams.get("dateRange") === "true",
      dateRangeStart: searchParams.get("dateRangeStart"),
      dateRangeEnd: searchParams.get("dateRangeEnd"),
    };
  }, [searchParams]);

  // Calculate remaining days in the month
  const remainingDays = useMemo(() => {
    const currentDate = dayjs();
    const endOfMonth = currentDate.endOf("month");
    return endOfMonth.diff(currentDate, "day");
  }, []);

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
        setGroupDetail(groupDetail);
        if (groupDetail.budget) {
          setBudgetAmount(groupDetail.budget);
        }
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
        setCategories([{ name: t('noCategory'), uid: "uncategorized" }, ...categories]);
      } catch (error) {
        message.error(error.message);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    getCategories();
  }, [trackerID, t]);

  // get transactions with date range support
  useEffect(() => {
    const getTransactions = async () => {
      setIsTransactionsLoading(true);

      try {
        let queryFilter;

        if (filter.dateRange && filter.dateRangeStart && filter.dateRangeEnd) {
          queryFilter = {
            ...filter,
            timeType: "custom",
            timeRange: {
              startDate: dayjs(filter.dateRangeStart),
              endDate: dayjs(filter.dateRangeEnd),
            },
          };
        } else {
          queryFilter = { ...filter };
        }

        const transactions = await TrackerServices.getTransactions(trackerID, queryFilter);
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
        const newFilter = { time: dayjs(), timeType: "day", type: "expense" };
        const todaySum = await TrackerServices.getTransactionsSum(trackerID, newFilter);
        setTodaySum(todaySum);
      } catch (error) {
        message.error(error.message);
      }
    };

    getTodaySum();
  }, [trackerID]);

  // get this month expense sum with date range support
  useEffect(() => {
    const getThisMonthSum = async () => {
      try {
        let newFilter;

        if (filter.dateRange && filter.dateRangeStart && filter.dateRangeEnd) {
          newFilter = {
            timeType: "custom",
            type: "expense",
            timeRange: {
              startDate: dayjs(filter.dateRangeStart),
              endDate: dayjs(filter.dateRangeEnd),
            },
          };
        } else {
          newFilter = { time: filter.time, timeType: "month", type: "expense" };
        }

        const thisMonthSum = await TrackerServices.getTransactionsSum(trackerID, newFilter);
        setThisMonthExpenseSum(thisMonthSum);
      } catch (error) {
        message.error(error.message);
      }
    };

    getThisMonthSum();
  }, [filter.time, filter.dateRange, filter.dateRangeStart, filter.dateRangeEnd, trackerID]);

  // get this month income sum with date range support
  useEffect(() => {
    const getThisMonthSum = async () => {
      try {
        let newFilter;

        if (filter.dateRange && filter.dateRangeStart && filter.dateRangeEnd) {
          newFilter = {
            timeType: "custom",
            type: "income",
            timeRange: {
              startDate: dayjs(filter.dateRangeStart),
              endDate: dayjs(filter.dateRangeEnd),
            },
          };
        } else {
          newFilter = { time: filter.time, timeType: "month", type: "income" };
        }

        const thisMonthSum = await TrackerServices.getTransactionsSum(trackerID, newFilter);
        setThisMonthIncomeSum(thisMonthSum);
      } catch (error) {
        message.error(error.message);
      }
    };

    getThisMonthSum();
  }, [filter.time, filter.dateRange, filter.dateRangeStart, filter.dateRangeEnd, trackerID]);

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
          let expenseFilter, incomeFilter;

          if (filter.dateRange && filter.dateRangeStart && filter.dateRangeEnd) {
            expenseFilter = {
              timeType: "custom",
              type: "expense",
              category,
              timeRange: {
                startDate: dayjs(filter.dateRangeStart),
                endDate: dayjs(filter.dateRangeEnd),
              },
            };
            incomeFilter = {
              timeType: "custom",
              type: "income",
              category,
              timeRange: {
                startDate: dayjs(filter.dateRangeStart),
                endDate: dayjs(filter.dateRangeEnd),
              },
            };
          } else {
            expenseFilter = { time: filter.time, timeType: "month", type: "expense", category };
            incomeFilter = { time: filter.time, timeType: "month", type: "income", category };
          }

          categorySumPromises.push(TrackerServices.getTransactionsSum(trackerID, expenseFilter));
          categorySumPromises.push(TrackerServices.getTransactionsSum(trackerID, incomeFilter));
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
  }, [filter.categories, filter.time, filter.dateRange, filter.dateRangeStart, filter.dateRangeEnd, trackerID]);

  // Show budget modal
  const showBudgetModal = () => {
    setIsBudgetModalVisible(true);
    if (groupDetail?.budget) {
      setBudgetAmount(groupDetail.budget);
    }
  };

  // Handle budget save success
  const handleBudgetSaveSuccess = (newBudget) => {
    setGroupDetail({ ...groupDetail, budget: newBudget });
    setIsBudgetModalVisible(false);
  };

  return (
    <>
      <Helmet
        title={`${t('expenseStats')} | GST`}
        meta={[
          {
            name: "description",
            content: t('expenseStats'),
          },
        ]}
      />

      {/* Budget warning component that handles displaying warnings */}
      <BudgetWarningSystem groupDetail={groupDetail} thisMonthExpenseSum={thisMonthExpenseSum} remainingDays={remainingDays} />

      <Row gutter={[24, 12]}>
        <Col span={24}>
          <Typography.Title level={2}>{trackerDetail?.groupName}</Typography.Title>

          {/* Spending insights button and modal */}
          <SpendingInsightsButton trackerID={trackerID} categories={categories} />

          {/* Budget section component */}
          <BudgetSection groupDetail={groupDetail} onBudgetClick={showBudgetModal} />

          {/* Today's expense summary */}
          <TodayExpenseCard todaySum={todaySum} />

          <TrackerFilter
            filter={filter}
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
            thisMonthExpenseSum={thisMonthExpenseSum}
            thisMonthIncomeSum={thisMonthIncomeSum}
            categorySum={categorySum}
          />
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

      {/* Budget Modal Component */}
      <BudgetModal
        visible={isBudgetModalVisible}
        initialBudget={budgetAmount}
        trackerID={trackerID}
        groupDetail={groupDetail}
        onCancel={() => setIsBudgetModalVisible(false)}
        onSuccess={handleBudgetSaveSuccess}
      />
    </>
  );
};

export default TrackerDetail;
