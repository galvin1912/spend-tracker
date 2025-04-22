import { TRACKER_GET_TRACKERS, TRACKER_GET_TRACKERS_SUCCESS, TRACKER_GET_TRACKERS_FAILED } from "./trackerConstants";
import { message } from "antd";
import TrackerServices from "../../services/TrackerServices";
import i18next from "i18next";

export const getTrackers = () => async (dispatch) => {
  dispatch({ type: TRACKER_GET_TRACKERS });

  try {
    const trackers = await TrackerServices.getTrackers();
    dispatch({ type: TRACKER_GET_TRACKERS_SUCCESS, payload: trackers });
  } catch (error) {
    dispatch({ type: TRACKER_GET_TRACKERS_FAILED });
    message.error(i18next.t('errorGetTrackers'));
  }
};
