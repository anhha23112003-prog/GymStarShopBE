import React, { useContext, useEffect, useState, useRef } from "react";
import { sanPhamService } from "../../services/sanPham.service";
import { Link } from "react-router-dom";
import { path } from "../../common/path";
import { NotificationContext } from "../../App";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1); // Theo dõi trang hiện tại
  const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu để tải
  const [loading, setLoading] = useState(false); // Trạng thái tải
  const { showNotification } = useContext(NotificationContext);
  const observerRef = useRef(null); // Ref để theo dõi phần tử cuối cùng

  // Hàm gọi API phân trang
  const fetchProducts = async (pageNum) => {
    try {
      setLoading(true);
      const res = await sanPhamService.getPaginatedData({
        page: pageNum,
        limit: 16,
      });
      const newProducts = res.data.data || [];

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
      console.log(err);
      showNotification("Lỗi kết nối", "error", 2000);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API lần đầu khi component mount
  useEffect(() => {
    fetchProducts(page);
  }, []);

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
      fetchProducts(page);
    }
  }, [page]);

  return (
    <main className="flex-1">
      {/* Banner */}
      <section className="">
        <img
          src="./img/banner.jpg"
          alt="Banner"
          className="w-full h-96 object-cover"
        />
      </section>

      {/* Recommendations Section */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Bộ Sưu Tập</h2>
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

      {/* Instagram Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Instagram</h2>
          <p className="text-center text-sm mb-6">@BAOANH.vn</p>
          <div className="grid grid-cols-4 gap-4">
            <img
              src="./img/instagram5.jpg"
              alt="Instagram 1"
              className="w-full object-cover"
            />
            <img
              src="./img/instagram6.jpg"
              alt="Instagram 2"
              className="w-full object-cover"
            />
            <img
              src="./img/instagram7.jpg"
              alt="Instagram 3"
              className="w-full object-cover"
            />
            <img
              src="./img/instagram8.jpg"
              alt="Instagram 4"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
