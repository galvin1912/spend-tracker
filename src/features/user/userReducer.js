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

const initialState = {
  user: null,
  isAuthenticated: false,
  isFetching: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isRegistering: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_REGISTER:
      return {
        ...state,
        isRegistering: true,
      };
    case USER_REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isRegistering: false,
      };
    case USER_REGISTER_FAILED:
      return {
        ...state,
        isRegistering: false,
      };
    case USER_LOGIN:
      return {
        ...state,
        isLoggingIn: true,
      };
    case USER_LOGIN_SUCCESS:
      return {
        ...state,
        isLoggingIn: false,
      };
    case USER_LOGIN_FAILED:
      return {
        ...state,
        isLoggingIn: false,
      };
    case USER_LOGOUT:
      return {
        ...state,
        isLoggingOut: true,
      };
    case USER_LOGOUT_SUCCESS:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoggingOut: false,
      };
    case USER_LOGOUT_FAILED:
      return {
        ...state,
        isLoggingOut: false,
      };
    case USER_FETCH_INFO:
      return {
        ...state,
        isFetching: true,
      };
    case USER_FETCH_INFO_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isFetching: false,
      };
    case USER_FETCH_INFO_FAILED:
      return {
        ...state,
        isFetching: false,
      };
    default:
      return state;
  }
};

export default userReducer;
