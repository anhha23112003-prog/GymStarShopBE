import React, { useEffect } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import { path } from "../common/path.js";
import HomePage from "../pages/HomePage/HomePage";
import HomeTemplate from "../templates/HomeTemplate/HomeTemplate.jsx";
import ErrorPage from "../pages/ErrorPage/ErrorPage.jsx";
import ProductPage from "../pages/ProductPage/ProductPage.jsx";
import LoginPage from "../pages/LoginPage/LoginPage.jsx";
import SignUpPage from "../pages/SignUpPage/SignUpPage.jsx";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage.jsx";
import AdminTemplate from "../templates/AdminTemplate/AdminTemplate.jsx";
import ManagerUserPage from "../pages/ManagerUserPage/ManagerUserPage.jsx";
import ManagerProductPage from "../pages/ManagerProductPage/ManagerProductPage.jsx";
import ManagerCategoryPage from "../pages/ManagerCategoryPage/ManagerCategoryPage.jsx";
import ManagerOrderPage from "../pages/ManagerOrderPage/ManagerOrderPage.jsx";
import MyAccountPage from "../pages/MyAccountPage/MyAccountPage.jsx";
import ManagerGalleryPage from "../pages/ManagerGalleryPage/ManagerGalleryPage.jsx";
import ShowRoomPage from "../pages/ShowRoomPage/ShowRoomPage.jsx";
import OderPage from "../pages/OderPage/OderPage.jsx";
import CategoryPage from "../pages/CategoryPage/CategoryPage.jsx";
import CartPage from "../pages/CartPage/CartPage.jsx";
import OrderTemplate from "../templates/OrderTemplate/OrderTemplate.jsx";
import OrderAllPage from "../pages/OrderAllPage/OrderAllPage.jsx";
import OrderConfirmedPage from "../pages/OrderConfirmedPage/OrderConfirmedPage.jsx";
import OrderPendingPage from "../pages/OrderPendingPage/OrderPendingPage.jsx";
import OrderCancelledPage from "../pages/OrderCancelledPage/OrderCancelledPage.jsx";
import OrderDeliveredPage from "../pages/OrderDeliveredPage/OrderDeliveredPage.jsx";
import OrderDeliveringPage from "../pages/OrderDeliveringPage/OrderDeliveringPage.jsx";
import OrderFailedDeliveryPage from "../pages/OrderFailedDeliveryPage/OrderFailedDeliveryPage.jsx";

const UseRoutesCustom = () => {
  const routes = useRoutes([
    {
      path: path.homePage,
      element: <HomeTemplate />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: path.productPage,
          element: <ProductPage />,
        },
        {
          path: path.productDetailPage,
          element: <ProductDetailPage />,
        },
        {
          path: path.myAccount,
          element: <MyAccountPage />,
        },
        {
          path: path.showRoom,
          element: <ShowRoomPage />,
        },
        {
          path: path.oderPage,
          element: <OderPage />,
        },
        {
          path: path.categoryPage,
          element: <CategoryPage />,
        },
        {
          path: path.cartPage,
          element: <OrderTemplate />,
          children: [
            {
              index: true,
              element: <OrderAllPage />,
            },
            {
              path: path.orderConfirmedPage,
              element: <OrderConfirmedPage />,
            },
            {
              path: path.orderPendingPage,
              element: <OrderPendingPage />,
            },
            {
              path: path.orderCancelledPage,
              element: <OrderCancelledPage />,
            },
            {
              path: path.orderDeliveredPage,
              element: <OrderDeliveredPage />,
            },
            {
              path: path.orderDeliveringPage,
              element: <OrderDeliveringPage />,
            },
            {
              path: path.orderFailedPage,
              element: <OrderFailedDeliveryPage />,
            },
          ],
        },
      ],
    },
    {
      path: "/admin",
      element: <AdminTemplate />,
      children: [
        {
          path: path.managerUserPage,
          element: <ManagerUserPage />,
        },

        {
          path: path.managerProductPage,
          element: <ManagerProductPage />,
        },

        {
          path: path.managerCategoryPage,
          element: <ManagerCategoryPage />,
        },

        {
          path: path.managerOrderPage,
          element: <ManagerOrderPage />,
        },
        {
          path: path.managerGalleryPage,
          element: <ManagerGalleryPage />,
        },
      ],
    },
    {
      path: "*",
      element: <ErrorPage />,
    },
    {
      path: path.logIn,
      element: <LoginPage />,
    },
    ,
    {
      path: path.signUp,
      element: <SignUpPage />,
    },
    {
      path: "/don-hang",
      element: <CartPage />,
    },
  ]);
  return routes;
};

export default UseRoutesCustom;
