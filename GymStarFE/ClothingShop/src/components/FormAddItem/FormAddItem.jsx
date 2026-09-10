import React, { useContext, useEffect, useState } from "react";
import { Modal } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import InputCustom from "../Input/InputCustom";
import { nguoiDungService } from "../../services/nguoiDung.service";
import { NotificationContext } from "../../App";
import "./FormAddItem.scss";

const FormAddItem = ({ isModalOpen, handleCancel, onFinish, userData, onInfoUpdateSuccess }) => {
  const { showNotification } = useContext(NotificationContext);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Email không được để trống"),
    phone_number: Yup.string()
      .matches(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số")
      .required("Số điện thoại không được để trống"),
    address: Yup.string()
      .required("Địa chỉ không được để trống")
      .matches(
        /^[\w\s\/,\.\-À-ỹà-ỹ]+$/,
        "Địa chỉ chỉ được chứa chữ cái, số, khoảng trắng, dấu /, ,, ., -, và ký tự tiếng Việt, không chứa ký tự đặc biệt khác"
      ),
    fullname: Yup.string()
      .required("Họ tên không được để trống")
      .matches(
        /^[A-Za-z\sÀ-ỹà-ỹ]+$/,
        "Họ tên chỉ được chứa chữ cái và khoảng trắng, không chứa số hoặc ký tự đặc biệt"
      ),
    currentPassword: Yup.string().test(
      "currentPassword-required-if-newPassword",
      "Mật khẩu hiện tại không được để trống nếu bạn nhập mật khẩu mới",
      function (value) {
        const { newPassword } = this.parent;
        if (newPassword && !value) {
          return false;
        }
        return true;
      }
    ),
    newPassword: Yup.string()
      .test(
        "newPassword-required-if-currentPassword",
        "Mật khẩu mới không được để trống nếu bạn nhập mật khẩu hiện tại",
        function (value) {
          const { currentPassword } = this.parent;
          if (currentPassword && !value) {
            return false;
          }
          return true;
        }
      )
      .test(
        "newPassword-alphanumeric",
        "Mật khẩu mới chỉ được chứa chữ cái hoặc số, không chứa ký tự đặc biệt",
        function (value) {
          if (!value) return true;
          return /^[A-Za-z0-9]*$/.test(value);
        }
      )
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
      .notRequired(),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      phone_number: "",
      address: "",
      fullname: "",
      createAt: "",
      currentPassword: "",
      newPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (userData) {
        if (values.currentPassword && values.newPassword) {
          nguoiDungService
            .changePassword({
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            })
            .then((res) => {
              showNotification("Thay đổi mật khẩu thành công", "success");
              setTimeout(() => {
                handleCancel();
                onFinish();
              }, 1000);
            })
            .catch((err) => {
              showNotification(
                err.response?.data?.message || "Lỗi khi thay đổi mật khẩu",
                "error"
              );
            });
        } else {
          nguoiDungService
            .updateInfoUser({
              email: values.email,
              phone_number: values.phone_number,
              address: values.address,
              fullname: values.fullname,
            })
            .then((res) => {
              showNotification("Cập nhật người dùng thành công", "success");
              setTimeout(() => {
                handleCancel();
                if (onInfoUpdateSuccess) {
                  onInfoUpdateSuccess(false);
                }
              }, 1000);
            })
            .catch((err) => {
              showNotification(
                err.response?.data?.message || "Lỗi khi cập nhật thông tin",
                "error"
              );
            });
        }
      }
    },
  });

  useEffect(() => {
    if (userData) {
      formik.setValues({
        ...userData,
        currentPassword: "",
        newPassword: "",
      });
    } else {
      formik.resetForm();
    }
  }, [userData, isModalOpen]);

  const handleTogglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    formik.setFieldValue("currentPassword", "");
    formik.setFieldValue("newPassword", "");
  };

  return (
    <Modal
      title={userData ? "Cập nhật người dùng" : "Thêm người dùng"}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      centered
    >
      <form onSubmit={formik.handleSubmit}>
        <InputCustom
          labelContent="Họ tên"
          id={`edit_fullname`}
          name="fullname"
          placeholder="Nhập họ tên"
          classWrapper="mb-4"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.fullname}
          error={formik.errors.fullname}
          touched={formik.touched.fullname}
        />

        <InputCustom
          labelContent="Email"
          id={`edit_email`}
          name="email"
          placeholder="Nhập email"
          typeInput="email"
          classWrapper="mb-4"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          error={formik.errors.email}
          touched={formik.touched.email}
        />

        <InputCustom
          labelContent="Số điện thoại"
          id={`edit_phone_number`}
          name="phone_number"
          placeholder="Nhập số điện thoại"
          classWrapper="mb-4"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.phone_number}
          error={formik.errors.phone_number}
          touched={formik.touched.phone_number}
        />

        <InputCustom
          labelContent="Địa chỉ"
          id={`edit_address`}
          name="address"
          placeholder="Nhập địa chỉ"
          typeInput="text"
          classWrapper="mb-4"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.address}
          error={formik.errors.address}
          touched={formik.touched.address}
        />

        {userData && (
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPasswordFields}
                onChange={handleTogglePasswordFields}
                className="mr-2"
              />
              <span>Thay đổi mật khẩu</span>
            </label>

            {showPasswordFields && (
              <>
                <InputCustom
                  labelContent="Mật khẩu hiện tại"
                  id={`edit_currentPassword`}
                  name="currentPassword"
                  placeholder="Nhập mật khẩu hiện tại"
                  typeInput="password"
                  classWrapper="mb-4"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.currentPassword}
                  error={formik.errors.currentPassword}
                  touched={formik.touched.currentPassword}
                />

                <InputCustom
                  labelContent="Mật khẩu mới"
                  id={`edit_newPassword`}
                  name="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  typeInput="password"
                  classWrapper="mb-4"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.newPassword}
                  error={formik.errors.newPassword}
                  touched={formik.touched.newPassword}
                />
              </>
            )}
          </div>
        )}

        <div className="text-right">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-200 hover:text-black transition-colors"
          >
            {userData ? "Cập nhật" : "Thêm"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-black text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-200 hover:text-black transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FormAddItem;