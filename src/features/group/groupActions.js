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
import { message } from "antd";
import GroupServices from "../../services/GroupServices";

export const createGroup = (groupData) => async (dispatch) => {
  dispatch({ type: GROUP_CREATE });

  try {
    const groupID = await GroupServices.createGroup(groupData);
    dispatch({ type: GROUP_CREATE_SUCCESS, payload: groupID });
    message.success("Tạo nhóm thành công!");
  } catch (error) {
    dispatch({ type: GROUP_CREATE_FAILED });
    message.error(error.message);
  }
};

export const getOwnerGroups = () => async (dispatch) => {
  dispatch({ type: GROUP_GET_OWNER_GROUPS });

  try {
    const groups = await GroupServices.getOwnerGroups();
    dispatch({ type: GROUP_GET_OWNER_GROUPS_SUCCESS, payload: groups });
  } catch (error) {
    dispatch({ type: GROUP_GET_OWNER_GROUPS_FAILED });
    message.error(error.message);
  }
};

export const getJoinedGroups = () => async (dispatch) => {
  dispatch({ type: GROUP_GET_JOINED_GROUPS });

  try {
    const groups = await GroupServices.getJoinedGroups();
    dispatch({ type: GROUP_GET_JOINED_GROUPS_SUCCESS, payload: groups });
  } catch (error) {
    dispatch({ type: GROUP_GET_JOINED_GROUPS_FAILED });
    message.error(error.message);
  }
};

export const deleteOwnerGroup = (groupID) => async (dispatch) => {
  dispatch({ type: GROUP_DELETE_OWNER_GROUP });

  try {
    await GroupServices.deleteGroup(groupID);
    dispatch({ type: GROUP_DELETE_OWNER_GROUP_SUCCESS, payload: groupID });
    message.success("Xóa nhóm thành công!");
  } catch (error) {
    dispatch({ type: GROUP_DELETE_OWNER_GROUP_FAILED });
    message.error(error.message);
  }
};
