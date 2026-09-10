import React, { useContext, useEffect, useState, useCallback } from "react";
import { Space, Table, Button, Select, Spin, Modal, Image } from "antd";
import { NotificationContext } from "../../App";
import FormSearchProduct from "../../components/FormSearchProduct/FormSearchProduct";
import { donHangService } from "../../services/donHang.service";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { getLocalStorage } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const ManagerOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const { showNotification } = useContext(NotificationContext);
  const [confirmModal, setConfirmModal] = useState({ visible: false, orderId: null });
  const [previewImages, setPreviewImages] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const navigate = useNavigate();

const fetchOrders = async () => {
  try {
    setIsLoading(true);
    setOrders([]); // Reset dữ liệu trước khi fetch
    setTotalItems(0); // Reset totalItems

    const params = {
      page: currentPage,
      limit: pageSize,
      ...(selectedStatus && { status: selectedStatus }),
    };

    let res;
    if (searchKeyword) {
      if (!isNaN(searchKeyword)) {
        // Tìm kiếm theo ID đơn hàng
        res = await donHangService.getOrderById(searchKeyword);
        const orderData = res.data.data;
        if (orderData.status === "cart") {
          setOrders([]);
          setTotalItems(0);
          showNotification("Đơn hàng này là giỏ hàng, không được hiển thị", "warning");
          setIsLoading(false);
          return;
        }
        if (selectedStatus && orderData.status !== selectedStatus) {
          setOrders([]);
          setTotalItems(0);
          showNotification("Không tìm thấy đơn hàng phù hợp với trạng thái đã chọn", "warning");
          setIsLoading(false);
          return;
        }
        // Gán dữ liệu cho một đơn hàng duy nhất
        setOrders([orderData]);
        setTotalItems(1);
        setCurrentPage(1); // Đặt lại về trang 1
        showNotification("Tìm kiếm đơn hàng thành công", "success");
        setIsLoading(false);
        return;
      } else {
        // Tìm kiếm theo từ khóa
        res = await donHangService.getOrderByKeyword(searchKeyword, params);
      }
    } else if (selectedStatus) {
      // Lọc theo trạng thái
      res = await donHangService.getOrderByStatus(selectedStatus, params);
    } else {
      // Lấy tất cả đơn hàng
      res = await donHangService.getPaginatedData({ ...params, type: "orders" });
    }

    const { data, pagination } = res.data;

    // Đảm bảo dữ liệu là mảng
    const ordersData = Array.isArray(data) ? data : [];
    setOrders(ordersData);

    // Cập nhật totalItems từ pagination hoặc số lượng dữ liệu thực tế
    const newTotalItems = pagination?.totalItems || ordersData.length;
    setTotalItems(newTotalItems);

    // Tính totalPages và kiểm tra currentPage
    const totalPages = Math.ceil(newTotalItems / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
      showNotification(`Chỉ có ${totalPages} trang, quay lại trang ${totalPages}`, "warning");
      setIsLoading(false);
      return;
    }

    // Hiển thị thông báo dựa trên kết quả
    if (ordersData.length === 0) {
      if (searchKeyword) {
        showNotification("Không tìm thấy đơn hàng với từ khóa này", "warning");
      } else if (selectedStatus) {
        showNotification(`Không có đơn hàng nào trong trạng thái ${selectedStatus}`, "warning");
      } else {
        showNotification("Không có đơn hàng nào ngoài trạng thái giỏ hàng", "warning");
      }
    } else {
      showNotification("Lấy danh sách đơn hàng thành công", "success");
    }
  } catch (err) {
    console.error("Lỗi API:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    const errorMessage = err.response?.data?.message || "Không thể lấy dữ liệu đơn hàng";
    showNotification(errorMessage, "error");
    setOrders([]);
    setTotalItems(0);
  } finally {
    setIsLoading(false);
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

    fetchOrders();
  }, [currentPage, pageSize, searchKeyword, selectedStatus, navigate]);

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

  const handleStatusChange = (value) => {
    setSelectedStatus(value || null);
    setSearchKeyword("");
    setCurrentPage(1);
    setTotalItems(0);
  };

 const handleTableChange = (pagination) => {
  if (pagination.current !== currentPage || pagination.pageSize !== pageSize) {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    setOrders([]); // Reset orders để tránh hiển thị dữ liệu cũ
  }
};

  const handleConfirmOrder = (orderId, deliveryStatus = null) => {
    const payload = deliveryStatus ? { deliveryStatus } : {};
    donHangService
      .confirmOrder(orderId, payload)
      .then(() => {
        showNotification("Cập nhật trạng thái đơn hàng thành công", "success");
        fetchOrders();
        setConfirmModal({ visible: false, orderId: null });
      })
      .catch((err) => {
        console.error("Confirm Order Error:", err.response?.data || err.message);
        showNotification(
          err.response?.data?.message || "Cập nhật trạng thái đơn hàng thất bại",
          "error"
        );
      });
  };

  const showConfirmModal = (orderId) => {
    setConfirmModal({ visible: true, orderId });
  };

  const handleCancelModal = () => {
    setConfirmModal({ visible: false, orderId: null });
  };

  const handleImagePreview = (thumbnail) => {
    let thumbnailUrls = [];
    if (thumbnail) {
      try {
        thumbnailUrls = typeof thumbnail === "string"
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
      title: "Mã đơn hàng",
      dataIndex: "order_id",
      key: "order_id",
      align: "center",
    },
    {
      title: "Thông tin khách hàng",
      dataIndex: "user",
      key: "user",
      align: "center",
      render: (user) => (
        <div>
          {user ? (
            <>
              <p><strong>Họ tên:</strong> {user.fullname}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Số điện thoại:</strong> {user.phone_number}</p>
              <p><strong>Địa chỉ:</strong> {user.address}</p>
            </>
          ) : (
            <p>Không có thông tin khách hàng</p>
          )}
        </div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      align: "center",
      render: (note) => (note ? note : "Không có ghi chú"),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "order_date",
      key: "order_date",
      align: "center",
      render: (order_date) => format(new Date(order_date), "dd/MM/yyyy HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const statusText = {
          pending: "Đang chờ",
          confirmed: "Đã xác nhận",
          delivering: "Đang giao",
          delivered: "Đã giao",
          failed: "Giao thất bại",
          canceled: "Đã hủy",
        }[status] || status;

        const statusColors = {
          pending: { class: "text-black" },
          confirmed: { class: "text-blue-700", hex: "#2196F3" },
          delivering: { class: "text-yellow-500", hex: "#F9A825" },
          delivered: { class: "text-green-500", hex: "#52C41A" },
          failed: { class: "text-red-700", hex: "#F44336" },
          canceled: { class: "text-gray-700", hex: "#BDBDBD" },
        };

        const { class: colorClass, hex: colorHex } = statusColors[status] || {
          class: "text-black",
          hex: "#000000",
        };

        return (
          <span className={colorClass} style={{ color: colorHex }}>
            {statusText}
          </span>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_money",
      key: "total_money",
      align: "center",
      render: (money) => `${money.toLocaleString()} VNĐ`,
    },
    {
      title: "Thông tin sản phẩm",
      dataIndex: "products",
      key: "products",
      align: "center",
      render: (products) => (
        <ul>
          {products?.map((item) => {
            let thumbnailUrls = [];
            if (item.product_details?.thumbnail) {
              try {
                thumbnailUrls = typeof item.product_details.thumbnail === "string"
                  ? JSON.parse(item.product_details.thumbnail)
                  : Array.isArray(item.product_details.thumbnail)
                  ? item.product_details.thumbnail
                  : [item.product_details.thumbnail];
              } catch (e) {
                console.error("Error parsing thumbnail:", e);
                thumbnailUrls = Array.isArray(item.product_details.thumbnail)
                  ? item.product_details.thumbnail
                  : [item.product_details.thumbnail];
              }
            }
            const previewImage = thumbnailUrls[0] || "https://via.placeholder.com/50?text=No+Image";
            return (
              <li key={item.product_id} className="flex items-center space-x-2 my-2">
                <div className="flex justify-center">
                  <Image
                    src={previewImage}
                    alt={item.product_details?.title}
                    width={50}
                    height={50}
                    className="object-cover rounded cursor-pointer"
                    onClick={() => handleImagePreview(item.product_details?.thumbnail)}
                    fallback="https://via.placeholder.com/50?text=No+Image"
                  />
                </div>
                <span>
                  {item.product_details?.title} (Số lượng: {item.quantity}, Kích thước: {item.product_details?.size || "N/A"}, Tổng: {item.total_money.toLocaleString()} VNĐ)
                </span>
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" className="space-x-3">
          {(record.status === "pending" || record.status === "confirmed" || record.status === "delivering") && (
            <button
              className="bg-black text-white py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
              type="primary"
              onClick={() => {
                if (record.status === "delivering") {
                  showConfirmModal(record.order_id);
                } else {
                  handleConfirmOrder(record.order_id);
                }
              }}
            >
              {record.status === "pending" ? "Xác nhận" : record.status === "confirmed" ? "Giao hàng" : "Cập nhật"}
            </button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <FormSearchProduct
          className="w-full md:w-2/3"
          title="Tìm kiếm đơn hàng (nhập mã đơn hàng, thông tin khách hàng...)"
          onSearch={handleSearch}
        />
        <Select
          placeholder="Chọn trạng thái"
          className="w-full md:w-1/3"
          onChange={handleStatusChange}
          value={selectedStatus}
          allowClear
        >
          <Option value="pending">Đang chờ</Option>
          <Option value="confirmed">Đã xác nhận</Option>
          <Option value="delivering">Đang giao</Option>
          <Option value="delivered">Đã giao</Option>
          <Option value="failed">Giao thất bại</Option>
          <Option value="canceled">Đã hủy</Option>
        </Select>
      </div>

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

      <Spin spinning={isLoading}>
              <Table
                className="w-full max-w-full overflow-hidden"
                columns={columns}
                dataSource={orders}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalItems,
                }}
                onChange={handleTableChange}
              />
            </Spin>

      <Modal
        title="Xác nhận trạng thái giao hàng"
        visible={confirmModal.visible}
        onOk={() => handleConfirmOrder(confirmModal.orderId)}
        onCancel={handleCancelModal}
        footer={null}
      >
        <p>Chọn trạng thái giao hàng cho đơn hàng {confirmModal.orderId}:</p>
        <Button
          type="primary"
          onClick={() => handleConfirmOrder(confirmModal.orderId, "success")}
          style={{ marginRight: 8 }}
        >
          Giao thành công
        </Button>
        <Button
          type="primary"
          danger
          onClick={() => handleConfirmOrder(confirmModal.orderId, "failed")}
        >
          Giao thất bại
        </Button>
      </Modal>
    </div>
  );
};

export default ManagerOrderPage;