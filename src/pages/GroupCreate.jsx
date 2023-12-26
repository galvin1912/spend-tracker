import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button } from "antd";
import { createGroup } from "../features/group/groupActions";
import GroupImage from "../assets/89z_2203_w009_n001_120b_p14_120.jpg";

const GroupCreate = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const isCreatingGroup = useSelector((state) => state.group.isCreatingGroup);

  const onFinish = (values) => {
    dispatch(createGroup(values)).then(() => navigate("/group"));
  };

  return (
    <>
      <Helmet
        title="Tạo nhóm | GST"
        meta={[
          {
            name: "description",
            content: "Tạo nhóm mới.",
          },
        ]}
      />

      <div className="row">
        <div className="col-md-6">
          <Form
            name="groupCreateForm"
            initialValues={{
              groupName: "",
              description: "",
            }}
            layout="vertical"
            autoComplete="off"
            onFinish={onFinish}
          >
            <Form.Item
              label="Tên nhóm"
              name="groupName"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên nhóm!",
                },
              ]}
            >
              <Input placeholder="Nhập tên nhóm" />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mô tả!",
                },
              ]}
            >
              <Input.TextArea placeholder="Nhập mô tả" />
            </Form.Item>
            <Form.Item>
              <Link to="/group">
                <Button className="me-2" type="default">
                  Quay lại
                </Button>
              </Link>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreatingGroup}
              >
                Tạo nhóm
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className="col-md-6">
          <img src={GroupImage} alt="Group" className="img-fluid" />
        </div>
      </div>
    </>
  );
};

export default GroupCreate;
