import React, { useContext, useEffect, useState, useRef } from "react";
import { Modal, Spin, Select, Image } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import InputCustom from "../Input/InputCustom";
import { sanPhamService } from "../../services/sanPham.service";
import { hinhAnhService } from "../../services/hinhAnh.service";
import { NotificationContext } from "../../App";
import { danhMucService } from "../../services/danhMuc.service";

const { Option } = Select;

// Schema xác thực khớp với yêu cầu API
const validationSchema = Yup.object({
  title: Yup.string()
    .required("Tên sản phẩm không được để trống")
    .max(255, "Tên sản phẩm không được vượt quá 255 ký tự"),
  price: Yup.number()
    .required("Giá tiền không được để trống")
    .min(1000, "Giá tối thiểu là 1,000"),
  discount: Yup.number()
    .nullable() // Cho phép để trống
    .transform((value, originalValue) => (originalValue === "" ? null : value)) // Chuyển "" thành null
    .min(0, "Giảm giá không được nhỏ hơn 0")
    .max(99, "Giảm giá phải nhỏ hơn 100")
    .typeError("Giảm giá phải là số"),
  size: Yup.string().required("Kích thước không được để trống"),
  description: Yup.string()
    .required("Mô tả là bắt buộc")
    .max(1000, "Mô tả không được vượt quá 1000 ký tự"),
  id_category: Yup.string().required("Danh mục không được để trống"),
  id_gallery: Yup.string().required("Gallery không được để trống"),
});

