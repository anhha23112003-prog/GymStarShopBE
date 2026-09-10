import React, { useEffect, useState } from "react";
import { donHangService } from "../../services/donHang.service";

const OrderCancelledPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = "your-token-here"; // Replace with actual token from context/auth
      const email = "giabao@gmail.com"; // Replace with actual user email from context/auth
      const response = await donHangService.getOrderByUser(
        email,
        token,
        page,
        pagination.pageSize
      );
      console.log(token);
      console.log(email);
      console.log(response.data);

      // Lọc đơn hàng có status là "cancelled"
      const filteredOrders = response.data.data.filter(
        (order) => order.status === "cancelled"
      );
      setOrders(filteredOrders || []);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        pageSize: response.data.pagination.pageSize,
      });
    } catch (err) {
      setError(err.message || "Lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  if (loading) return <div className="p-5">Đang tải...</div>;
  if (error) return <div className="p-5 text-black">{error}</div>;

  return (
    <div className="order-all">
      {orders.length > 0 ? (
        <>
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-lg mb-5 shadow-md"
            >
              <div className="flex justify-between p-4 border-b border-gray-200">
                <span className="font-bold text-black">BAOANH</span>
                <span className="text-black font-medium capitalize">
                  {order.status}
                </span>
              </div>
              {order.products && order.products.length > 0 ? (
                order.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 border-b border-gray-200"
                  >
                    <img
                      src={
                        product.product_details.thumbnail[0] ||
                        "https://via.placeholder.com/80"
                      }
                      alt={product.product_details.title}
                      className="w-20 h-20 object-cover mr-4 rounded"
                    />
                    <div className="flex-1">
                      <p className="m-0 text-sm text-gray-800">
                        {product.product_details.title}
                      </p>
                      <p className="mt-1 text-gray-500">
                        Kích thước: {product.product_details.size}
                      </p>
                      <p className="mt-1 text-gray-500">x{product.quantity}</p>
                       <p className="mt-1 text-gray-500">
                        Ghi chú: {order.note}
                      </p>
                    </div>
                    <p className="font-bold text-black">
                      {Math.round(
                        product.product_details.price *
                          (1 - product.product_details.discount / 100)
                      ).toLocaleString()}
                      ₫
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4">Không có sản phẩm</div>
              )}
              <div className="flex justify-between items-center p-4">
                <div>
                  <p className="m-0 text-gray-600">
                    Tổng tiền:{" "}
                    <span className="font-bold text-black">
                      {order.total_money.toLocaleString()}₫
                    </span>
                  </p>
                  <p className="m-0 text-gray-500 text-sm mt-1">
                    Ngày đặt: {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  {/* <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 font-medium">
                    Mua Lại
                  </button> */}
                </div>
              </div>
            </div>
          ))}
          {/* <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-4 py-2">
              Trang {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div> */}
        </>
      ) : (
        <div className="p-5">Không có đơn hàng nào bị hủy</div>
      )}
    </div>
  );
};

export default OrderCancelledPage;
