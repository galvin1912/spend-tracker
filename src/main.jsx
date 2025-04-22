import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/common/ErrorBoundary";
import store from "./store";
import App from "./App";
import themeConfig from "./theme/themeConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
// Import i18n configuration
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ConfigProvider theme={themeConfig}>
          <HelmetProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </HelmetProvider>
        </ConfigProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
