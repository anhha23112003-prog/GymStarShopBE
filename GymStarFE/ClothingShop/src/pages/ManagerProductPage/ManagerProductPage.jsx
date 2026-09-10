import React, { useContext, useEffect, useState, useCallback } from "react";
import { Space, Table, Image, Select, Spin, Modal } from "antd";
import { NotificationContext } from "../../App";
import FormSearchProduct from "../../components/FormSearchProduct/FormSearchProduct";
import { sanPhamService } from "../../services/sanPham.service";
import FormAddProduct from "../../components/FormAddItem/FormAddProduct";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { getLocalStorage } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const ManagerProductPage = () => {
  const [products, setProducts] = useState([]);
  const [tempData, setTempData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { showNotification } = useContext(NotificationContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      let selectedCategoryId = null;
      if (selectedCategory) {
        const selectedCategoryObj = categories.find(
          (cat) => cat.name === selectedCategory
        );
        if (selectedCategoryObj) {
          selectedCategoryId = selectedCategoryObj.id_category;
          params.id_category = selectedCategoryId;
        }
      }

      let apiCall;
      if (searchKeyword) {
        apiCall = sanPhamService.searchProducts(searchKeyword, params);
      } else if (selectedCategoryId) {
        apiCall = sanPhamService.getProductByCategory(selectedCategoryId, params);
      } else {
        apiCall = sanPhamService.getPaginatedData(params);
      }

      const res = await apiCall;
      const products = Array.isArray(res.data.data) ? res.data.data : [];
      setTempData(products);
      setTotalItems(res.data.pagination?.totalItems || products.length);

      showNotification(
        searchKeyword
          ? products.length === 0
            ? "Không tìm thấy sản phẩm phù hợp với từ khóa"
            : "Tìm kiếm sản phẩm thành công"
          : "Lấy dữ liệu sản phẩm thành công",
        products.length === 0 && searchKeyword ? "warning" : "success"
      );
    } catch (err) {
      console.error("API Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.data?.message || "Không thể tìm kiếm sản phẩm";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getLocalStorage("user");
    const accessToken = getLocalStorage("accessToken");

    if (!user || !accessToken) {
      showNotification("Vui lòng đăng nhập để truy cập", "error");
      navigate("/log-in");
      return;
    }

    if (user.role !== "admin") {
      showNotification("Bạn không có quyền truy cập trang này", "error");
      navigate("/");
      return;
    }

    sanPhamService
      .getAllCategory()
      .then((res) => {
        setCategories(res.data.data || []);
      })
      .catch((err) => {
        showNotification(
          err.response?.data?.message || "Lỗi khi lấy danh mục",
          "error"
        );
      });

    fetchProducts();
  }, [currentPage, pageSize, searchKeyword, selectedCategory, navigate]);

  useEffect(() => {
    if (!loading) {
      setProducts(tempData);
    }
  }, [tempData, loading, currentPage]);

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      const trimmedSearchTerm = searchTerm?.trim();
      setSearchKeyword(trimmedSearchTerm || "");
      setCurrentPage(1);
      setTotalItems(0);
    }, 500),
    []
  );

  const handleSearch = (searchTerm) => {
    debouncedSearch(searchTerm);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi danh mục
  };

  const showModal = (product = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = () => {
    fetchProducts();
  };

  const handleTableChange = (pagination) => {
    if (
      pagination.current !== currentPage ||
      pagination.pageSize !== pageSize
    ) {
      setCurrentPage(pagination.current);
      setPageSize(pagination.pageSize);
    }
  };

  const handleImagePreview = (thumbnail) => {
    let thumbnailUrls = [];
    if (thumbnail) {
      try {
        thumbnailUrls =
          typeof thumbnail === "string"
            ? JSON.parse(thumbnail)
            : Array.isArray(thumbnail)
            ? thumbnail
            : [thumbnail];
      } catch (e) {
        console.error("Error parsing thumbnail:", e);
        thumbnailUrls = Array.isArray(thumbnail) ? thumbnail : [thumbnail];
      }
    }
    setPreviewImages(thumbnailUrls);
    setIsImageModalOpen(true);
  };

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "id_product",
      key: "id_product",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "title",
      key: "title",
      align: "center",
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (price) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "center",
      render: (discount) => `${discount.toLocaleString()} %`,
    },
    {
      title: "Kích thước",
      dataIndex: "size",
      key: "size",
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "gallery",
      key: "gallery",
      align: "center",
      render: (gallery) => {
        let thumbnailUrls = [];
        if (gallery?.thumbnail) {
          try {
            thumbnailUrls =
              typeof gallery.thumbnail === "string"
                ? JSON.parse(gallery.thumbnail)
                : Array.isArray(gallery.thumbnail)
                ? gallery.thumbnail
                : [gallery.thumbnail];
          } catch (e) {
            console.error("Error parsing thumbnail:", e);
            thumbnailUrls = Array.isArray(gallery.thumbnail)
              ? gallery.thumbnail
              : [gallery.thumbnail];
          }
        }
        const previewImage =
          thumbnailUrls[0] ||
          "https://via.placeholder.com/100x75?text=No+Image";
        return (
          <div className="flex justify-center">
            <Image
              style={{ objectFit: "cover", cursor: "pointer" }}
              height={75}
              width={100}
              alt="preview-image"
              src={previewImage}
              onClick={() => handleImagePreview(gallery?.thumbnail)}
              fallback="https://via.placeholder.com/100x75?text=No+Image"
            />
          </div>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      align: "center",
      render: (category) => category?.name || "N/A",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (description) => {
        let descriptionItems = [];

        if (Array.isArray(description) && description.length > 0) {
          descriptionItems = description;
        } else if (typeof description === "string" && description.trim()) {
          descriptionItems = description
            .split(/\.|,|(?<!\d)\n/)
            .filter(Boolean)
            .map((item) => item.trim());
        }

        if (descriptionItems.length > 0) {
          return (
            <ul>
              {descriptionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          );
        }
        return "Không có mô tả";
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (created_at) =>
        created_at ? format(new Date(created_at), "dd/MM/yyyy HH:mm") : "N/A",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      align: "center",
      render: (updated_at) =>
        updated_at ? format(new Date(updated_at), "dd/MM/yyyy HH:mm") : "N/A",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" className="space-x-3">
          <button
            className="bg-black text-white py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
            onClick={() => {
              showModal(record);
            }}
          >
            Sửa
          </button>
          <button
            onClick={() => {
              sanPhamService
                .deleteProduct(record.id_product)
                .then((res) => {
                  showNotification("Xóa sản phẩm thành công", "success");
                  onFinish();
                })
                .catch((err) => {
                  console.error(
                    "Delete Product Error:",
                    err.response?.data || err.message
                  );
                  showNotification(
                    err.response?.data?.message || "Lỗi xóa sản phẩm",
                    "error"
                  );
                });
            }}
            className="bg-black text-white py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
          >
            Xóa
          </button>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-max-[1000px]">
      <div className="mb-4 flex justify-between items-center">
        <FormSearchProduct
          className="mx-0"
          title="Tìm kiếm sản phẩm (nhập thông tin sản phẩm)..."
          onSearch={handleSearch}
        />
        <div className="flex items-center space-x-3">
          <Select
            placeholder="Chọn danh mục"
            style={{ width: 200 }}
            onChange={handleCategoryChange}
            value={selectedCategory}
            allowClear
          >
            {categories.map((category) => (
              <Option key={category.id_category} value={category.name}>
                {category.name}
              </Option>
            ))}
          </Select>
          <button
            onClick={() => {
              showModal();
            }}
            className="bg-black text-white font-semibold rounded-md py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
          >
            Thêm sản phẩm
          </button>
        </div>
      </div>

      <FormAddProduct
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        onFinish={onFinish}
        productData={selectedProduct}
      />

      <Modal
        title="Xem tất cả hình ảnh"
        open={isImageModalOpen}
        onCancel={() => setIsImageModalOpen(false)}
        footer={null}
        width={1100}
        centered
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {previewImages.length > 0 ? (
            previewImages.map((url, index) => (
              <Image
                key={index}
                style={{ objectFit: "cover" }}
                height={270}
                width={500}
                alt={`image-${index}`}
                src={url}
                fallback="https://via.placeholder.com/300x200?text=No+Image"
              />
            ))
          ) : (
            <p>Không có hình ảnh để hiển thị</p>
          )}
        </div>
      </Modal>

      <Spin spinning={loading}>
        <Table
          className="w-full max-w-full overflow-hidden"
          columns={columns}
          dataSource={products}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
          }}
          onChange={handleTableChange}
        />
      </Spin>
    </div>
  );
};

export default ManagerProductPage;