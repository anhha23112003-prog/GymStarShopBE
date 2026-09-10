import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import { getLocalStorage } from "../../utils/utils";
import { path } from "../../common/path";
import { UserOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import { NotificationContext } from "../../App";

const UserMenu = ({
  to = path.logIn,
  iconStyle = { fontSize: "20px", cursor: "pointer" },
}) => {
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const user = getLocalStorage("user");

  const handleLogout = () => {
    localStorage.removeItem("user");
    showNotification("Đăng xuất thành công", "success");
    navigate(path.homePage);
  };

  // Tạo userMenuItems động dựa trên user.role
  const userMenuItems = [
    {
      key: "1",
      label: "Thông tin cá nhân",
      onClick: () => navigate(path.myAccount),
    },
    // Chỉ thêm mục "Đơn hàng" nếu user.role là "user"
    ...(user?.role === "user"
      ? [
          {
            key: "4",
            label: "Đơn hàng",
            onClick: () => navigate(path.cartPage),
          },
        ]
      : []),
    // Chỉ thêm mục "Trang quản lý" nếu user.role là "admin"
    ...(user?.role === "admin"
      ? [
          {
            key: "3",
            label: "Trang quản lý",
            onClick: () => navigate(`${path.admin}/${path.managerUserPage}`),
          },
        ]
      : []),
    {
      key: "2",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const isLoggedIn = user && user.role;
  return (
    <>
      {!isLoggedIn ? (
        <div
          onClick={() => {
            console.log("Navigating to:", to);
            navigate(to);
          }}
          className="cursor-pointer"
        >
          <UserOutlined style={iconStyle} />
        </div>
      ) : (
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["hover"]}
          onOpenChange={(open) => console.log("Dropdown open:", open)}
        >
          <div className="cursor-pointer">
            <UserOutlined style={iconStyle} />
          </div>
        </Dropdown>
      )}
    </>
  );
};

export default UserMenu;
