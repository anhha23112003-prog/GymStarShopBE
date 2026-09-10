import sequelize from "../models/connect.js";
import initModels from "../models/init-models.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";   
import dotenv from "dotenv";
import transporter from '../config/email.js';

dotenv.config(); // Đọc file .env

const model = initModels(sequelize);

// Khóa bí mật cho Access Token và Refresh Token (lấy từ file .env)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;





// Hàm đăng ký người dùng
const registerUser = async (req, res) => {
  try {
    const { fullname, email, phone_number, password } = req.body;

    if (!fullname || !email || !phone_number || !password) {
      return res.status(400).json({
        message: "Thông tin không được để trống",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email không hợp lệ",
      });
    }

    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({
        message: "Số điện thoại không hợp lệ (phải có 10-15 chữ số)",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    const existingUser = await req.sequelize.models.user.findOne({ where: { email } });
    if (existingUser) {
      if (existingUser.is_verified) {
        return res.status(400).json({
          message: "Email đã được sử dụng, vui lòng đăng nhập hoặc sử dụng email khác",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
      const tokenExpires = new Date(Date.now() + 1 * 60 * 1000);

      await existingUser.update({
        fullname,
        phone_number,
        password: hashedPassword,
        verification_token: verificationToken,
        verification_token_expires: tokenExpires,
      });

      await sendVerificationEmail(email, verificationToken);

      return res.status(200).json({
        message: "Email đã được đăng ký nhưng chưa xác nhận. Chúng tôi đã gửi lại email xác nhận.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
    const tokenExpires = new Date(Date.now() + 1 * 60 * 1000);

    const newUser = await req.sequelize.models.user.create({
      fullname,
      email,
      phone_number,
      password: hashedPassword,
      role: "user",
      verification_token: verificationToken,
      verification_token_expires: tokenExpires,
      is_verified: false,
    });

    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.",
    });
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({
      message: "Lỗi khi đăng ký tài khoản",
      error: err.message,
    });
  }
};

// Hàm gửi email xác nhận
const sendVerificationEmail = async (toEmail, verificationToken) => {
  try {
    const verificationLink = `http://localhost:3000/verify-email-direct?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Xác nhận email đăng ký tại BAOANH",
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #1a202c;">Xác Nhận Email</h2>
          <p style="color: #4a5568;">Xin chào bạn.</p>
          <p style="color: #4a5568;">BAOANH xin thông báo tài khoản của bạn đã được đăng ký thành công. Vui lòng xác nhận email bằng cách nhấp vào nút bên dưới để hoàn tất.</p>
          <p style="color: #4a5568; font-style: italic;">(Bạn sẽ được chuyển đến trang xác nhận và nhận một email thông báo sau khi xác nhận thành công.)</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #e53e3e; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#c53030';" onmouseout="this.style.backgroundColor='#e53e3e';">Xác Nhận Email</a>
        </div>
      `,
    });
    console.log("Verification email sent successfully to:", toEmail);
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error("Failed to send verification email: " + error.message);
  }
};

// Hàm gửi email xác nhận thành công
const sendConfirmationEmail = async (toEmail) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Xác nhận tài khoản thành công tại BAOANH",
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #1a202c;">Xác Nhận Thành Công</h2>
          <p style="color: #4a5568;">Xin chào bạn.</p>
          <p style="color: #4a5568;">Tài khoản của bạn tại BAOANH đã được xác nhận thành công. Bạn có thể đăng nhập ngay bây giờ.</p>
          <a href="http://daotao1.stu.edu.vn/Default.aspx?page=xemdiemthi" style="display: inline-block; padding: 10px 20px; background-color: #e53e3e; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Đăng Nhập</a>
        </div>
      `,
    });
    console.log("Confirmation email sent successfully to:", toEmail);
  } catch (error) {
    console.error("Error sending confirmation email:", error.message);
  }
};

// Hàm xử lý xác nhận email
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    console.log('Received token:', token);
    console.log('Sequelize models:', req.sequelize.models);
    if (!req.sequelize.models.user) {
      console.error('User model not found in sequelize.models');
      throw new Error('User model not defined');
    }
    const user = await req.sequelize.models.user.findOne({ where: { verification_token: token } });
    console.log('Found user:', user);

    if (!user) {
      return res.status(400).send(`
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 40px; background-color: #f7fafc; min-height: 100vh;">
          <h2 style="color: #1a202c;">Xác Nhận Email</h2>
          <p style="color: red; font-size: 18px;">Token không hợp lệ. Vui lòng đăng ký lại hoặc liên hệ hỗ trợ.</p>
        </div>
      `);
    }

    if (new Date() > user.verification_token_expires) {
      const newVerificationToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
      const newTokenExpires = new Date(Date.now() + 1 * 60 * 1000);

      await user.update({
        verification_token: newVerificationToken,
        verification_token_expires: newTokenExpires,
      });

      await sendVerificationEmail(user.email, newVerificationToken);

      return res.status(400).send(`
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 40px; background-color: #f7fafc; min-height: 100vh;">
          <h2 style="color: #1a202c;">Xác Nhận Email</h2>
          <p style="color: red; font-size: 18px;">Mã token đã hết hạn. Chúng tôi đã gửi một email xác nhận mới đến ${user.email}. Vui lòng kiểm tra hộp thư!</p>
        </div>
      `);
    }

    await user.update({
      is_verified: true,
      verification_token: null,
      verification_token_expires: null,
    });

    try {
      await sendConfirmationEmail(user.email);
      res.send(`
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 40px; background-color: #f7fafc; min-height: 100vh;">
          <h2 style="color: #1a202c;">Xác Nhận Email</h2>
          <p style="color: green; font-size: 18px;">Đã xác nhận thành công! Một email xác nhận đã được gửi đến bạn.</p>
        </div>
      `);
    } catch (error) {
      console.error("Failed to send confirmation email in verifyEmail:", error.message);
      res.send(`
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 40px; background-color: #f7fafc; min-height: 100vh;">
          <h2 style="color: #1a202c;">Xác Nhận Email</h2>
          <p style="color: green; font-size: 18px;">Đã xác nhận thành công! Tuy nhiên, không thể gửi email xác nhận. Vui lòng kiểm tra lại sau.</p>
          <p><a href="http://daotao1.stu.edu.vn/Default.aspx?page=xemdiemthi" style="display: inline-block; padding: 10px 20px; background-color: #e53e3e; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Đăng nhập ngay</a></p>
        </div>
      `);
    }
  } catch (err) {
    console.error("Error verifying email:", err);
    res.status(500).send(`
      <div style="text-align: center; font-family: Arial, sans-serif; padding: 40px; background-color: #f7fafc; min-height: 100vh;">
        <h2 style="color: #1a202c;">Xác Nhận Email</h2>
        <p style="color: red; font-size: 18px;">Lỗi khi xác nhận email. Vui lòng thử lại sau.</p>
        <p><a href="http://localhost:3000/register" style="display: inline-block; padding: 10px 20px; background-color: #e53e3e; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Quay lại đăng ký</a></p>
      </div>
    `);
  }
};

// Hàm gửi lại email xác nhận
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp email" });
    }

    const user = await req.sequelize.models.user.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: "Email này đã được xác nhận" });
    }

    const newVerificationToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
    const newTokenExpires = new Date(Date.now() + 1 * 60 * 1000);

    await user.update({
      verification_token: newVerificationToken,
      verification_token_expires: newTokenExpires,
    });

    await sendVerificationEmail(email, newVerificationToken);

    return res.status(200).json({ message: "Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư!" });
  } catch (err) {
    console.error("Error resending verification email:", err);
    return res.status(500).json({ message: "Lỗi khi gửi lại email xác nhận", error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email và password không được để trống",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email không hợp lệ",
      });
    }

    const user = await req.sequelize.models.user.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra xem tài khoản đã được xác thực chưa
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác nhận tài khoản.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
    console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign(
      { id_user: user.id_user, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    console.log("Access token created:", accessToken);

    const refreshToken = jwt.sign(
      { id_user: user.id_user, email: user.email, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );
    console.log("Refresh token created:", refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    console.log("Refresh token cookie set");

    const userData = {
      id_user: user.id_user,
      fullname: user.fullname,
      email: user.email,
      phone_number: user.phone_number,
      created_at: user.created_at,
      role: user.role,
    };

    return res.status(200).json({
      message: "Đăng nhập thành công",
      data: {
        user: userData,
        accessToken,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    return res.status(500).json({
      message: "Lỗi khi đăng nhập",
      error: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    console.log("Received refresh token:", refreshToken);
    console.log("REFRESH_TOKEN_SECRET:", REFRESH_TOKEN_SECRET);

    if (!refreshToken) {
      console.log("No refresh token provided");
      return res.status(401).json({ message: "Vui lòng cung cấp refresh token" });
    }

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      console.log("Refresh token verified, decoded:", decoded);

      const newAccessToken = jwt.sign(
        { id_user: decoded.id_user, email: decoded.email, role: decoded.role },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "30d" } 
      );
      console.log("New access token generated:", newAccessToken);

      return res.status(200).json({
        message: "Làm mới token thành công",
        accessToken: newAccessToken,
      });
    } catch (error) {
      console.error("Refresh token verification failed:", error.message);
      return res.status(403).json({
        message: "Refresh token không hợp lệ hoặc đã hết hạn",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    return res.status(500).json({
      message: "Lỗi khi làm mới token",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      expires: new Date(0),
    });

    return res.status(200).json({
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("Error logging out:", error.message);
    return res.status(500).json({
      message: "Lỗi khi đăng xuất",
      error: error.message,
    });
  }
};

const getInfoUser = async (req, res) => {
  try {
    const { id_user } = req.params;
    const userIdFromToken = req.user.id_user;
    const userRole = req.user.role;

    if (!id_user || isNaN(id_user)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    if (userRole !== "admin" && parseInt(id_user) !== userIdFromToken) {
      return res.status(403).json({ message: "Bạn không có quyền xem thông tin của người dùng khác" });
    }

    const user = await model.user.findOne({
      where: { id_user },
      attributes: ["id_user", "fullname", "email", "phone_number", "address", "createdAt", "role"],
    });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user info:", error.message);
    return res.status(500).json({
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await model.user.findAll({
      attributes: [
        "id_user",
        "fullname",
        "email",
        "phone_number",
        "address",
        "createdAt",
        "updatedAt",
        "role",
      ],
    });

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng nào",
      });
    }

    const userList = users.map(user => ({
      id_user: user.id_user,
      fullname: user.fullname,
      email: user.email,
      phone_number: user.phone_number,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
    }));

    return res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      data: userList,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error.message);
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Mật khẩu hiện tại và mới không được để trống",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    const user = await model.user.findOne({ where: { id_user: userId } });
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await model.user.update(
      { password: hashedNewPassword },
      { where: { id_user: userId } }
    );

    return res.status(200).json({
      message: "Thay đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi khi thay đổi mật khẩu:", error.message);
    return res.status(500).json({
      message: "Lỗi khi thay đổi mật khẩu",
      error: error.message,
    });
  }
};

const updateInfoUser = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { fullname, email, phone_number, address } = req.body;

    let user = await model.user.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    if (!fullname || !email || !phone_number || !address) {
      return res.status(400).json({
        message: "Các thông tin không được để trống",
        data: null,
      });
    }

    const existingEmail = await model.user.findOne({
      where: { email, id_user: { [Op.ne]: userId } },
    });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email đã được sử dụng",
      });
    }

    await model.user.update(
      {
        fullname,
        email,
        phone_number,
        address,
      },
      { where: { id_user: userId } }
    );

    user = await model.user.findByPk(userId);

    const userData = {
      fullname: user.fullname,
      email: user.email,
      phone_number: user.phone_number,
      address: user.address,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({ message: "Cập nhật thông tin thành công", data: userData });
  } catch (err) {
    return res.status(400).json({ message: "Lỗi khi cập nhật thông tin", error: err.message });
  }
};

const searchUsersByKeyword = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;

    // Kiểm tra từ khóa
    if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
      return res.status(400).json({
        message: "Vui lòng cung cấp từ khóa tìm kiếm hợp lệ",
      });
    }

    // Chuẩn hóa page và limit
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    // Tìm kiếm người dùng theo từ khóa trong fullname, email, phone_number
    const result = await model.user.findAndCountAll({
      where: {
        [Op.or]: [
          { fullname: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
          { phone_number: { [Op.like]: `%${keyword}%` } },
          { address: { [Op.like]: `%${keyword}%` } },
        ],
      },
      attributes: [
        "id_user",
        "fullname",
        "email",
        "phone_number",
        "address",
        "createdAt",
        "updatedAt",
        "role",
      ],
      limit: limitNum,
      offset,
    });

    const users = result.rows.map((user) => user.toJSON());
    const totalItems = result.count;

    if (users.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng nào phù hợp với từ khóa",
      });
    }

    const totalPages = Math.ceil(totalItems / limitNum);
    const pagination = {
      currentPage: pageNum,
      itemsPerPage: limitNum,
      totalItems,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };

    return res.status(200).json({
      message: "Tìm kiếm người dùng thành công",
      data: users,
      pagination,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm người dùng:", error.message);
    return res.status(500).json({
      message: "Lỗi khi tìm kiếm người dùng",
      error: error.message,
    });
  }
};

export {
  registerUser,
  sendVerificationEmail,
  sendConfirmationEmail, 
  verifyEmail, 
  resendVerificationEmail,
  loginUser,
  refreshToken,
  logout,
  getInfoUser,
  getAllUsers,
  changePassword,
  updateInfoUser,
  searchUsersByKeyword,
};