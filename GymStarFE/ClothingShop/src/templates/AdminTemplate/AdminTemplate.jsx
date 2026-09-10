import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { Link, Outlet } from "react-router-dom";
import { path } from "../../common/path";
import "./AdminTemplate.css"; // Import your CSS file for custom styles


const { Header, Sider, Content } = Layout;

const AdminTemplate = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} className="bg-black ">
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          className="text-white "
          items={[
            {
              key: "1",
              icon: <UserOutlined className="text-white" />,
              label: (
                <Link to={`/admin/${path.managerUserPage}`} className="text-white hover:text-white">
                  Quản Lý Người Dùng
                </Link>
              ),
            },
            {
              key: "2",
              icon: <ShopOutlined className="text-white" />,
              label: (
                <Link to={`/admin/${path.managerProductPage}`} className="text-white hover:text-white">
                  Quản Lý Sản Phẩm
                </Link>
              ),
            },
            {
              key: "3",
              icon: <ShoppingOutlined className="text-white" />,
              label: (
                <Link to={`/admin/${path.managerCategoryPage}`} className="text-white hover:text-white">
                  Quản Lý Danh Mục
                </Link>
              ),
            },
            {
              key: "4",
              icon: <ShoppingCartOutlined className="text-white" />,
              label: (
                <Link to={`/admin/${path.managerOrderPage}`} className="text-white hover:text-white">
                  Quản Lý Đơn Hàng
                </Link>
              ),
            },
            {
              key: "5",
              icon: <FileImageOutlined className="text-white" />,
              label: (
                <Link to={`/admin/${path.managerGalleryPage}`} className="text-white hover:text-white">
                  Quản Lý Hình Ảnh
                </Link>
              ),
            },
          ]}
        />
      </Sider>

      <Layout>
        <div className="flex items-center">
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </Header>
          <Link
            to="/"
            className="text-3xl font-bold text-red-500 ml-10 hover:text-red-700 transition-colors"
          >
            BAOANH
          </Link>
        </div>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminTemplate;