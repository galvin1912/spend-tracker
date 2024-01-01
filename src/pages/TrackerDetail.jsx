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
import TransactionsDekstop from "../components/pages/TrackerDetail/TransactionsDekstop";
import TransactionsMobile from "../components/pages/TrackerDetail/TransactionsMobile";
import useMediaQuery from "../hooks/useMediaQuery";

const TrackerDetail = () => {
  const { trackerID } = useParams();

  const [searchParams] = useSearchParams();

  const isNotMobile = useMediaQuery("(min-width: 768px)");

  const [trackerDetail, setTrackerDetail] = useState(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // filter from search params
  const filter = useMemo(() => {
    return {
      type: searchParams.get("type") || "all",
      sortBy: searchParams.get("sortBy") || "default",
      time: searchParams.get("time")
        ? dayjs(searchParams.get("time"))
        : dayjs(),
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
          <p className="lead">
            Hôm nay đã chi tiêu <mark>{convertCurrency(1000000)}</mark>
          </p>
          <TrackerFilter
            filter={filter}
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
          />
          {filter.showChart && <TrackerChart />}
        </Col>

        <Col span={24}>
          {isNotMobile ? <TransactionsDekstop /> : <TransactionsMobile />}
        </Col>
      </Row>
    </>
  );
};

export default TrackerDetail;
