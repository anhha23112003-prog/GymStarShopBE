import React from "react";
import { Route, Routes, Link, NavLink, Outlet } from "react-router-dom";
import OrderAllPage from "../../pages/OrderAllPage/OrderAllPage";
import { path } from "../../common/path";

const PendingOrders = () => <div className="p-5">Đang chờ</div>;
const ConfirmedOrders = () => <div className="p-5">Đã xác nhận</div>;
const DeliveringOrders = () => <div className="p-5">Đang giao</div>;
const DeliveredOrders = () => <div className="p-5">Đã giao</div>;
const FailedOrders = () => <div className="p-5">Giao thất bại</div>;
const CanceledOrders = () => <div className="p-5">Đã hủy</div>;

const OrderTemplate = () => {
  return (
    <div className="flex min-h-[calc(100vh-120px)] bg-gray-100">
      <div className="w-64 bg-white p-5 border-r border-gray-200 sticky top-20 h-[calc(100vh-120px)] overflow-y-auto">
        <ul className="list-none p-0">
          <li className="mb-2">
            <NavLink
              to={path.cartPage}
              end
              className={({ isActive }) =>
                `block p-2 text-gray-700 text-base rounded-md hover:bg-gray-100 hover:text-black ${
                  isActive ? "text-black font-bold bg-gray-100" : ""
                }`
              }
            >
              Tất cả
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to={path.orderPendingPage}
              className={({ isActive }) =>
                `block p-2 text-gray-700 text-base rounded-md hover:bg-gray-100 hover:text-black ${
                  isActive ? "text-black font-bold bg-gray-100" : ""
                }`
              }
            >
              Đang chờ
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to={path.orderConfirmedPage}
              className={({ isActive }) =>
                `block p-2 text-gray-700 text-base rounded-md hover:bg-gray-100 hover:text-black ${
                  isActive ? "text-black font-bold bg-gray-100" : ""
                }`
              }
            >
              Đã xác nhận
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to={path.orderDeliveringPage}
              className={({ isActive }) =>
                `block p-2 text-gray-700 text-base rounded-md hover:bg-gray-100 hover:text-black ${
                  isActive ? "text-black font-bold bg-gray-100" : ""
                }`
              }
            >
              Đang giao
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to={path.orderDeliveredPage}
              className={({ isActive }) =>
                `block p-2 text-gray-700 text-base rounded-md hover:bg-gray-100 hover:text-black ${
                  isActive ? "text-black font-bold bg-gray-100" : ""
                }`
              }
            >
              Đã giao
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to={path.orderFailedPage}
              className={({ isActive }) =>
                `block p-2 text-gray-700 text-base rounded-md hover:bg-gray-100 hover:text-black ${
                  isActive ? "text-black font-bold bg-gray-100" : ""
                }`
              }
            >
              Giao thất bại
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to={path.orderCancelledPage}
              className={({ isActive }) =>
                `block p-2 text-gray-700 text-base rounded-md hover:bg-gray-100 hover:text-black ${
                  isActive ? "text-black font-bold bg-gray-100" : ""
                }`
              }
            >
              Đã hủy
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="flex-1 p-5 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default OrderTemplate;
