import { http } from "./config";

export const sanPhamService = {
  getAllProducts: () => {
    return http.get("/QuanLySanPham/LayTatCaSanPham");
  },

  getPaginatedData: (params = {}) => {
    return http.get("/QuanLySanPham/LayDanhSachSanPham", { params });
  },
  getProductById: (id_product) => {
    return http.get(`/QuanLySanPham/LayThongTinSanPhamTheoId/${id_product}`);
  },
  getProductByCategory: (id_category, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http.get(
      `/QuanLySanPham/LayDanhSachSanPhamTheoDanhMuc/${id_category}${query ? `?${query}` : ""}`
    );
  },
  getProductByCategoryId: (id_category) => {
    return http.get(
      `/QuanLySanPham/LayDanhSachSanPhamTheoDanhMuc/${id_category}`
    );
  },
  getProductByName: (title) => {
    return http.get(`/QuanLySanPham/LayDanhSachSanPhamTheoTitle/${title}`);
  },
  getProductByKeyword: (keyword) => {
    return http.get(
      `/QuanLySanPham/LayDanhSachSanPhamTheoTuKhoaTimKiem/${encodeURIComponent(
        keyword
      )}`
    );
  },
  addProduct: (data) => {
    return http.post("/QuanLySanPham/ThemSanPham", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteProduct: (id_product) => {
    return http.delete(`/QuanLySanPham/XoaSanPham/${id_product}`);
  },
  updateProduct: (id_product, data) => {
    return http.put(`/QuanLySanPham/CapNhatSanPham/${id_product}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getAllCategory: () => {
    return http.get("/QuanLySanPham/LayDanhSachDanhMuc");
  },
  getProductByCategoryName: (name_category, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http.get(
      `/QuanLySanPham/LayDanhSachSanPhamTheoTenDanhMuc/${encodeURIComponent(
        name_category
      )}${query ? `?${query}` : ""}`
    );
  },
  searchProducts: (keyword, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http.get(
      `/QuanLySanPham/LayDanhSachSanPhamTheoTuKhoaTimKiem/${encodeURIComponent(
        keyword
      )}${query ? `?${query}` : ""}`
    );
  },
};