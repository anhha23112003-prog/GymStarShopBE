import React, { useEffect, useState, useContext, useCallback } from "react";
import { Space, Table, Image, Spin, Modal } from "antd";
import { NotificationContext } from "../../App";
import FormSearchGallery from "../../components/FormSearchGallery/FormSearchGallery";
import FormAddGallery from "../../components/FormAddItem/FormAddGallery";
import { hinhAnhService } from "../../services/hinhAnh.service";
import debounce from "lodash/debounce";
import { getLocalStorage } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

const ManagerGalleryPage = () => {
  const [galleries, setGalleries] = useState([]);
  const [tempData, setTempData] = useState([]);
  const { showNotification } = useContext(NotificationContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      let res;
      if (searchKeyword) {
        res = await hinhAnhService.getGalleryByKeyword(searchKeyword, params);
      } else {
        res = await hinhAnhService.getPaginatedData(params);
      }

      const galleries = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setTempData(galleries);
      setTotalItems(res.data.pagination?.totalItems || galleries.length);

      showNotification(
        searchKeyword
          ? galleries.length === 0
            ? "Không tìm thấy gallery phù hợp với từ khóa"
            : "Tìm kiếm gallery thành công"
          : "Lấy dữ liệu gallery thành công",
        galleries.length === 0 && searchKeyword ? "warning" : "success"
      );
    } catch (err) {
      console.error("API Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.data?.message || "Không thể tìm kiếm gallery";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getLocalStorage("user");
    const accessToken = getLocalStorage("accessToken");

    if (!user || !accessToken) {
      showNotification("Vui lòng đăng nhập để truy cập", "error");
      navigate("/log-in");
      return;
    }

    if (user.role !== "admin") {
      showNotification("Bạn không có quyền truy cập trang này", "error");
      navigate("/");
      return;
    }

    fetchGalleries();
  }, [currentPage, pageSize, searchKeyword, navigate]);

  useEffect(() => {
    setGalleries(tempData);
  }, [tempData]);

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      const trimmedSearchTerm = searchTerm?.trim();
      setSearchKeyword(trimmedSearchTerm || "");
      setCurrentPage(1);
      setTotalItems(0);
    }, 500),
    []
  );

  const handleSearch = (searchTerm) => {
    debouncedSearch(searchTerm);
  };

  const showModal = (gallery = null) => {
    setSelectedGallery(gallery);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = () => {
    fetchGalleries();
  };

  const handleTableChange = (pagination) => {
    if (
      pagination.current !== currentPage ||
      pagination.pageSize !== pageSize
    ) {
      setCurrentPage(pagination.current);
      setPageSize(pagination.pageSize);
    }
  };

  const handleImagePreview = (thumbnail) => {
    let thumbnailUrls = [];
    if (thumbnail) {
      try {
        thumbnailUrls =
          typeof thumbnail === "string"
            ? JSON.parse(thumbnail)
            : Array.isArray(thumbnail)
            ? thumbnail
            : [thumbnail];
      } catch (e) {
        console.error("Error parsing thumbnail:", e);
        thumbnailUrls = Array.isArray(thumbnail) ? thumbnail : [thumbnail];
      }
    }
    setPreviewImages(thumbnailUrls);
    setIsImageModalOpen(true);
  };

  const columns = [
    {
      title: "Mã Gallery",
      dataIndex: "id_gallery",
      key: "id_gallery",
      align: "center",
    },
    {
      title: "Tên Gallery",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
      align: "center",
      render: (thumbnail) => {
        let thumbnailUrls = [];
        if (thumbnail) {
          try {
            thumbnailUrls =
              typeof thumbnail === "string"
                ? JSON.parse(thumbnail)
                : Array.isArray(thumbnail)
                ? thumbnail
                : [thumbnail];
          } catch (e) {
            console.error("Error parsing thumbnail:", e);
            thumbnailUrls = Array.isArray(thumbnail) ? thumbnail : [thumbnail];
          }
        }
        const previewImage =
          thumbnailUrls[0] ||
          "https://via.placeholder.com/100x75?text=No+Image";
        return (
          <div className="flex justify-center">
            <Image
              style={{ objectFit: "cover", cursor: "pointer" }}
              height={75}
              width={100}
              alt="preview-image"
              src={previewImage}
              onClick={() => handleImagePreview(thumbnail)}
              fallback="https://via.placeholder.com/100x75?text=No+Image"
            />
          </div>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" className="space-x-3">
          <button
            className="bg-black text-white py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
            onClick={() => {
              showModal(record);
            }}
          >
            Sửa
          </button>
          <button
            onClick={() => {
              hinhAnhService
                .deleteGallery(record.id_gallery)
                .then((res) => {
                  showNotification("Xóa gallery thành công", "success");
                  onFinish();
                })
                .catch((err) => {
                  console.error("Delete Gallery Error:", err.response?.data || err.message);
                  showNotification(
                    err.response?.data?.message || "Xóa gallery thất bại",
                    "error"
                  );
                });
            }}
            className="bg-black text-white py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
          >
            Xóa
          </button>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-max-[1000px]">
      <div className="mb-4 flex justify-between items-center">
        <FormSearchGallery
          className="mx-0"
          title="Tìm kiếm gallery (nhập mã hoặc tên gallery)..."
          onSearch={handleSearch}
        />
        <div className="flex items-center">
          <button
            onClick={() => {
              showModal();
            }}
            className="bg-black text-white font-semibold rounded-md py-2 px-5 hover:bg-gray-200 hover:text-black transition-colors"
          >
            Thêm Gallery
          </button>
        </div>
      </div>

      <FormAddGallery
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        onFinish={onFinish}
        galleryData={selectedGallery}
      />

      <Modal
        title="Xem tất cả hình ảnh"
        open={isImageModalOpen}
        onCancel={() => setIsImageModalOpen(false)}
        footer={null}
        width={1100}
        centered
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {previewImages.length > 0 ? (
            previewImages.map((url, index) => (
              <Image
                key={index}
                style={{ objectFit: "cover" }}
                height={270}
                width={500}
                alt={`image-${index}`}
                src={url}
                fallback="https://via.placeholder.com/300x200?text=No+Image"
              />
            ))
          ) : (
            <p>Không có hình ảnh để hiển thị</p>
          )}
        </div>
      </Modal>

      <Spin spinning={loading}>
        <Table
          className="w-full max-w-full overflow-hidden"
          columns={columns}
          dataSource={galleries}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
          }}
          onChange={handleTableChange}
        />
      </Spin>
    </div>
  );
};

export default ManagerGalleryPage;