import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { List, Card, Row, Col, Button, Popconfirm, Space, message } from "antd";
import { Edit } from "@styled-icons/evaicons-solid";
import { Trash } from "@styled-icons/bootstrap";
import { useTranslation } from "react-i18next";
import TrackerServices from "../services/TrackerServices";
import CategoryImage from "../assets/Collaboration_Illustrations_Thumbnail.png";

const TrackerCategoryList = () => {
  const { t } = useTranslation();
  const { trackerID } = useParams();

  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState([]);

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
    <Row gutter={[24, 12]}>
      <Col span={24} md={12}>
        <Card
          title={t('categoryList')}
          extra={
            <Link to={`/tracker/detail/${trackerID}`}>
              <Button danger>{t('back')}</Button>
            </Link>
          }
        >
          <List
            loading={isCategoriesLoading}
            dataSource={categories}
            renderItem={(category) => (
              <List.Item
                extra={
                  <Space>
                    <Link to={`/tracker/detail/${trackerID}/category/detail/${category?.uid}`} className="text-dark">
                      <Edit size={20} />
                    </Link>
                    <Popconfirm
                      title={t('deleteCategoryConfirm')}
                      description={t('deleteCategoryWarning')}
                      onConfirm={() => console.log("delete")}
                      okText={t('delete')}
                      cancelText={t('cancel')}
                    >
                      <Trash size={20} className="text-danger" style={{ cursor: "pointer" }} />
                    </Popconfirm>
                  </Space>
                }
              >
                <div className="flex-fill fw-medium">{category?.name}</div>
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col span={24} md={12}>
        <img src={CategoryImage} alt="Category" className="img-fluid" />
      </Col>
    </Row>
  );
};

export default TrackerCategoryList;
