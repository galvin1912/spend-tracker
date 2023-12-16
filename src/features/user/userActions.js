import UserServices from "../../services/UserServices";
import {
  USER_LOGIN,
  // USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILED,
  USER_LOGIN_FINISHED,
  USER_REGISTER,
  // USER_REGISTER_SUCCESS,
  USER_REGISTER_FAILED,
  USER_REGISTER_FINISHED,
  // USER_LOGOUT,
  // USER_LOGOUT_SUCCESS,
  // USER_LOGOUT_FAILED,
  // USER_LOGOUT_FINISHED,
} from "./userConstants";

export const login = (email, password) => async (dispatch) => {
  dispatch({ type: USER_LOGIN });

  try {
    console.log(email, password);
  } catch (error) {
    dispatch({ type: USER_LOGIN_FAILED, payload: error });
  } finally {
    dispatch({ type: USER_LOGIN_FINISHED });
  }
};

export const register = (credentials) => async (dispatch) => {
  dispatch({ type: USER_REGISTER });

  try {
    const response = await UserServices.register(credentials);
    console.log(response);
  } catch (error) {
    dispatch({ type: USER_REGISTER_FAILED, payload: error });
  } finally {
    dispatch({ type: USER_REGISTER_FINISHED });
  }
};
