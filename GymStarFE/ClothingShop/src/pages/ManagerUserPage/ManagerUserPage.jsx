import React, { useContext, useEffect, useState, useCallback } from "react";
import { Space, Table, Spin } from "antd";
import { NotificationContext } from "../../App";
import { nguoiDungService } from "../../services/nguoiDung.service";
import FormSearchUser from "../../components/FormSearchUser/FormSearchUser";
import FormAddItem from "../../components/FormAddItem/FormAddItem";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { getLocalStorage } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import "./ManagerUser.scss";

const ManagerUserPage = () => {
  const [users, setUsers] = useState([]);
  const [tempData, setTempData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const { showNotification } = useContext(NotificationContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      if (selectedRole && selectedRole !== "Tất cả") {
        params.role = selectedRole;
      }

      const apiCall = searchKeyword
        ? nguoiDungService.searchUsers(searchKeyword, params)
        : nguoiDungService.getPaginatedData(params);

      const res = await apiCall;
      console.log("API Response:", res.data);

      const users = Array.isArray(res.data.data) ? res.data.data : [];
      setTempData(users);
      setTotalItems(res.data.pagination?.totalItems || users.length);

      showNotification(
        searchKeyword
          ? users.length === 0
            ? "Không tìm thấy người dùng phù hợp với từ khóa"
            : "Tìm kiếm người dùng thành công"
          : "Lấy dữ liệu người dùng thành công",
        users.length === 0 && searchKeyword ? "warning" : "success"
      );
    } catch (err) {
      console.error("API Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.data?.message || "Không thể tìm kiếm người dùng";
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

    fetchUsers();
  }, [currentPage, pageSize, selectedRole, searchKeyword, navigate]);

  useEffect(() => {
    if (!loading) {
      setUsers(tempData);
    }
  }, [tempData, loading, currentPage]);

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      const trimmedSearchTerm = searchTerm?.trim();
      console.log("Debounced Search Term:", trimmedSearchTerm);
      setSearchKeyword(trimmedSearchTerm || "");
      setCurrentPage(1);
    }, 500),
    []
  );

  const handleSearch = (searchTerm) => {
    console.log("Raw Search Term:", searchTerm);
    debouncedSearch(searchTerm);
  };

  const handleCancel = () => setIsModalOpen(false);

  const onFinish = () => {
    fetchUsers();
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

  const columns = [
    {
      title: <div className="text-center">Mã người dùng</div>,
      dataIndex: "id_user",
      key: "id_user",
      align: "center",
    },
    {
      title: <div className="text-center">Họ tên</div>,
      dataIndex: "fullname",
      key: "fullname",
      align: "center",
    },
    {
      title: <div className="text-center">Email</div>,
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: <div className="text-center">Số điện thoại</div>,
      dataIndex: "phone_number",
      key: "phone_number",
      align: "center",
    },
    {
      title: <div className="text-center">Địa chỉ</div>,
      dataIndex: "address",
      key: "address",
      align: "center",
    },
    {
      title: <div className="text-center">Ngày tạo</div>,
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (createdAt) => format(new Date(createdAt), "dd/MM/yyyy HH:mm"),
    },
  ];

  return (
    <div className="w-max-[1000px]">
      <div className="mb-4 flex justify-between">
        <FormSearchUser
          className="mx-0"
          title="Tìm kiếm người dùng (nhập thông tin người dùng)..."
          onSearch={handleSearch}
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white font-semibold rounded-md py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
        >
          Thêm người dùng
        </button>
      </div>

      <FormAddItem
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        onFinish={onFinish}
        userData={selectedUser}
      />

      <Spin spinning={loading}>
        <Table
          className="w-full max-w-full overflow-hidden"
          columns={columns}
          dataSource={users}
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

export default ManagerUserPage;