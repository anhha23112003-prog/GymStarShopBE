import React, { useState, useEffect, useContext } from "react";
import InputCustom from "../../components/Input/InputCustom";
import { getLocalStorage } from "../../utils/utils";
import FormAddItem from "../../components/FormAddItem/FormAddItem";
import { authService } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { path } from "../../common/path";
import { NotificationContext } from "../../App";

const MyAccountPage = () => {
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const storedUser = getLocalStorage("user");
  const accessToken = getLocalStorage("accessToken");
  const id_user = storedUser?.id_user;

  const fetchUserInfo = () => {
    if (!accessToken) {
      showNotification("Vui lòng đăng nhập để truy cập", "error");
      navigate(path.logIn);
      return;
    }

    if (id_user) {
      authService
        .getUserInfo(id_user)
        .then((res) => {
          setUser(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching user info:", err.response?.data || err.message);
          showNotification(
            err.response?.data?.message || "Lỗi khi lấy thông tin người dùng",
            "error"
          );
          setLoading(false);
          if (err.response?.status === 401) {
            navigate(path.logIn);
          }
        });
    } else {
      showNotification("Không tìm thấy ID người dùng", "error");
      setLoading(false);
      navigate(path.logIn);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [id_user, navigate]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUpdateSuccess = (isPasswordChanged = false) => {
    if (isPasswordChanged) {
      showNotification(
        "Thay đổi mật khẩu thành công, trở về trang đăng nhập trong vòng 2s",
        "success"
      );
      setTimeout(() => {
        navigate(path.logIn);
      }, 2000);
    } else {
      fetchUserInfo();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Không tìm thấy thông tin người dùng</div>;
  }

  // Định dạng ngày thành DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="my-account-page p-3 sm:p-5 mx-auto bg-white rounded-2xl max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className=""></div>
        <button
          onClick={handleOpenModal}
          className="bg-black text-white font-semibold px-4 py-2 rounded-md w-full sm:w-auto hover:bg-gray-200 hover:text-black transition-colors"
        >
          Chỉnh sửa
        </button>
      </div>
      <hr className="my-5" />
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <InputCustom
            labelContent="Họ tên"
            id="view_fullname"
            name="fullname"
            placeholder="Nhập họ tên của bạn"
            value={user.fullname || ""}
            disabled={true}
          />
          <InputCustom
            labelContent="Email"
            id="view_email"
            name="email"
            typeInput="email"
            placeholder="example@gmail.com"
            value={user.email || ""}
            disabled={true}
          />
          <InputCustom
            labelContent="Số điện thoại"
            id="view_phone"
            name="phone"
            placeholder="Nhập số điện thoại"
            value={user.phone_number || ""}
            disabled={true}
          />
          <InputCustom
            labelContent="Ngày tạo"
            id="view_createdAt"
            name="createdAt"
            typeInput="text"
            placeholder="Ngày tạo tài khoản"
            value={formatDate(user.createdAt)}
            disabled={true}
          />
          <InputCustom
            labelContent="Địa chỉ"
            id="view_address"
            name="address"
            typeInput="text"
            placeholder="Địa chỉ của bạn"
            value={user.address || ""}
            disabled={true}
          />
          <div className="w-full col-span-1 md:col-span-2"></div>
        </div>
      </div>
      <FormAddItem
        isModalOpen={isModalOpen}
        handleCancel={handleCloseModal}
        onFinish={() => handleUpdateSuccess(true)}
        userData={user}
        onInfoUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default MyAccountPage;