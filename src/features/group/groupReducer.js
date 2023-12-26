import {
  GROUP_CREATE,
  GROUP_CREATE_SUCCESS,
  GROUP_CREATE_FAILED,
  GROUP_GET_OWNER_GROUPS,
  GROUP_GET_OWNER_GROUPS_SUCCESS,
  GROUP_GET_OWNER_GROUPS_FAILED,
  GROUP_GET_JOINED_GROUPS,
  GROUP_GET_JOINED_GROUPS_SUCCESS,
  GROUP_GET_JOINED_GROUPS_FAILED,
  GROUP_DELETE_OWNER_GROUP,
  GROUP_DELETE_OWNER_GROUP_SUCCESS,
  GROUP_DELETE_OWNER_GROUP_FAILED,
} from "./groupConstants";

const initialState = {
  isCreatingGroup: false,
  isDeletingGroup: false,
  ownerGroups: [],
  isOwnerGroupsLoading: false,
  joinedGroups: [],
  isJoinedGroupsLoading: false,
};

const groupReducer = (state = initialState, action) => {
  switch (action.type) {
    case GROUP_CREATE:
      return {
        ...state,
        isCreatingGroup: true,
      };
    case GROUP_CREATE_SUCCESS:
      return {
        ...state,
        isCreatingGroup: false,
      };
    case GROUP_CREATE_FAILED:
      return {
        ...state,
        isCreatingGroup: false,
      };
    case GROUP_GET_OWNER_GROUPS:
      return {
        ...state,
        isOwnerGroupsLoading: true,
      };
    case GROUP_GET_OWNER_GROUPS_SUCCESS:
      return {
        ...state,
        isOwnerGroupsLoading: false,
        ownerGroups: action.payload,
      };
    case GROUP_GET_OWNER_GROUPS_FAILED:
      return {
        ...state,
        isOwnerGroupsLoading: false,
      };
    case GROUP_GET_JOINED_GROUPS:
      return {
        ...state,
        isJoinedGroupsLoading: true,
      };
    case GROUP_GET_JOINED_GROUPS_SUCCESS:
      return {
        ...state,
        isJoinedGroupsLoading: false,
        joinedGroups: action.payload,
      };
    case GROUP_GET_JOINED_GROUPS_FAILED:
      return {
        ...state,
        isJoinedGroupsLoading: false,
      };
    case GROUP_DELETE_OWNER_GROUP:
      return {
        ...state,
        isDeletingGroup: true,
      };
    case GROUP_DELETE_OWNER_GROUP_SUCCESS:
      return {
        ...state,
        isDeletingGroup: false,
        ownerGroups: state.ownerGroups.filter((group) => group.uid !== action.payload),
      };
    case GROUP_DELETE_OWNER_GROUP_FAILED:
      return {
        ...state,
        isDeletingGroup: false,
      };
    default:
      return state;
  }
};

export default groupReducer;
