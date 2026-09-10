import React, { useContext, useEffect, useState, useRef } from "react";
import { Modal } from "antd";
import { useFormik } from "formik";
import InputCustom from "../Input/InputCustom";
import { NotificationContext } from "../../App";
import { hinhAnhService } from "../../services/hinhAnh.service";

const FormAddGallery = ({ isModalOpen, handleCancel, onFinish, galleryData }) => {
  const { showNotification } = useContext(NotificationContext);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      files: [],
    },
    onSubmit: (values) => {
      console.log("Submitting form with values:", values);
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.files && values.files.length > 0) {
        values.files.forEach((file) => {
          formData.append("thumbnail", file);
        });
      }

      const serviceCall = galleryData
        ? () => hinhAnhService.updateGallery(galleryData.id_gallery, formData)
        : () => hinhAnhService.addGallery(formData);

      serviceCall()
        .then((res) => {
          console.log("API Response:", res.data);
          showNotification(
            galleryData
              ? "Cập nhật gallery thành công"
              : "Thêm gallery thành công",
            "success"
          );
          setTimeout(() => {
            handleCancel();
            onFinish();
          }, 1000);
        })
        .catch((err) => {
          console.error("API Error:", err.response?.data);
          showNotification(err.response?.data?.message || "Lỗi xử lý", "error");
        });
    },
  });

  useEffect(() => {
    if (galleryData) {
      console.log("Gallery Data:", galleryData);
      formik.setValues({
        name: galleryData.name || "",
        files: [],
      });
      if (galleryData.thumbnail?.length) {
        const thumbnails = typeof galleryData.thumbnail === "string"
          ? JSON.parse(galleryData.thumbnail)
          : galleryData.thumbnail;
        setImagePreviews(thumbnails || []);
      } else {
        setImagePreviews([]);
      }
    } else {
      formik.resetForm();
      setImagePreviews([]);
    }
  }, [galleryData, isModalOpen]);

  const handleFileChange = (event) => {
    const files = Array.from(event.currentTarget.files);
    console.log("Selected files:", files);

    // Danh sách định dạng file hợp lệ
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const invalidFiles = files.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      return !allowedExtensions.includes(`.${ext}`);
    });

    if (invalidFiles.length > 0) {
      showNotification(
        "Định dạng file không hợp lệ, chỉ cho phép upload file có đuôi .jpg, .jpeg, .png",
        "error"
      );
      // Reset input file và preview
      formik.setFieldValue("files", []);
      setImagePreviews([]);
      event.target.value = null; // Reset giá trị input file
      return;
    }

    if (files.length > 0) {
      formik.setFieldValue("files", files);
      const previews = files.map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });
      });
      Promise.all(previews).then((results) => setImagePreviews(results));
    } else {
      formik.setFieldValue("files", []);
      setImagePreviews([]);
    }
  };

  return (
    <Modal
      title={galleryData ? "Cập nhật Gallery" : "Thêm Gallery"}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <InputCustom
            labelContent="Tên Gallery"
            id="name"
            name="name"
            placeholder="Nhập tên gallery"
            classWrapper="mb-4 col-span-2"
            onChange={formik.handleChange}
            value={formik.values.name}
          />
          <div className="mb-4 col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Hình ảnh
            </label>
            <input
              type="file"
              name="thumbnail"
              ref={fileInputRef}
              multiple
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={handleFileChange}
            />
            {imagePreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {imagePreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-32 h-32 object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-right mt-4">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-200 hover:text-black transition-colors"
          >
            {galleryData ? "Cập nhật" : "Thêm"}
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

export default FormAddGallery;