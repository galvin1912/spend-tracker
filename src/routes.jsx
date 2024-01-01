import { Suspense, lazy } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { Skeleton } from "antd";
import Layout from "./components/layouts/Layout";
import AuthLayout from "./components/layouts/AuthLayout";

const Tracker = lazy(() => import("./pages/Tracker"));
const TrackerDetail = lazy(() => import("./pages/TrackerDetail"));
const TrackerCategoryCreate = lazy(() => import("./pages/TrackerCategoryCreate"));
const TrackerCategoryList = lazy(() => import("./pages/TrackerCategoryList"));
const TrackerCategoryDetail = lazy(() => import("./pages/TrackerCategoryDetail"));
const TrackerTransactionCreate = lazy(() => import("./pages/TrackerTransactionCreate"));
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
          path: "/tracker/detail/:trackerID",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <TrackerDetail />
            </Suspense>
          ),
        },
        {
          path: "/tracker/detail/:trackerID/category/create",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <TrackerCategoryCreate />
            </Suspense>
          ),
        },
        {
          path: "/tracker/detail/:trackerID/category/list",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <TrackerCategoryList />
            </Suspense>
          ),
        },
        {
          path: "/tracker/detail/:trackerID/category/detail/:categoryID",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <TrackerCategoryDetail />
            </Suspense>
          ),
        },
        {
          path: "/tracker/detail/:trackerID/transaction/create",
          element: (
            <Suspense fallback={<Skeleton active />}>
              <TrackerTransactionCreate />
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
