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
  USER_UPDATE_PROFILE,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAILED,
  USER_CHECK_AUTH_START,
  USER_CHECK_AUTH_COMPLETE,
} from "./userConstants";
import messageUtil from "../../utils/messageUtil";
import { translateError } from "../../utils/errorTranslator";
import { createDefaultWalletForUser } from "../../utils/migration/createDefaultWallets";

export const login = (credentials) => async (dispatch) => {
  dispatch({ type: USER_LOGIN });

  try {
    await UserServices.login(credentials);
    dispatch({ type: USER_LOGIN_SUCCESS });
    messageUtil.success("Đăng nhập thành công");
  } catch (error) {
    dispatch({ type: USER_LOGIN_FAILED });
    messageUtil.error(translateError(error) || "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập và thử lại.");
  }
};

export const register = (credentials) => async (dispatch) => {
  dispatch({ type: USER_REGISTER });

  try {
    await UserServices.register(credentials);
    dispatch({ type: USER_REGISTER_SUCCESS });
    messageUtil.success("Đăng ký thành công");
  } catch (error) {
    dispatch({ type: USER_REGISTER_FAILED });
    messageUtil.error(translateError(error) || "Đăng ký thất bại. Vui lòng thử lại.");
  }
};

export const logout = () => async (dispatch) => {
  dispatch({ type: USER_LOGOUT });

  try {
    await UserServices.logout();
    dispatch({ type: USER_LOGOUT_SUCCESS });
    messageUtil.success("Đăng xuất thành công");
  } catch (error) {
    dispatch({ type: USER_LOGOUT_FAILED });
    messageUtil.error(translateError(error));
  }
};

export const fetchUserInfo = (uid) => async (dispatch) => {
  dispatch({ type: USER_FETCH_INFO });

  try {
    const user = await UserServices.fetchUserInfo(uid);
    
    // Run migration: create default wallet if user doesn't have one
    try {
      await createDefaultWalletForUser(user);
      // Re-fetch user info to get updated wallets array
      const updatedUser = await UserServices.fetchUserInfo(uid);
      dispatch({ type: USER_FETCH_INFO_SUCCESS, payload: updatedUser });
    } catch (migrationError) {
      // If migration fails, still use the original user data
      console.error("Migration failed:", migrationError);
      dispatch({ type: USER_FETCH_INFO_SUCCESS, payload: user });
    }
    
    // Mark auth check as complete after successfully fetching user info
    dispatch({ type: USER_CHECK_AUTH_COMPLETE });
  } catch (error) {
    dispatch({ type: USER_FETCH_INFO_FAILED });
    // Mark auth check as complete even if fetch fails
    dispatch({ type: USER_CHECK_AUTH_COMPLETE });
    messageUtil.error(translateError(error) || "Không thể tải thông tin người dùng.");
  }
};

export const updateUserProfile = (userData) => async (dispatch) => {
  dispatch({ type: USER_UPDATE_PROFILE });

  try {
    const updatedUser = await UserServices.updateUserProfile(userData);
    dispatch({ type: USER_UPDATE_PROFILE_SUCCESS, payload: updatedUser });
    messageUtil.success("Cập nhật thông tin thành công");
    return updatedUser;
  } catch (error) {
    dispatch({ type: USER_UPDATE_PROFILE_FAILED });
    messageUtil.error(translateError(error) || "Không thể cập nhật thông tin hồ sơ.");
    throw error;
  }
};

export const checkAuthStart = () => (dispatch) => {
  dispatch({ type: USER_CHECK_AUTH_START });
};

export const checkAuthComplete = () => (dispatch) => {
  dispatch({ type: USER_CHECK_AUTH_COMPLETE });
};
