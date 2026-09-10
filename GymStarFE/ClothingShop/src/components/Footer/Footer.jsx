import React, { useState } from "react";
import { Dropdown, Image, Menu } from "antd";
import "antd/dist/reset.css";
import "./Footer.scss";

const Footer = () => {
  return (
    <>
      <footer className="bg-gray-100 "></footer>
      <div className="py-6 border-t max-w-6xl mx-auto">
        <div className=" grid grid-cols-3 gap-4 text-sm">
          {/* Online Shopping */}
          <div>
            <h3 className="font-bold mb-2">
              Gọi Mua Hàng Online (08:00 - 21:00 mỗi ngày)
            </h3>
            <p className="text-xl font-bold ">1800 1162</p>
            <p>Tất cả các ngày trong tuần (Trừ Tết Âm Lịch)</p>
            <h3 className="font-bold mt-4">
              Góp Ý & Khiếu Nại (08:30 - 20:30)
            </h3>
            <p className="text-xl font-bold ">1800 1160</p>
            <p>Tất cả các ngày trong tuần (Trừ Tết Âm Lịch)</p>
          </div>

          {/* Showroom */}
          <div>
            <h3 className="font-bold mb-2">Hệ Thống Showroom</h3>
            <img
              src="./img/showroom.jpg"
              alt="Không gian trưng bày hiện đại"
              className="w-full h-48 object-cover rounded"
            />
            <a href="#" className=" hover:underline">
              Xem địa chỉ hệ thống showroom →
            </a>
          </div>

          {/* Fanpage */}
          <div>
            <h3 className="font-bold mb-2">Fanpage Của Chúng Tôi</h3>
            <img
              src="./img/fanpage.jpg"
              alt="Không gian trưng bày hiện đại"
              className="w-full h-48 object-cover rounded"
            />
            <div className="flex space-x-2 mt-2">
              <a href="#" className="">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-pink-500">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-red-500">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="text-black">
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </div>

          {/* Placeholder */}
          <div></div>
        </div>

        <div className="  flex justify-between mt-8  text-sm text-gray-600">
          <p>DH52108862-Hà Trần Hoàng Anh | DH52108711- Đặng Gia Bảo</p>
          <div className="footer_icon ">
            <ul className="ps-0 ps-lg-4 flex gap-2">
              <li className="d-inline-block me-1">
                <a href="#">
                  <i className="fa-brands fa-facebook-f" />
                </a>
              </li>
              <li className="d-inline-block me-1">
                <a href="#">
                  <i className="fa-brands fa-linkedin-in" />
                </a>
              </li>
              <li className="d-inline-block me-1">
                <a href="#">
                  <i className="fa-brands fa-google-plus-g" />
                </a>
              </li>
              <li className="d-inline-block me-1">
                <a href="#">
                  <i className="fa-brands fa-github" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
