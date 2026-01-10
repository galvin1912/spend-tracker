import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { List, Card, Row, Col, Button, Popconfirm, Space } from "antd";
import { Edit } from "@styled-icons/evaicons-solid";
import { Trash } from "@styled-icons/bootstrap";
import TrackerServices from "../services/TrackerServices";
import CategoryImage from "../assets/Collaboration_Illustrations_Thumbnail.png";
import { translateError } from "../utils/errorTranslator";
import messageUtil from "../utils/messageUtil";

const TrackerCategoryList = () => {
  const { trackerID } = useParams();

  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  // get categories
  useEffect(() => {
    const getCategories = async () => {
      setIsCategoriesLoading(true);

      try {
        const categories = await TrackerServices.getCategories(trackerID);
        setCategories(categories);
      } catch (error) {
        messageUtil.error(translateError(error));
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    getCategories();
  }, [trackerID]);

  const handleDeleteCategory = async (categoryID) => {
    setDeletingCategoryId(categoryID);
    try {
      await TrackerServices.deleteCategory(trackerID, categoryID);
      messageUtil.success('Xóa danh mục thành công');
      // Refresh categories list
      const updatedCategories = await TrackerServices.getCategories(trackerID);
      setCategories(updatedCategories);
    } catch (error) {
      messageUtil.error(translateError(error));
    } finally {
      setDeletingCategoryId(null);
    }
  };

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
                      description="Các giao dịch thuộc danh mục này sẽ được chuyển sang 'Không có danh mục'"
                      onConfirm={() => handleDeleteCategory(category?.uid)}
                      okText="Xóa"
                      cancelText="Hủy"
                      disabled={deletingCategoryId === category?.uid}
                    >
                      <Trash 
                        size={20} 
                        className="text-danger" 
                        style={{ cursor: deletingCategoryId === category?.uid ? "wait" : "pointer" }} 
                      />
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
