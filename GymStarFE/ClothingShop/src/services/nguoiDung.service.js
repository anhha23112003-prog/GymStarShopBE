import { http } from "./config";

export const nguoiDungService = {
  getPaginatedData: (params = {}) => {
    return http.get("/QuanLyNguoiDung/LayDanhSachNguoiDung", { params });
  },
  searchUsers: (keyword, params = {}) => {
    return http.get("/QuanLyNguoiDung/TimKiemNguoiDung", {
      params: { keyword, ...params },
    });
  },
  updateInfoUser: (userData) => {
    return http.put("/QuanLyNguoiDung/CapNhatTaiKhoan", userData); // Giả sử endpoint
  },
  changePassword: (passwordData) => {
    return http.post("/QuanLyNguoiDung/DoiMatKhau", passwordData); // Giả sử endpoint
  },
};