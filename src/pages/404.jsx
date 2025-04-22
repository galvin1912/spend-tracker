import { Link } from "react-router-dom";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";

const Page404 = () => {
  const { t } = useTranslation();
  
  return (
    <Result
      status="404"
      title="404"
      subTitle={t("pageNotFound")}
      extra={
        <Link to="/">
          <Button type="primary">{t("backToHome")}</Button>
        </Link>
      }
    />
  );
};

export default Page404;
