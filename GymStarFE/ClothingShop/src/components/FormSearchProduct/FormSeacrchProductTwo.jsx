import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dropdown, Image } from "antd";
import { sanPhamService } from "../../services/sanPham.service";
import { removeVietnameseTones } from "../../utils/removeVietnameseTones";
import "./FormSearchProduct.scss";

const FormSearchProductTwo = ({ className = "", title = "Tìm kiếm..." }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [valueSearch, setValueSearch] = useState("");
  const [checkDropdown, setCheckDropdown] = useState(false);
  const [listProductSuggest, setListProductSuggest] = useState([]);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTimeout(() => {
          setCheckDropdown(false);
        }, 100);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đóng dropdown khi thay đổi route
  useEffect(() => {
    setCheckDropdown(false);
  }, [location]);

  // Gọi API tìm kiếm sản phẩm khi valueSearch thay đổi
  useEffect(() => {
    if (valueSearch) {
      const searchTerm = removeVietnameseTones(valueSearch)
        .toLowerCase()
        .trim();
      sanPhamService
        .getProductByName(searchTerm) // Giả định có API này
        .then((res) => {
          const newListProductSuggest = res.data.data
            .slice(0, 4) // Giới hạn 4 kết quả gợi ý
            .map((item, index) => ({
              key: index.toString(),
              label: (
                <Link
                  to={`/product-detail/${item.id_product}`}
                  className="flex items-center space-x-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={item.gallery?.thumbnail[0]}
                    className="h-14"
                    width={100}
                    alt={item.title}
                    preview={false}
                  />
                  |
                  <div>
                    <h4>{item.title}</h4>
                    <p className="text-red-500 font-bold">
                      {(item.price * (1 - item.discount / 100)).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      đ
                    </p>
                  </div>
                </Link>
              ),
            }));
          setListProductSuggest(newListProductSuggest);
          setCheckDropdown(true);
        })
        .catch((err) => {
          console.error("Error fetching search results:", err);
        });
    } else {
      setListProductSuggest([]);
      setCheckDropdown(false);
    }
  }, [valueSearch]);

  // Xử lý submit form tìm kiếm
  const handleSubmit = (event) => {
    event.preventDefault();
    if (valueSearch) {
      navigate(`/search?keyword=${encodeURIComponent(valueSearch)}`);
      setCheckDropdown(false);
    }
  };

  // Xử lý thay đổi input
  const handleChange = (event) => {
    setValueSearch(event.target.value);
  };

  return (
    <div className={`search flex-1 ${className}`}>
      <form
        ref={dropdownRef}
        onSubmit={handleSubmit}
        className="ml-5 search-box w-[200px] text-center relative flex justify-center items-center bg-white"
      >
        <Dropdown
          menu={{ items: listProductSuggest }}
          trigger={["click"]}
          open={checkDropdown}
        >
          <form
            action=""
            className="ml-5 search-box w-[200px] text-center relative   flex justify-center items-center bg-white "
          >
            <input
              placeholder={title}
              className="input-search w-0 px-2 py-4 transition-all ease-in duration-150  rounded-full outline-none  border-none  "
              type="search"
              onChange={handleChange}
            />
            <button>
              <i className="icon-search fas fa-search cursor-pointer hover:text-green-500 "></i>
            </button>
          </form>
        </Dropdown>
      </form>
    </div>
  );
};
export default FormSearchProductTwo;
