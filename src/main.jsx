import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import ErrorBoundary from "./components/common/ErrorBoundary";
import store from "./store";
import App from "./App";
import themeConfig from "./theme/themeConfig";
import vi_VN from "./locale/vi_VN";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ConfigProvider theme={themeConfig} locale={vi_VN}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConfigProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
