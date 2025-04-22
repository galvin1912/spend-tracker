import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import { Row, Col, Typography, message, Button, Modal, InputNumber } from "antd";
import dayjs from "dayjs";
import TrackerFilter from "../components/pages/TrackerDetail/TrackerFilter";
import SpendingInsights from '../components/pages/TrackerDetail/SpendingInsights';
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
      
      // Define warning colors and styles based on severity
      let warningStyle = {};
      let iconType = '⚠️';
      let badgeColor = '';
      let buttonStyle = {};
      
      if (budgetUsedPercentage >= 80) {
        // Critical warning (80% or more of the budget)
        warningStyle = {
          background: 'linear-gradient(to right, #fef2f2, #fee2e2)',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px 20px',
        };
        badgeColor = '#ef4444';
        iconType = '🚨';
        buttonStyle = {
          background: '#ef4444',
          borderColor: '#ef4444'
        };
      } else if (budgetUsedPercentage >= 60) {
        // Warning (60% or more of the budget)
        warningStyle = {
          background: 'linear-gradient(to right, #fffbeb, #fef3c7)',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '16px 20px',
        };
        badgeColor = '#f59e0b';
        iconType = '⚠️';
        buttonStyle = {
          background: '#f59e0b',
          borderColor: '#f59e0b'
        };
      }
      
      // Store modal reference so we can close it
      let warningModal;
      
      // Handle close modal
      const handleCloseWarning = () => {
        setWarningShown(true);
        warningModal.destroy();
      };
      
      // Configure the modal options with modern styling
      const modalConfig = {
        title: null, // Remove default title
        className: 'budget-warning-modal',
        centered: true,
        width: 420,
        icon: null,
        footer: null,
        maskClosable: false,
        closable: false,
        content: (
          <div style={warningStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ fontSize: '28px', lineHeight: '1' }}>
                {iconType}
              </div>
              <div style={{ flex: 1 }}>
                <Typography.Title level={4} style={{ margin: '0 0 8px 0' }}>
                  Cảnh báo ngân sách
                </Typography.Title>
                
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Text>
                    Còn <Typography.Text strong>{remainingDays} ngày</Typography.Text> nữa mới hết tháng mà đã chi:
                  </Typography.Text>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginTop: '12px'
                  }}>
                    <Typography.Text style={{ fontWeight: 500 }}>
                      {convertCurrency(Math.abs(thisMonthExpenseSum))}/{convertCurrency(groupDetail.budget)}
                    </Typography.Text>
                    <Typography.Text style={{ 
                      fontWeight: 600,
                      color: badgeColor,
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '20px',
                      padding: '2px 10px',
                    }}>
                      {budgetUsedPercentage.toFixed(0)}%
                    </Typography.Text>
                  </div>
                </div>
                
                <Button 
                  type="primary" 
                  block 
                  onClick={handleCloseWarning}
                  className="rounded-xl"
                  style={{ 
                    ...buttonStyle,
                    fontWeight: 500,
                    height: '38px'
                  }}
                >
                  Đã hiểu
                </Button>
              </div>
            </div>
          </div>
        ),
      };
      
      // Show the styled modal and store the reference
      warningModal = Modal.info(modalConfig);
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

          <div className="rounded-2xl shadow-hover" style={{ 
            marginBottom: '20px', 
            padding: '16px 20px',
            background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
            border: '1px solid #bae6fd',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography.Text style={{ fontSize: '16px', fontWeight: 500 }}>
                Ngân sách tháng
              </Typography.Text>
              <Button 
                type="primary"
                onClick={showBudgetModal}
                className="rounded-xl"
                style={{
                  background: groupDetail?.budget ? 'var(--primary-color)' : '#3b82f6',
                  borderColor: groupDetail?.budget ? 'var(--primary-color)' : '#3b82f6',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                icon={<span style={{ fontSize: '16px' }}>{groupDetail?.budget ? '✏️' : '+'}</span>}
              >
                {groupDetail?.budget ? 'Thay đổi' : 'Đặt ngân sách'}
              </Button>
            </div>
            
            {groupDetail?.budget && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '12px'
              }}>
                <Typography.Title 
                  level={3} 
                  style={{ 
                    margin: 0,
                    color: '#0369a1',
                    fontWeight: 600
                  }}
                >
                  {convertCurrency(groupDetail.budget)}
                </Typography.Title>
              </div>
            )}
          </div>
          
          {todaySum ? (
            <div 
              className="shadow-hover rounded-xl" 
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(to right, #fef2f2, #ffe4e6)',
                border: '1px solid #fecdd3',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography.Text style={{ fontSize: '16px' }}>
                <Typography.Text strong>Hôm nay</Typography.Text> đã chi tiêu:
              </Typography.Text>
              <Typography.Text 
                strong 
                className="text-danger"
                style={{ 
                  fontSize: '18px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  padding: '4px 12px',
                  borderRadius: '16px'
                }}
              >
                {convertCurrency(todaySum)}
              </Typography.Text>
            </div>
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
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            {groupDetail?.budget ? 'Thay đổi ngân sách' : 'Đặt ngân sách cho nhóm'}
          </Typography.Title>
        }
        open={isBudgetModalVisible}
        onOk={handleSaveBudget}
        onCancel={() => setIsBudgetModalVisible(false)}
        confirmLoading={isSavingBudget}
        okText="Lưu ngân sách"
        cancelText="Hủy"
        okButtonProps={{
          className: "rounded-xl",
          style: { 
            fontWeight: 500,
            paddingLeft: '16px',
            paddingRight: '16px'
          }
        }}
        cancelButtonProps={{
          className: "rounded-xl",
          style: { 
            fontWeight: 500,
            paddingLeft: '16px',
            paddingRight: '16px'
          }
        }}
        className="budget-modal"
        style={{ borderRadius: '16px' }}
      >
        <div style={{ marginBottom: '20px' }}>
          <Typography.Text style={{ fontSize: '15px', display: 'block', marginBottom: '12px' }}>
            Nhập ngân sách tháng cho nhóm:
          </Typography.Text>
          <InputNumber
            style={{ 
              width: '100%',
              height: '46px',
              fontSize: '16px',
              borderRadius: '12px'
            }}
            value={budgetAmount}
            onChange={(value) => setBudgetAmount(value)}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            min={1}
            prefix="₫"
            placeholder="Nhập số tiền ngân sách"
            size="large"
            className="budget-input"
          />
        </div>
        <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
          Ngân sách giúp bạn theo dõi và kiểm soát chi tiêu hàng tháng của nhóm.
        </Typography.Text>
      </Modal>
    </>
  );
};

export default TrackerDetail;
