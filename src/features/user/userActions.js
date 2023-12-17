import UserServices from "../../services/UserServices";
import {
  USER_LOGIN,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILED,
  USER_REGISTER,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAILED,
  USER_LOGOUT,
  USER_LOGOUT_SUCCESS,
  USER_LOGOUT_FAILED,
  USER_FETCH_INFO,
  USER_FETCH_INFO_SUCCESS,
  USER_FETCH_INFO_FAILED,
} from "./userConstants";
import { message } from "antd";

export const login = (credentials) => async (dispatch) => {
  dispatch({ type: USER_LOGIN });

  try {
    await UserServices.login(credentials);
    dispatch({ type: USER_LOGIN_SUCCESS });
    message.success("Đăng nhập thành công!");
  } catch (error) {
    dispatch({ type: USER_LOGIN_FAILED });
    message.error(error.message);
  }
};

export const register = (credentials) => async (dispatch) => {
  dispatch({ type: USER_REGISTER });

  try {
    const newUser = await UserServices.register(credentials);
    dispatch({ type: USER_REGISTER_SUCCESS, payload: newUser });
    message.success("Đăng kí thành công!");
  } catch (error) {
    dispatch({ type: USER_REGISTER_FAILED });
    message.error(error.message);
  }
};

export const logout = () => async (dispatch) => {
  dispatch({ type: USER_LOGOUT });

  try {
    await UserServices.logout();
    dispatch({ type: USER_LOGOUT_SUCCESS });
    message.success("Đăng xuất thành công!");
  } catch (error) {
    dispatch({ type: USER_LOGOUT_FAILED });
    message.error(error.message);
  }
};

export const fetchUserInfo = (uid) => async (dispatch) => {
  dispatch({ type: USER_FETCH_INFO });

  try {
    const user = await UserServices.fetchUserInfo(uid);
    dispatch({ type: USER_FETCH_INFO_SUCCESS, payload: user });
  } catch (error) {
    dispatch({ type: USER_FETCH_INFO_FAILED });
    message.error(error.message);
  }
};
