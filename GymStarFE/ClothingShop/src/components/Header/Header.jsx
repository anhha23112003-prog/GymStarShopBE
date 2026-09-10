import React, { useState, useEffect, useContext } from "react";
import { path } from "../../common/path";
import { Link } from "react-router-dom";
import UserMenu from "../UserMenu/UserMenu";
import "antd/dist/reset.css";
import { danhMucService } from "../../services/danhMuc.service";
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { removeVietnameseTones } from "../../utils/removeVietnameseTones";
import { NotificationContext } from "../../App";
import FormSearchProductTwo from "../FormSearchProduct/FormSeacrchProductTwo";
import { useSelector, useDispatch } from "react-redux";
import { fetchCartProducts } from "../../redux/cartSlice";
import { getLocalStorage } from "../../utils/utils";

const Header = () => {
  const [categories, setCategories] = useState({});
  const { showNotification } = useContext(NotificationContext);
  const dispatch = useDispatch();
  const { cartItems, status, error } = useSelector((state) => state.cart);
  const user = getLocalStorage("user");
  const token = getLocalStorage("accessToken");
  console.log(user);

  // Kiểm tra đăng nhập trước khi gọi API
  useEffect(() => {
    if (!token || !user || user.role !== "user") {
      return; // Không gọi API nếu chưa đăng nhập
    }

    dispatch(
      fetchCartProducts({
        userId: user.id_user,
        token: token,
      })
    );
  }, [dispatch, token, user?.id_user, showNotification]);

  // Hiển thị thông báo dựa trên trạng thái API
  useEffect(() => {
    if (status === "succeeded") {
    } else if (status === "failed") {
      showNotification(error || "Lỗi không xác định", "error", 2000);
    }
  }, [status, error, showNotification]);

  // Lấy danh mục sản phẩm
  useEffect(() => {
    danhMucService
      .getCategory()
      .then((res) => {
        // Lọc động các danh mục dựa trên từ khóa "Áo" và "Quần"
        const categorizedData = {
          Quần: res.data.data.filter((item) =>
            item.name.toLowerCase().includes("quần")
          ),
          Áo: res.data.data.filter((item) =>
            item.name.toLowerCase().includes("áo")
          ),
        };
        setCategories(categorizedData);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      })
      .finally(() => {
        console.log("Fetch categories completed");
      });
  }, []);

  return (
    <>
      <header className="flex fixed w-full z-50 bg-white justify-between items-center p-4 border-b">
        <Link to="/" className="text-3xl font-bold text-red-500">
          BAOANH
        </Link>
        <nav className="flex-1 flex justify-center items-center ml-32 space-x-4">
          <Link
            to={path.productPage}
            className="text-sm uppercase hover:underline"
          >
            <Dropdown
              dropdownRender={() => (
                <div className="bg-white rounded-lg shadow-lg p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(categories).map(([type, items]) => (
                      <div key={type}>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          {type}
                        </h4>
                        <ul className="space-y-2">
                          {items.map((item) => (
                            <Link
                              to={"/category/" + item.id_category}
                              key={item.id_category}
                              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer group"
                            >
                              <div>
                                <span className="text-gray-700">
                                  {item.name}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              placement="bottom"
              trigger={["hover"]}
            >
              <span className="flex items-center space-x-2 cursor-pointer py-3 lg:border-none border-b">
                <span className="font-medium">Sản phẩm</span>
                <DownOutlined style={{ fontSize: "12px" }} />
              </span>
            </Dropdown>
          </Link>

          <Link
            to={path.showRoom}
            className="text-sm uppercase hover:underline"
          >
            Showroom
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <FormSearchProductTwo />
          <div className="flex items-center space-x-2">
            <Link to={path.oderPage} className="relative">
              <i className="fas fa-shopping-cart"></i>

              {user && status === "succeeded" && cartItems.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <UserMenu
              to={path.logIn}
              iconStyle={{ fontSize: "20px", cursor: "pointer" }}
            />
          </div>
        </div>
      </header>
      <div className="h-20"></div>
    </>
  );
};

export default Header;
