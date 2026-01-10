import { TRACKER_GET_TRACKERS, TRACKER_GET_TRACKERS_SUCCESS, TRACKER_GET_TRACKERS_FAILED } from "./trackerConstants";
import messageUtil from "../../utils/messageUtil";
import TrackerServices from "../../services/TrackerServices";

export const getTrackers = () => async (dispatch) => {
  dispatch({ type: TRACKER_GET_TRACKERS });

  try {
    const trackers = await TrackerServices.getTrackers();
    dispatch({ type: TRACKER_GET_TRACKERS_SUCCESS, payload: trackers });
  } catch (error) {
    dispatch({ type: TRACKER_GET_TRACKERS_FAILED });
    messageUtil.error('Không thể tải quản lý chi tiêu. Vui lòng thử lại.');
  }
};
