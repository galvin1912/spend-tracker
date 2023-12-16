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

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isRegistering: false,
  error: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGIN:
      return {
        ...state,
        isLoggingIn: true,
      };
    case USER_LOGIN_FAILED:
      return {
        ...state,
        error: action.payload,
      };
    case USER_LOGIN_FINISHED:
      return {
        ...state,
        isLoggingIn: false,
      };
    case USER_REGISTER:
      return {
        ...state,
        isRegistering: true,
      };
    case USER_REGISTER_FAILED:
      return {
        ...state,
        error: action.payload,
      };
    case USER_REGISTER_FINISHED:
      return {
        ...state,
        isRegistering: false,
      };
    default:
      return state;
  }
};

export default userReducer;
