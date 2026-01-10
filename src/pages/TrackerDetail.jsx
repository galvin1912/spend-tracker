import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import { Row, Col, Typography, message } from "antd";
import dayjs from "../configs/dayjs";
import TrackerFilter from "../components/pages/TrackerDetail/TrackerFilter";
import TrackerServices from "../services/TrackerServices";
import GroupServices from "../services/GroupServices";
import Transactions from "../components/pages/TrackerDetail/Transactions";
import SpendingInsightsButton from "../components/pages/TrackerDetail/SpendingInsightsButton";
import { BudgetSection, TodayExpenseCard, BudgetWarningSystem, BudgetModal, BudgetReport } from "../components/pages/TrackerDetail/Budget";
import { translateError } from "../utils/errorTranslator";

const TrackerDetail = () => {
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
      timeType: searchParams.get("timeType") || "month",
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

  // Check if the filter month is the current month
  const isCurrentMonth = useMemo(() => {
    const currentDate = dayjs();
    const filterDate = filter.time;
    return filterDate.month() === currentDate.month() && filterDate.year() === currentDate.year();
  }, [filter.time]);

  // Check if using date range
  const isUsingDateRange = useMemo(() => {
    return filter.dateRange && filter.dateRangeStart && filter.dateRangeEnd;
  }, [filter.dateRange, filter.dateRangeStart, filter.dateRangeEnd]);



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
        message.error(translateError(error));
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
        setCategories([{ name: "Không có danh mục", uid: "uncategorized" }, ...categories]);
      } catch (error) {
        message.error(translateError(error));
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    getCategories();
  }, [trackerID]);

  // get transactions with date range and week support
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
        } else if (filter.timeType === "week") {
          queryFilter = {
            ...filter,
            timeType: "week",
          };
        } else {
          queryFilter = { ...filter };
        }

        const transactions = await TrackerServices.getTransactions(trackerID, queryFilter);
        setTransactions(transactions);
      } catch (error) {
        message.error(translateError(error));
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
        message.error(translateError(error));
      }
    };

    getTodaySum();
  }, [trackerID]);

  // get this month expense sum with date range and week support
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
        } else if (filter.timeType === "week") {
          newFilter = { time: filter.time, timeType: "week", type: "expense" };
        } else {
          newFilter = { time: filter.time, timeType: "month", type: "expense" };
        }

        const thisMonthSum = await TrackerServices.getTransactionsSum(trackerID, newFilter);
        setThisMonthExpenseSum(thisMonthSum);
      } catch (error) {
        message.error(translateError(error));
      }
    };

    getThisMonthSum();
  }, [filter.time, filter.timeType, filter.dateRange, filter.dateRangeStart, filter.dateRangeEnd, trackerID]);

  // get this month income sum with date range and week support
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
        } else if (filter.timeType === "week") {
          newFilter = { time: filter.time, timeType: "week", type: "income" };
        } else {
          newFilter = { time: filter.time, timeType: "month", type: "income" };
        }

        const thisMonthSum = await TrackerServices.getTransactionsSum(trackerID, newFilter);
        setThisMonthIncomeSum(thisMonthSum);
      } catch (error) {
        message.error(translateError(error));
      }
    };

    getThisMonthSum();
  }, [filter.time, filter.timeType, filter.dateRange, filter.dateRangeStart, filter.dateRangeEnd, trackerID]);

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
          } else if (filter.timeType === "week") {
            expenseFilter = { time: filter.time, timeType: "week", type: "expense", category };
            incomeFilter = { time: filter.time, timeType: "week", type: "income", category };
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
        message.error(translateError(error));
      }
    };

    getThisMonthSum();
  }, [filter.categories, filter.time, filter.timeType, filter.dateRange, filter.dateRangeStart, filter.dateRangeEnd, trackerID]);

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
        title="Thống kê chi tiêu | GST"
        meta={[
          {
            name: "description",
            content: "Thống kê chi tiêu",
          },
        ]}
      />

      {/* Show budget warning only for current month, not for date ranges */}
      {isCurrentMonth && !isUsingDateRange && groupDetail?.budget && (
        <BudgetWarningSystem
          isCurrentMonth={isCurrentMonth}
          isUsingDateRange={isUsingDateRange}
          groupDetail={groupDetail}
          thisMonthExpenseSum={thisMonthExpenseSum}
          remainingDays={remainingDays}
        />
      )}

      <Row gutter={[24, 12]}>
        <Col span={24}>
          <Typography.Title level={2}>{trackerDetail?.groupName}</Typography.Title>

          {/* Spending insights button and modal */}
          <SpendingInsightsButton trackerID={trackerID} categories={categories} />

          {/* Budget section component */}
          <BudgetSection groupDetail={groupDetail} onBudgetClick={showBudgetModal} />

          {/* Show budget report for previous months */}
          {!isCurrentMonth && groupDetail?.budget && (
            <BudgetReport
              groupDetail={groupDetail}
              thisMonthExpenseSum={thisMonthExpenseSum}
              thisMonthIncomeSum={thisMonthIncomeSum}
              selectedMonth={filter.time}
              isDateRange={isUsingDateRange}
              dateRangeStart={filter.dateRangeStart ? dayjs(filter.dateRangeStart) : null}
              dateRangeEnd={filter.dateRangeEnd ? dayjs(filter.dateRangeEnd) : null}
              isWeekFilter={filter.timeType === "week"}
            />
          )}

          {/* Today's expense summary - only show for current month */}
          {isCurrentMonth && !isUsingDateRange && <TodayExpenseCard todaySum={todaySum} />}

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
