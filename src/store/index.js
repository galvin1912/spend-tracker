import { legacy_createStore as createStore, applyMiddleware, combineReducers, compose } from "redux";
import { thunk } from "redux-thunk";
import logger from "redux-logger";
import userReducer from "../features/user/userReducer";
import groupReducer from "../features/group/groupReducer";
import trackerReducer from "../features/tracker/trackerReducer";
import walletReducer from "../features/wallet/walletReducer";
import notesReducer from "../features/notes/notesReducer";

const middlewares = [thunk];

if (import.meta.env.DEV) {
  middlewares.push(logger);
}

const store = createStore(
  combineReducers({
    user: userReducer,
    group: groupReducer,
    tracker: trackerReducer,
    wallet: walletReducer,
    notes: notesReducer,
  }),
  compose(applyMiddleware(...middlewares))
);

export default store;
