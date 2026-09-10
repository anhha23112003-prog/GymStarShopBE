import React, { useContext, useEffect, useState } from "react";
import { sanPhamService } from "../../services/sanPham.service";
import { donHangService } from "../../services/donHang.service";
import { NotificationContext } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import { getLocalStorage } from "../../utils/utils";
import { FaTrash } from "react-icons/fa";
import { path } from "../../common/path";
import { useDispatch } from "react-redux";
import { removeFromCart, fetchCartProducts } from "../../redux/cartSlice";
import { Modal } from "antd";

const OrderPage = () => {
  const { showNotification } = useContext(NotificationContext);
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [note, setNote] = useState("");
  const [modalNote, setModalNote] = useState("");
  const [shippingOption, setShippingOption] = useState("free");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialToken, setInitialToken] = useState(
    getLocalStorage("accessToken")
  );
  const [initialUser, setInitialUser] = useState(getLocalStorage("user"));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!initialToken || !initialUser) {
      showNotification("Vui lòng đăng nhập để xem giỏ hàng!", "error", 2000);
      setTimeout(() => navigate(path.logIn), 2000);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await donHangService.getProductsByCart(
          initialUser?.id_user,
          initialToken
        );
        console.log("Initial fetch response:", res);
        setOrder(res.data.data?.products || []);
      } catch (err) {
        console.error("Initial fetch error:", err);
        showNotification(
          err.response?.data?.message || "Lỗi không xác định",
          "error",
          2000
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialToken, initialUser, showNotification, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await sanPhamService.getAllProducts();
        console.log("Products fetch response:", res);
        setProducts(res.data.data);
      } catch (err) {
        console.error("Products fetch error:", err);
        showNotification(
          err.response?.data?.message || "Lỗi không xác định",
          "error",
          2000
        );
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = async (productId, change) => {
    if (!initialToken || !initialUser) {
      showNotification(
        "Vui lòng đăng nhập để cập nhật giỏ hàng!",
        "error",
        2000
      );
      setTimeout(() => navigate(path.logIn), 2000);
      return;
    }

    const currentItem = order.find((item) => item.product_id === productId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + change;
    if (newQuantity < 1) return;

    setOrder((prevOrder) =>
      prevOrder.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    setIsLoading(true);

    const payload = {
      id_user: initialUser.id_user,
      id_product: productId,
      quantity: newQuantity,
    };

    try {
      const res = await donHangService.updateProductInCart(
        initialToken,
        payload
      );
      console.log("Quantity update response:", res);
      await loadDataGioHang();
      showNotification("Cập nhật số lượng thành công", "success", 2000);
    } catch (err) {
      setOrder((prevOrder) =>
        prevOrder.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: currentItem.quantity }
            : item
        )
      );
      console.error("Quantity update error:", err);
      showNotification(
        err.response?.data?.message || "Lỗi khi cập nhật số lượng",
        "error",
        2000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = (productId) => {
    if (!initialToken || !initialUser) {
      showNotification("Vui lòng đăng nhập để xóa sản phẩm!", "error", 2000);
      setTimeout(() => navigate(path.logIn), 2000);
      return;
    }

    const previousOrder = [...order];
    const updatedOrder = order.filter((item) => item.product_id !== productId);
    setOrder(updatedOrder);
    setIsLoading(true);

    donHangService
      .deleteProductInCart(initialToken, initialUser.id_user, productId)
      .then((res) => {
        console.log("Delete API response:", res);
        dispatch(removeFromCart({ id: productId }));
        dispatch(
          fetchCartProducts({
            userId: initialUser.id_user,
            token: initialToken,
          })
        );
        showNotification("Xóa sản phẩm thành công", "success", 2000);
      })
      .catch((err) => {
        setOrder(previousOrder);
        console.error("Delete error:", err);
        showNotification(
          err.response?.data?.message || "Lỗi khi xóa sản phẩm",
          "error",
          2000
        );
      })
      .finally(() => setIsLoading(false));
  };

  const loadDataGioHang = async () => {
    if (!initialToken || !initialUser) return;
    setIsLoading(true);
    try {
      const res = await donHangService.getProductsByCart(
        initialUser?.id_user,
        initialToken
      );
      console.log("Refetch cart response:", res);
      setOrder(res.data.data?.products || []);
    } catch (err) {
      console.error("Refetch cart error:", err);
      showNotification(
        err.response?.data?.message || "Lỗi không xác định",
        "error",
        2000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = order.reduce(
    (acc, item) =>
      acc +
      item.quantity *
        item.product_details?.price *
        (1 - item.product_details?.discount / 100),
    0
  );

  const shippingFee = shippingOption === "free" ? 0 : 20000;
  const total = subtotal + shippingFee;

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const payload = {
        id_user: initialUser.id_user,
        note: modalNote || note, // Sử dụng note từ modal hoặc note ban đầu nếu modal để trống
      };
      await donHangService.checkOut(initialToken, payload);
      showNotification("Thanh toán thành công!", "success", 2000);
      setOrder([]); // Xóa giỏ hàng sau khi thanh toán
      setTimeout(() => navigate(path.cartPage), 2000); // Chuyển sang trang cartPage
    } catch (err) {
      console.error("Checkout error:", err);
      showNotification(
        err.response?.data?.message || "Lỗi khi thanh toán",
        "error",
        2000
      );
    } finally {
      setIsLoading(false);
      setIsModalVisible(false);
    }
  };

  const showModal = () => {
    if (order.length === 0) {
      showNotification(
        "Giỏ hàng trống, vui lòng thêm sản phẩm!",
        "error",
        2000
      );
      return;
    }
    setModalNote(note); // Đặt note ban đầu từ state vào modal
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <main className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        ĐƠN HÀNG CỦA BẠN (Có {order.length} sản phẩm trong giỏ hàng)
      </h1>

      {isLoading && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}

      <div className="flex space-x-8">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-4">
            Đăng nhập để tích điểm và ưu đãi thành viên tại BAOANH
          </p>

          {order.map((item) => (
            <div
              key={item.id_product}
              className="flex items-center border-b py-4 transition-all duration-300 hover:bg-gray-50"
            >
              <img
                src={item.product_details?.thumbnail[0]}
                alt={item.product_details?.title}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1 ml-4">
                <h3 className="font-semibold">{item.product_details?.title}</h3>
                <p className="text-gray-500">
                  Size: {item.product_details?.size}
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(item.product_id, -1)}
                      className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                      disabled={item.quantity <= 1 || isLoading}
                    >
                      -
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product_id, 1)}
                      className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(item.product_id)}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    disabled={isLoading}
                    title="Xóa sản phẩm"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="font-bold text-right min-w-[120px]">
                {(
                  item.product_details?.price *
                  item.quantity *
                  (1 - item.product_details?.discount / 100)
                ).toLocaleString()}
                đ
              </p>
            </div>
          ))}

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Ghi chú đơn hàng</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú cho đơn hàng..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-200"
              rows="3"
              disabled={isLoading}
            />
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-4">Sản phẩm hay được mua cùng</h3>
            <div className="grid grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="text-center">
                  <img
                    src={product.gallery.thumbnail[0]}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded"
                  />
                  <p className="mt-2">{product.name}</p>
                  <p className="font-bold">{product.price.toLocaleString()}đ</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-80">
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-4">TÓM TẮT ĐƠN HÀNG</h3>
            <div className="flex justify-between mb-2">
              <span>Tổng tiền hàng:</span>
              <span>{subtotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Phí vận chuyển:</span>
              <span>{shippingFee.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Tổng tiền:</span>
              <span>{total.toLocaleString()}đ</span>
            </div>

            <button
              onClick={showModal}
              className="w-full bg-black text-white py-3 rounded mt-4 hover:bg-gray-800 disabled:opacity-50 transition-colors"
              disabled={isLoading}
            >
              THANH TOÁN
            </button>
          </div>
        </div>
      </div>

      <Modal
        title="Xác nhận thanh toán"
        open={isModalVisible}
        onOk={handleCheckout}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: "#000",
            borderColor: "#000",
            color: "#fff",
          },
        }}
        cancelButtonProps={{ style: { borderColor: "#000", color: "#000" } }}
      >
        <div className="max-h-[400px] overflow-y-auto">
          <h3 className="font-semibold mb-2">Thông tin đơn hàng:</h3>
          {order.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center border-b py-2"
            >
              <img
                src={item.product_details?.thumbnail[0]}
                alt={item.product_details?.title}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 ml-3">
                <p className="font-medium">{item.product_details?.title}</p>
                <p className="text-gray-500 text-sm">
                  Size: {item.product_details?.size}
                </p>
                <p className="text-gray-500 text-sm">
                  Số lượng: {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                {(
                  item.product_details?.price *
                  item.quantity *
                  (1 - item.product_details?.discount / 100)
                ).toLocaleString()}
                đ
              </p>
            </div>
          ))}
          <div className="mt-4">
            <p className="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span>{subtotal.toLocaleString()}đ</span>
            </p>
            <p className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span>{shippingFee.toLocaleString()}đ</span>
            </p>
            <p className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Tổng tiền:</span>
              <span>{total.toLocaleString()}đ</span>
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Ghi chú:</label>
              <textarea
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="Nhập ghi chú cho đơn hàng (ví dụ: Trước khi giao nhớ kêu shipper gọi tôi)..."
                className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-200"
                rows="3"
              />
            </div>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default OrderPage;
