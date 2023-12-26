import {
  legacy_createStore as createStore,
  applyMiddleware,
  combineReducers,
  compose,
} from "redux";
import { thunk } from "redux-thunk";
import logger from "redux-logger";
import userReducer from "../features/user/userReducer";
import groupReducer from "../features/group/groupReducer";

const middlewares = [thunk];

if (import.meta.env.DEV) {
  middlewares.push(logger);
}

const store = createStore(
  combineReducers({
    user: userReducer,
    group: groupReducer,
  }),
  compose(applyMiddleware(...middlewares))
);

export default store;