const FormAddProduct = ({
  isModalOpen,
  handleCancel,
  onFinish,
  productData,
}) => {
  const { showNotification } = useContext(NotificationContext);
  const [categories, setCategories] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      id_product: "",
      id_category: "",
      id_gallery: "",
      title: "",
      price: "",
      discount: "",
      size: "",
      description: "",
      file: null,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      await formik.setTouched({
        title: true,
        price: true,
        discount: true,
        size: true,
        description: true,
        id_category: true,
        id_gallery: true,
      });

      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        showNotification("Vui lòng sửa các lỗi trước khi gửi", "error");
        setLoading(false);
        return;
      }

      // Kiểm tra description là chuỗi trước khi gửi
      if (typeof values.description !== "string") {
        showNotification("Mô tả phải là chuỗi văn bản", "error");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("id_category", values.id_category);
      formData.append("id_gallery", values.id_gallery);
      formData.append("title", values.title);
      formData.append("price", values.price);
      if (values.discount !== "" && values.discount !== null) {
        formData.append("discount", values.discount);
      }
      formData.append("size", values.size);
      formData.append("description", values.description);

      console.log("Submitting description:", values.description);

      const serviceCall = productData
        ? () => sanPhamService.updateProduct(productData.id_product, formData)
        : () => sanPhamService.addProduct(formData);

      serviceCall()
        .then((res) => {
          showNotification(
            productData
              ? "Cập nhật sản phẩm thành công"
              : "Thêm sản phẩm thành công",
            "success"
          );
          setTimeout(() => {
            handleCancel();
            onFinish();
            formik.resetForm();
            setImagePreviews([]);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }, 1000);
        })
        .catch((err) => {
          console.log("API Error:", err.response);
          const errorMessage =
            err.response?.data?.message || err.message || "Lỗi xử lý";
          showNotification(errorMessage, "error");
        })
        .finally(() => setLoading(false));
    },
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      danhMucService.getCategory(),
      hinhAnhService.getPaginatedData({ limit: 100 }),
    ])
      .then(([categoryRes, galleryRes]) => {
        setCategories(categoryRes.data.data || []);
        setGalleries(galleryRes.data.data || []);
        console.log("Loaded Categories:", categoryRes.data.data);
        console.log("Loaded Galleries:", galleryRes.data.data);
      })
      .catch((err) => {
        showNotification("Lấy dữ liệu thất bại", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (productData) {
      formik.setValues({
        id_product: productData.id_product || "",
        id_category: productData.id_category || "",
        id_gallery: productData.id_gallery || "",
        title: productData.title || "",
        price: productData.price || "",
        discount: productData.discount !== null ? productData.discount : "",
        size: productData.size || "",
        description: Array.isArray(productData.description)
          ? productData.description.join(". ")
          : productData.description || "",
        file: null,
      });
      if (productData.gallery?.thumbnail?.length) {
        const thumbnails = Array.isArray(productData.gallery.thumbnail)
          ? productData.gallery.thumbnail
          : JSON.parse(productData.gallery.thumbnail);
        setImagePreviews(thumbnails);
      } else {
        setImagePreviews([]);
      }
    } else {
      formik.resetForm();
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [productData, isModalOpen]);

  const handleGalleryChange = (value) => {
    formik.setFieldValue("id_gallery", value);
    const selectedGallery = galleries.find((g) => g.id_gallery === value);
    if (selectedGallery) {
      const thumbnails = Array.isArray(selectedGallery.thumbnail)
        ? selectedGallery.thumbnail
        : JSON.parse(selectedGallery.thumbnail);
      setImagePreviews(thumbnails.length ? thumbnails : []);
    } else {
      setImagePreviews([]);
    }
  };

  return (
    <Modal
      title={productData ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
    >
      <Spin spinning={loading}>
        <form onSubmit={formik.handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-2">
            <InputCustom
              labelContent="Tên sản phẩm"
              id="title"
              name="title"
              placeholder="Nhập tên sản phẩm (VD: Áo sơ mi đen)"
              classWrapper="mb-2"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.title}
              error={formik.errors.title}
              touched={formik.touched.title}
            />
            <InputCustom
              labelContent="Giá tiền (VND)"
              id="price"
              name="price"
              placeholder="Nhập giá tiền (VD: 360000)"
              classWrapper="mb-2"
              typeInput="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.price}
              error={formik.errors.price}
              touched={formik.touched.price}
            />
            <InputCustom
              labelContent="Giảm giá (%)"
              id="discount"
              name="discount"
              placeholder="Nhập mức giảm giá (VD: 10, để trống nếu không có)"
              classWrapper="mb-2"
              typeInput="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.discount}
              error={formik.errors.discount}
              touched={formik.touched.discount}
            />
            <div className="mb-2">
              <label className="block mb-1 text-sm font-medium text-gray-900">
                Kích thước
              </label>
              <Select
                name="size"
                placeholder="Chọn kích thước"
                className="w-full"
                onChange={(value) => formik.setFieldValue("size", value)}
                onBlur={formik.handleBlur}
                value={formik.values.size}
              >
                {["S", "M", "L", "XL", "XXL"].map((size) => (
                  <Option key={size} value={size}>
                    {size}
                  </Option>
                ))}
              </Select>
              {formik.touched.size && formik.errors.size && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.size}
                </div>
              )}
            </div>
            <div className="mb-2">
              <InputCustom
                labelContent="Mô tả"
                id="description"
                name="description"
                placeholder="Nhập mô tả sản phẩm"
                classWrapper="mb-2"
                typeInput="textarea"
                rows={3}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
                error={formik.errors.description}
                touched={formik.touched.description}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 text-sm font-medium text-gray-900">
                Danh mục
              </label>
              <Select
                name="id_category"
                placeholder="Chọn danh mục"
                className="w-full"
                onChange={(value) => formik.setFieldValue("id_category", value)}
                onBlur={formik.handleBlur}
                value={formik.values.id_category}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {categories.map((category) => (
                  <Option
                    key={category.id_category}
                    value={category.id_category}
                  >
                    {category.name}
                  </Option>
                ))}
              </Select>
              {formik.touched.id_category && formik.errors.id_category && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.id_category}
                </div>
              )}
            </div>
            <div className="mb-2">
              <label className="block mb-1 text-sm font-medium text-gray-900">
                Gallery
              </label>
              <Select
                name="id_gallery"
                placeholder="Chọn gallery"
                className="w-full"
                onChange={handleGalleryChange}
                onBlur={formik.handleBlur}
                value={formik.values.id_gallery}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {galleries.map((gallery) => (
                  <Option key={gallery.id_gallery} value={gallery.id_gallery}>
                    {`${gallery.id_gallery} - ${gallery.name}`}
                  </Option>
                ))}
              </Select>
              {formik.touched.id_gallery && formik.errors.id_gallery && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.id_gallery}
                </div>
              )}
            </div>
            <div className="mb-2 col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-900">
                Hình ảnh
              </label>
              {imagePreviews.length > 0 ? (
                <div className="flex space-x-2 overflow-x-auto">
                  {imagePreviews.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      width={400}
                      height={220}
                      className="object-cover rounded"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">
                  Chưa chọn gallery hoặc gallery không có ảnh
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              type="submit"
              className="bg-black text-white py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
              disabled={loading}
            >
              {productData ? "Cập nhật" : "Thêm"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-black text-white py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>
      </Spin>
    </Modal>
  );
};

export default FormAddProduct;