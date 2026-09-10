import React, { useContext, useEffect } from "react";
import { Modal } from "antd";
import { useFormik } from "formik";
import InputCustom from "../Input/InputCustom";
import { danhMucService } from "../../services/danhMuc.service";
import { NotificationContext } from "../../App";
import * as Yup from "yup";

const FormAddCategory = ({
  isModalOpen,
  handleCancel,
  onFinish,
  categoryData,
}) => {
  const { showNotification } = useContext(NotificationContext);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Vui lòng nhập tên danh mục")
      .max(255, "Tên danh mục không được vượt quá 255 ký tự"),
  });

  const formik = useFormik({
    initialValues: {
      id_category: "",
      name: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const payload = { name: values.name.trim() };
      if (categoryData) {
        // Cập nhật danh mục
        danhMucService
          .updateCategory(categoryData.id_category, payload)
          .then((res) => {
            showNotification("Cập nhật danh mục thành công", "success");
            setTimeout(() => {
              handleCancel();
              onFinish();
            }, 1000);
          })
          .catch((err) => {
            showNotification(err.response?.data?.message || "Cập nhật danh mục thất bại", "error");
          });
      } else {
        // Thêm mới danh mục
        danhMucService
          .addCategory(payload)
          .then((res) => {
            showNotification("Thêm danh mục thành công", "success");
            setTimeout(() => {
              handleCancel();
              onFinish();
            }, 1000);
          })
          .catch((err) => {
            showNotification(err.response?.data?.message || "Thêm danh mục thất bại", "error");
          });
      }
    },
  });

  useEffect(() => {
    if (categoryData) {
      formik.setValues({
        id_category: categoryData.id_category,
        name: categoryData.name,
      });
    } else {
      formik.resetForm();
    }
  }, [categoryData]);

  return (
    <Modal
      title={categoryData ? "Cập nhật danh mục" : "Thêm danh mục"}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
         
          <InputCustom
            labelContent="Tên danh mục"
            id="name"
            name="name"
            placeholder="Nhập tên danh mục"
            classWrapper="mb-4"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            error={formik.touched.name && formik.errors.name}
          />
        </div>

        <div className="text-right mt-4">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-200 hover:text-black transition-colors"
          >
            {categoryData ? "Cập nhật" : "Thêm"}
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

export default FormAddCategory;