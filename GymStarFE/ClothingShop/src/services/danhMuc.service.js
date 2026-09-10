import { http } from "./config";

export const danhMucService = {
  getCategory: () => {
    return http.get("/QuanLyDanhMuc/LayDanhSachDanhMuc");
  },
  addCategory: (data) => {
    return http.post("/QuanLyDanhMuc/ThemDanhMuc", data);
  },
  updateCategory: (id_category, data) => {
    return http.put(`/QuanLyDanhMuc/CapNhatDanhMuc/${id_category}`, data);
  },
  deleteCategory: (id_category) => {
    return http.delete(`/QuanLyDanhMuc/XoaDanhMuc/${id_category}`);
  },
};
