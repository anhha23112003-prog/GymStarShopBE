import React from "react";
import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../redux/userSlice";
import { Dropdown } from "antd";
// import Image from "antd/es/image";
import { getLocalStorage } from "../../utils/utils";
import { path } from "../../common/path";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
const AvatarMenu = () => {
  const navigate = useNavigate();
  //   const dispatch = useDispatch();
  const user = getLocalStorage("user");
  console.log(user);
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate(path.homePage);
  };
  const userMenuItems = [
    {
      key: "1",
      label: "Thông tin cá nhân",
      onClick: () => navigate(),
    },
    {
      key: "2",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
    {
      key: "4",
      label: "Đơn hàng",
      onClick: () => navigate(path.cartPage),
    },

    {
      key: "3",
      label: "Trang quản lý ",
      onClick: () => navigate(`${path.admin}/${path.managerUser}`),
    },
  ];
  const guestMenuItems = [
    {
      key: "1",
      label: "Đăng nhập",
      onClick: () => navigate(path.logIn),
    },
    {
      key: "2",
      label: "Đăng ký",
      onClick: () => navigate(path.signUp),
    },
  ];
  return (
    <>
      {!user ? (
        <>
          {/* Hiển thị trên desktop */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate(path.logIn)}
              className="px-4 py-2 text-base border border-black font-semibold text-black rounded-3xl hover:bg-gray-100 whitespace-nowrap"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate(path.signUp)}
              className="px-4 py-2 text-base bg-yellow-500 font-semibold rounded-3xl hover:bg-yellow-600 whitespace-nowrap"
            >
              Đăng ký
            </button>
          </div>

          {/* Hiển thị trên mobile */}
          <div className="md:hidden">
            <Dropdown
              menu={{ items: guestMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div className="cursor-pointer">
                <Avatar
                  icon={<UserOutlined />}
                  size={32}
                  className="bg-gray-200"
                />
              </div>
            </Dropdown>
          </div>
        </>
      ) : (
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div className="cursor-pointer">
            <Avatar
              src={user.avatar || "/Image/hutao.gif"}
              alt="User avatar"
              size={window.innerWidth < 768 ? 32 : 40}
            />
          </div>
        </Dropdown>
      )}
    </>
    // <>
    //   <div>AvatarMenu</div>
    // </>
  );
};

export default AvatarMenu;
