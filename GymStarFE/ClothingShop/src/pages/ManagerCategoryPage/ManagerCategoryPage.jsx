import React, { useEffect, useState, useContext } from "react";
import { Table, Space } from "antd";
import { danhMucService } from "../../services/danhMuc.service";
import { NotificationContext } from "../../App";
import FormAddCategory from "../../components/FormAddItem/FormAddCategory";
import FormSearchCategory from "../../components/FormSearchProduct/FormSearchProduct";
import { removeVietnameseTones } from "../../utils/removeVietnameseTones";
import { getLocalStorage } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

const ManagerCategory = () => {
  const [categories, setCategories] = useState([]);
  const { showNotification } = useContext(NotificationContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

    fetchCategories();
  }, [navigate]);

  const fetchCategories = () => {
    setIsLoading(true);
    danhMucService
      .getCategory()
      .then((res) => {
        const mappedData = res.data.data.map((item) => ({
          id_category: item.id_category,
          name: item.name,
        }));
        setCategories(mappedData);
        setFilteredCategories(mappedData);
        showNotification("Lấy dữ liệu danh mục thành công", "success");
      })
      .catch((err) => {
        console.error("Get Categories Error:", err.response?.data || err.message);
        showNotification(
          err.response?.data?.message || "Lấy dữ liệu danh mục thất bại",
          "error"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const columns = [
    {
      title: "Mã danh mục",
      dataIndex: "id_category",
      key: "id_category",
      align: "center",
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
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
              danhMucService
                .deleteCategory(record.id_category)
                .then((res) => {
                  showNotification("Xóa danh mục thành công", "success");
                  fetchCategories();
                })
                .catch((err) => {
                  console.error("Delete Category Error:", err.response?.data || err.message);
                  showNotification(
                    err.response?.data?.message || "Xóa danh mục thất bại",
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

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const showModal = (category = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSearch = (term) => {
    const normalizedTerm = removeVietnameseTones(term).toLowerCase().trim();
    const filtered = categories.filter((category) =>
      removeVietnameseTones(category.name)
        .toLowerCase()
        .includes(normalizedTerm)
    );
    setFilteredCategories(filtered);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <FormSearchCategory
          title="Tìm kiếm danh mục (nhập tên danh mục)..."
          onSearch={handleSearch}
          className="mx-0"
        />
        <button
          onClick={() => showModal()}
          className="bg-black text-white font-semibold rounded-md py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
        >
          Thêm danh mục
        </button>
      </div>

      <FormAddCategory
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        categoryData={selectedCategory}
        onFinish={fetchCategories}
      />

      <Table
        columns={columns}
        dataSource={filteredCategories}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredCategories.length,
        }}
        onChange={handleTableChange}
        loading={isLoading}
      />
    </div>
  );
};

export default ManagerCategory;