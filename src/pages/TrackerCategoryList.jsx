import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { List, Card, Row, Col, Button, Popconfirm, Space, message } from "antd";
import { Edit } from "@styled-icons/evaicons-solid";
import { Trash } from "@styled-icons/bootstrap";
import TrackerServices from "../services/TrackerServices";
import CategoryImage from "../assets/Collaboration_Illustrations_Thumbnail.png";
import { translateError } from "../utils/errorTranslator";

const TrackerCategoryList = () => {
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
        message.error(translateError(error));
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
          title="Danh sách danh mục"
          extra={
            <Link to={`/tracker/detail/${trackerID}`}>
              <Button danger>Quay lại</Button>
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
                      title="Bạn có chắc chắn muốn xóa danh mục này?"
                      description="Điều này cũng sẽ xóa danh mục khỏi tất cả các giao dịch liên quan"
                      onConfirm={() => console.log("delete")}
                      okText="Xóa"
                      cancelText="Hủy"
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
