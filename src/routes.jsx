import { Suspense, lazy } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { Skeleton } from "antd";
import Layout from "./components/layouts/Layout";
import AuthLayout from "./components/layouts/AuthLayout";

const Tracker = lazy(() => import("./pages/Tracker"));
const Group = lazy(() => import("./pages/Group"));
const GroupCreate = lazy(() => import("./pages/GroupCreate"));
const GroupDetail = lazy(() => import("./pages/GroupDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Page404 = lazy(() => import("./pages/404"));

const AppRoutes = () => {
  const routes = useRoutes([
    // App
    {
      element: <Layout />,
      children: [
        { path: "/", element: <Navigate to="/tracker" replace /> },
        {
          path: "/tracker",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <Tracker />
            </Suspense>
          ),
        },
        {
          path: "/group",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <Group />
            </Suspense>
          ),
        },
        {
          path: "/group/create",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <GroupCreate />
            </Suspense>
          ),
        },
        {
          path: "/group/detail/:groupID",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <GroupDetail />
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
        {
          path: "/register",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <Register />
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
