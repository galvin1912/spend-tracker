import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import { Row, Col, Typography, message, Button, Modal, InputNumber } from "antd";
import dayjs from "dayjs";
import TrackerFilter from "../components/pages/TrackerDetail/TrackerFilter";
import SpendingInsights from '../components/pages/TrackerDetail/SpendingInsights';
import BudgetTimeline from '../components/pages/TrackerDetail/BudgetTimeline/BudgetTimeline';
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
  
  // Budget related states
  const [groupDetail, setGroupDetail] = useState(null);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(null);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
  const [isInsightsModalVisible, setIsInsightsModalVisible] = useState(false);

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
  
  // Create a date range object for the BudgetTimeline component
  const dateRangeForBudget = useMemo(() => {
    if (filter.dateRange && filter.dateRangeStart && filter.dateRangeEnd) {
      return {
        startDate: dayjs(filter.dateRangeStart),
        endDate: dayjs(filter.dateRangeEnd)
      };
    }
    return null;
  }, [filter.dateRange, filter.dateRangeStart, filter.dateRangeEnd]);
  
  // Calculate remaining days in the month
  const remainingDays = useMemo(() => {
    const currentDate = dayjs();
    const endOfMonth = currentDate.endOf('month');
    return endOfMonth.diff(currentDate, 'day');
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

    // Reset warning shown flag when component mounts
    setWarningShown(false);
    
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
        message.error(error.message);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    getCategories();
  }, [trackerID]);

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
              endDate: dayjs(filter.dateRangeEnd)
            }
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
              endDate: dayjs(filter.dateRangeEnd)
            }
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
              endDate: dayjs(filter.dateRangeEnd)
            }
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
                endDate: dayjs(filter.dateRangeEnd)
              }
            };
            incomeFilter = { 
              timeType: "custom", 
              type: "income", 
              category,
              timeRange: {
                startDate: dayjs(filter.dateRangeStart),
                endDate: dayjs(filter.dateRangeEnd)
              }
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

  // Budget warning system
  useEffect(() => {
    // Check if budget exists and warning hasn't been shown yet
    if (groupDetail?.budget && thisMonthExpenseSum < 0 && !warningShown) {
      const budgetUsedPercentage = Math.abs(thisMonthExpenseSum) / groupDetail.budget * 100;
      
      if (budgetUsedPercentage >= 80) {
        // Red warning (80% or more of the budget)
        Modal.warning({
          title: 'Cảnh báo ngân sách',
          content: (
            <div style={{ color: 'red' }}>
              Còn {remainingDays} ngày nữa mới hết tháng mà đã chi hết {convertCurrency(Math.abs(thisMonthExpenseSum))}/{convertCurrency(groupDetail.budget)}
            </div>
          ),
          onOk: () => setWarningShown(true)
        });
      } else if (budgetUsedPercentage >= 60) {
        // Yellow warning (60% or more of the budget)
        Modal.warning({
          title: 'Cảnh báo ngân sách',
          content: (
            <div style={{ color: '#ffc107' }}>
              Còn {remainingDays} ngày nữa mới hết tháng mà đã chi hết {convertCurrency(Math.abs(thisMonthExpenseSum))}/{convertCurrency(groupDetail.budget)}
            </div>
          ),
          onOk: () => setWarningShown(true)
        });
      }
    }
  }, [groupDetail, thisMonthExpenseSum, remainingDays, warningShown]);

  // Show budget modal
  const showBudgetModal = () => {
    setIsBudgetModalVisible(true);
    if (groupDetail?.budget) {
      setBudgetAmount(groupDetail.budget);
    }
  };

  // Handle budget save
  const handleSaveBudget = async () => {
    if (!budgetAmount || budgetAmount <= 0) {
      message.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setIsSavingBudget(true);
    try {
      await GroupServices.updateGroup(trackerID, { budget: budgetAmount });
      message.success('Cập nhật ngân sách thành công');
      setGroupDetail({ ...groupDetail, budget: budgetAmount });
      setIsBudgetModalVisible(false);
      setWarningShown(false); // Reset warning shown flag after updating budget
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsSavingBudget(false);
    }
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

      <Row gutter={[24, 12]}>
        <Col span={24}>
          <Typography.Title level={2}>
            {trackerDetail?.groupName}
          </Typography.Title>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Button 
              type="primary"
              onClick={showBudgetModal}
            >
              {groupDetail?.budget ? 'Thay đổi ngân sách' : 'Đặt ngân sách'}
            </Button>
            {groupDetail?.budget && (
              <Typography.Title level={4} style={{ marginLeft: '16px' }}>
                Ngân sách: <strong>{convertCurrency(groupDetail.budget)}</strong>
              </Typography.Title>
            )}
          </div>
          
          {/* Button to open Spending Insights Modal */}
          <Button type="default" onClick={() => setIsInsightsModalVisible(true)} style={{ marginBottom: 16 }}>
            Xem báo cáo chi tiêu
          </Button>

          <Modal
            open={isInsightsModalVisible}
            onCancel={() => setIsInsightsModalVisible(false)}
            footer={null}
            width={800}
            title="Báo cáo chi tiêu & Thống kê"
          >
            <SpendingInsights trackerID={trackerID} categories={categories} />
          </Modal>
          
          {/* Budget Timeline Component */}
          {groupDetail?.budget && thisMonthExpenseSum !== 0 && (
            <BudgetTimeline 
              totalExpense={thisMonthExpenseSum} 
              budget={groupDetail.budget} 
              dateRange={dateRangeForBudget}
            />
          )}
          
          {todaySum ? (
            <p className="lead">
              <mark>
                Hôm nay đã chi tiêu <strong className="text-danger">{convertCurrency(todaySum)}</strong>
              </mark>
            </p>
          ) : null}
          
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
      
      {/* Budget Modal */}
      <Modal
        title="Đặt ngân sách cho nhóm"
        open={isBudgetModalVisible}
        onOk={handleSaveBudget}
        onCancel={() => setIsBudgetModalVisible(false)}
        confirmLoading={isSavingBudget}
      >
        <p>Nhập ngân sách tháng cho nhóm (VND):</p>
        <InputNumber
          style={{ width: '100%' }}
          value={budgetAmount}
          onChange={(value) => setBudgetAmount(value)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          min={1}
        />
      </Modal>
    </>
  );
};

export default TrackerDetail;
