import React, { useState } from "react";
import { Input } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const FormSearchUser = ({
  className = "mx-8",
  title = "Tìm kiếm người dùng...",
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

FormSearchUser.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  onSearch: PropTypes.func,
};

export default FormSearchUser;