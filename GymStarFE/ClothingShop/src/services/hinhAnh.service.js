import { http } from "./config";

export const hinhAnhService = {
  getPaginatedData: (params = {}) => {
    console.log("Fetching galleries with params:", params);
    return http.get("/QuanLyGallery/LayDanhSachGallery", { params });
  },
  getGalleryByKeyword: (keyword, params = {}) => {
    const query = new URLSearchParams(params).toString();
    console.log("Searching gallery with keyword:", keyword, "and params:", params);
    return http.get(`/QuanLyGallery/LayGalleryTheoMaHoacTen/${encodeURIComponent(keyword)}${query ? `?${query}` : ''}`);
  },
  addGallery: (data) => {
    return http.post("/QuanLyGallery/ThemGallery", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateGallery: (id_gallery, data) => {
    return http.put(`/QuanLyGallery/CapNhatGallery/${id_gallery}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteGallery: (id_gallery) => {
    return http.delete(`/QuanLyGallery/XoaGallery/${id_gallery}`);
  },
};