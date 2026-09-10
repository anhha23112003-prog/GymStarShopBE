import { http } from "./config";

export const authService = {
  logIn: (data) => {
    return http.post("/QuanLyNguoiDung/DangNhap", data);
  },
  signUp: (data) => {
    return http.post("/QuanLyNguoiDung/DangKy", data);
  },
  getUserInfo: (id_user) => {
    return http.get(`/QuanLyNguoiDung/LayThongTinTaiKhoan/${id_user}`);
  },
  logout: () => {
    return http.post("/DangXuat");
  },
};
