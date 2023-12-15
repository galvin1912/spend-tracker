import { Suspense, lazy } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { Skeleton } from "antd";
import Layout from "./components/layouts/Layout";
import AuthLayout from "./components/layouts/AuthLayout";

const SpendTracker = lazy(() => import("./pages/SpendTracker"));
const RevenueTracker = lazy(() => import("./pages/RevenueTracker"));
const Login = lazy(() => import("./pages/Login"));
const Page404 = lazy(() => import("./pages/404"));

const AppRoutes = () => {
  const routes = useRoutes([
    // App
    {
      element: <Layout />,
      children: [
        { path: "/", element: <Navigate to="/spend-tracker" replace /> },
        {
          path: "/spend-tracker",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <SpendTracker />
            </Suspense>
          ),
        },
        {
          path: "/revenue-tracker",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <RevenueTracker />
            </Suspense>
          ),
        },
      ],
    },
    // Auth
    {
      element: <AuthLayout />,
      children: [
        {
          path: "/login",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <Login />
            </Suspense>
          ),
        },
      ],
    },
    // 404
    {
      path: "/404",
      element: (
        <Suspense fallback={<Skeleton active />}>
          <Page404 />
        </Suspense>
      ),
    },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);

  return routes;
};

export default AppRoutes;
