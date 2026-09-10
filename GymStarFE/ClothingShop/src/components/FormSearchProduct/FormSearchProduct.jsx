import React, { useState } from "react";
import { Input } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";

const FormSearchProduct = ({
  className = "mx-8",
  title = "Tìm kiếm...",
  onSearch = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    setSearchTerm(trimmedValue);
    onSearch(trimmedValue);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className={`search flex-1 max-w-xl ${className}`}>
      <Input
        placeholder={title}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onPressEnter={(e) => handleSearch(e.target.value)}
        prefix={<SearchOutlined className="text-gray-500" />}
        suffix={
          searchTerm ? (
            <CloseOutlined
              className="text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={handleClearSearch}
            />
          ) : null
        }
        className="w-full"
      />
    </div>
  );
};

export default FormSearchProduct;



