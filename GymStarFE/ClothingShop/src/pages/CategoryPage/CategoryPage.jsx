import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { sanPhamService } from "../../services/sanPham.service";
import { Link } from "react-router-dom";
import { Dropdown, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { NotificationContext } from "../../App";

const CategoryPage = () => {
  const { id_category } = useParams();
  const [products, setProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState(null);
  const [page, setPage] = useState(1); // Theo dõi trang hiện tại
  const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu để tải
  const [loading, setLoading] = useState(false); // Trạng thái tải
  const { showNotification } = useContext(NotificationContext);
  const observerRef = useRef(null); // Ref để theo dõi phần tử cuối cùng
  const [totalItems, setTotalItems] = useState(0); // Tổng số sản phẩm
  // Hàm gọi API phân trang theo danh mục
  const fetchProductsByCategory = async (pageNum) => {
    try {
      setLoading(true);
      const res = await sanPhamService.getProductByCategory(id_category, {
        page: pageNum,
        limit: 16,
      });
      const newProducts = res.data.data || [];
      setTotalItems(res.data.pagination.totalItems); // Cập nhật tổng số sản phẩm

      // Nếu không còn sản phẩm, đặt hasMore thành false
      if (newProducts.length === 0) {
        setHasMore(false);
        return;
      }

      // Nếu là trang đầu tiên, thay thế dữ liệu; nếu không, nối thêm dữ liệu
      setProducts((prev) =>
        pageNum === 1 ? newProducts : [...prev, ...newProducts]
      );
    } catch (err) {
      console.error(err.response?.data?.message || err.message, err);
      showNotification("Lỗi kết nối", "error", 2000);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API lần đầu khi id_category thay đổi
  useEffect(() => {
    setPage(1); // Reset page về 1 khi id_category thay đổi
    setProducts([]); // Reset danh sách sản phẩm
    setHasMore(true); // Reset hasMore
    fetchProductsByCategory(1);
  }, [id_category]);

  // Thiết lập IntersectionObserver để phát hiện cuộn
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1); // Tăng trang
        }
      },
      { threshold: 0.1 } // Kích hoạt khi 10% phần tử cuối cùng hiển thị
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loading]);

  // Gọi API khi page thay đổi
  useEffect(() => {
    if (page > 1) {
      fetchProductsByCategory(page);
    }
  }, [page]);

  // Hàm sắp xếp sản phẩm theo giá
  const handleSort = (order) => {
    setSortOrder(order);
    setProducts((prev) => {
      const sortedProducts = [...prev];
      if (order === "asc") {
        sortedProducts.sort((a, b) => a.price - b.price);
      } else if (order === "desc") {
        sortedProducts.sort((a, b) => b.price - b.price);
      }
      return sortedProducts;
    });
  };

  const items = [
    {
      key: "1",
      label: "Tăng dần",
      onClick: () => handleSort("asc"),
    },
    {
      key: "2",
      label: "Giảm dần",
      onClick: () => handleSort("desc"),
    },
  ];

  return (
    <main className="flex-1">
      {/* Top Sale Phái Mạnh Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-4">
            {products[0]?.category?.name || "Danh mục"}
          </h2>
          <p className="text-center">{totalItems} sản phẩm</p>
          <div className="text-right my-5">
            <Dropdown menu={{ items }}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  Tùy chọn <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
          <div className="grid grid-cols-4 gap-8 mb-8">
            {products.map((item, index) => (
              <div
                key={index}
                className="relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <Link to={`/product-detail/${item.id_product}`}>
                  <div className="relative w-full h-48">
                    <img
                      src={item.gallery?.thumbnail[0]}
                      alt={item.title}
                      className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300 hover:opacity-0"
                    />
                    <img
                      src={
                        item.gallery?.thumbnail[1] || item.gallery?.thumbnail[0]
                      }
                      alt={item.title}
                      className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 hover:opacity-100"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <p className="mt-2 text-gray-800 font-medium">
                      {item.title}
                    </p>
                    <p className="text-red-500 font-bold">{item.price}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          {/* Phần tử cuối cùng để theo dõi cuộn */}
          <div
            ref={observerRef}
            className="h-10 flex justify-center items-center"
          >
            {loading && <p>Đang tải thêm sản phẩm...</p>}
            {!hasMore && products.length > 0 && <p>Đã tải hết sản phẩm</p>}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CategoryPage;
