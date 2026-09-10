import React, { useContext } from "react";
import InputCustom from "../../components/Input/InputCustom";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../../common/path";
import { useFormik } from "formik";
import * as yup from "yup";
import { authService } from "../../services/auth.service";
import { NotificationContext } from "../../App";
import { setLocalStorage } from "../../utils/utils";

const LoginPage = () => {
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const { handleSubmit, handleChange, values, errors, touched, handleBlur } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
      },
      validationSchema: yup.object({
        email: yup
          .string()
          .required("Email không được để trống")
          .email("Email không đúng định dạng"),
        password: yup.string().required("Mật khẩu không được để trống"),
      }),
      onSubmit: (values) => {
        authService
          .logIn(values)
          .then((res) => {
            const { user, accessToken } = res.data.data;
            console.log("Login success, accessToken:", accessToken); // Debug token
            console.log("User data:", user);

            // Lưu user và accessToken vào localStorage
            setLocalStorage("user", user);
            setLocalStorage("accessToken", accessToken);

            showNotification("Đăng nhập thành công", "success");
            setTimeout(() => {
              navigate(path.homePage);
            }, 2000);
          })
          .catch((err) => {
            console.error("Login Error:", err.response?.data || err.message);
            showNotification(
              err.response?.data?.message || "Đăng nhập thất bại",
              "error"
            );
          });
      },
    });

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b">
        <Link to="/" className="text-3xl font-bold text-red-500">
          BAOANH
        </Link>
        <nav className="space-x-4">
          <a href="#" className="text-sm uppercase hover:underline">
            Hàng Mới
          </a>
          <a href="#" className="text-sm uppercase hover:underline">
            Sản Phẩm
          </a>
          <a href="#" className="text-sm uppercase hover:underline">
            Showroom
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <div className="form-login flex items-center justify-center min-h-screen bg-white">
        <div className="relative w-full max-w-[500px] p-4 md:p-8 bg-white/90 border border-gray-300 rounded-lg shadow-md backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <InputCustom
              labelContent="Email"
              placeholder="Nhập email của bạn"
              typeInput="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
            />
            <InputCustom
              labelContent="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              typeInput="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
            />
            <div className="flex justify-end"></div>

            <button
              type="submit"
              className="w-full bg-black text-white font-semibold py-2 rounded-lg hover:bg-gray-200 hover:text-black transition-colors"
            >
              Đăng nhập
            </button>
            <div className="text-center space-x-2 mt-2">
              <span>Bạn chưa có tài khoản?</span>
              <Link
                to={path.signUp}
                className="font-bold text-blue-500 hover:underline"
              >
                Đăng ký
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-4 text-sm">
          <div>
            <h3 className="font-bold mb-2">
              Gọi Mua Hàng Online (08:00 - 21:00 mỗi ngày)
            </h3>
            <p className="text-xl font-bold text-blue-500">1800 1162</p>
            <p>Tất cả các ngày trong tuần (Trừ Tết Âm Lịch)</p>
            <h3 className="font-bold mt-4">
              Góp Ý & Khiếu Nại (08:30 - 20 Biblicaly, các ngày trong tuần (Trừ Tết Âm Lịch)
            </h3>
            <p className="text-xl font-bold text-blue-500">1800 1160</p>
            <p>Tất cả các ngày trong tuần (Trừ Tết Âm Lịch)</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Hệ Thống Showroom</h3>
            <img
              src="https://via.placeholder.com/200x150"
              alt="Showroom"
              className="w-full h-32 object-cover"
            />
            <a href="#" className="text-blue-500 hover:underline">
              Xem địa chỉ hệ thống showroom →
            </a>
          </div>
          <div>
            <h3 className="font-bold mb-2">Fanpage Của Chúng Tôi</h3>
            <img
              src="https://via.placeholder.com/200x100"
              alt="Fanpage"
              className="w-full h-20 object-cover"
            />
            <div className="flex space-x-2 mt-2">
              <a href="#" className="text-blue-500">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-pink-500">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-red-500">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="text-black">
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </div>
          <div></div>
        </div>
        <div className="max-w-6xl mx-auto mt-4 flex justify-between text-sm">
          <div>
            <a href="#" className="text-gray-600 hover:underline">
              Hỗ Trợ Khách Hàng →
            </a>
            <span className="mx-2">|</span>
            <a href="#" className="text-gray-600 hover:underline">
              Về BAOANH →
            </a>
          </div>
          <p className="text-gray-600">
            © 2019 BAOANH. Công ty Cổ Phần - SX - TM - DV BAOANH
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;