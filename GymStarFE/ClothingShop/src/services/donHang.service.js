import { http } from "./config";

export const donHangService = {
  getPaginatedData: (params) => {
    return http.get("/QuanLyOrders/LayDanhSachTatCaDonHang", { params });
  },
  deleteOrder: (id_order) => {
    return http.delete(`/QuanLyOrders/XoaDonHang/${id_order}`);
  },
  confirmOrder: (id_order, payload = {}) => {
    return http.put(`/QuanLyOrders/XacNhanDonHang/${id_order}`, payload);
  },
  getOrderByStatus: (status, params) => {
    return http.get(`/QuanLyOrders/LayDanhSachDonHangTheoTrangThai/${status}`, {
      params,
    });
  },
  getOrderByKeyword: (keyword, params) => {
    return http.get(
      `/QuanLyOrders/LayDanhSachDonHangCuaNguoiDung/${encodeURIComponent(
        keyword
      )}`,
      { params }
    );
  },
  getOrderById: (id_order) => {
    return http.get(`/QuanLyOrders/LayDonHangTheoMaDonHang/${id_order}`);
  },
  getProductsByCart: (id_user, token) => {
    return http.get(`/QuanLyOrders/LayDanhSachSanPhamTrongGioHang/${id_user}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  addProductToCart: (token, payload) => {
    return http.post(`/QuanLyOrders/ThemSanPhamVaoGioHang/`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  updateProductInCart: (token, payload) => {
    return http.put(`/QuanLyOrders/CapNhatSanPhamTrongGioHang`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  deleteProductInCart: (token, id_user, id_product) => {
    return http.delete(
      `/QuanLyOrders/XoaSanPhamTrongGioHang/${id_user}/${id_product}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  getOrderByUser: (email, token, page = 1, limit = 10) => {
    return http.get(`/QuanLyOrders/LayDanhSachDonHangCuaNguoiDung/${email}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        limit,
      },
    });
  },
  checkOut: (token, payload) => {
    return http.post(`/QuanLyOrders/DatHang`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
