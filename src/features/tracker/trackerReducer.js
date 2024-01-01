import { TRACKER_GET_TRACKERS, TRACKER_GET_TRACKERS_SUCCESS, TRACKER_GET_TRACKERS_FAILED } from "./trackerConstants";

const initialState = {
  isTrackersLoading: false,
  trackers: [],
};

const trackerReducer = (state = initialState, action) => {
  switch (action.type) {
    case TRACKER_GET_TRACKERS:
      return { ...state, isTrackersLoading: true };
    case TRACKER_GET_TRACKERS_SUCCESS:
      return {
        ...state,
        isTrackersLoading: false,
        trackers: action.payload,
      };
    case TRACKER_GET_TRACKERS_FAILED:
      return { ...state, isTrackersLoading: false };
    default:
      return state;
  }
};

export default trackerReducer;
