import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

const TrackerDetail = () => {
  const { trackerID } = useParams();

  useEffect(() => {
    console.log(trackerID);
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
    </>
  );
};

export default TrackerDetail;
