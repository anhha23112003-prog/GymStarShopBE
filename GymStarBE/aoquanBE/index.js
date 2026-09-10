// index.js
import express from "express";
import rootRoutes from "./src/routes/root.router.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./src/config/db.config.js";
import initModels from './src/models/init-models.js';
import { verifyEmail, resendVerificationEmail } from './src/controllers/user.controller.js'; // Import từ userController

dotenv.config();

console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);

// Khởi tạo các model
const models = initModels(sequelize);
Object.keys(models).forEach(modelName => {
  if (sequelize.models[modelName]) {
    console.warn(`Model ${modelName} is already defined, overwriting...`);
  }
  sequelize.models[modelName] = models[modelName];
});
console.log('Available models after init:', sequelize.models);

// Kiểm tra kết nối database
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// Đồng bộ model
sequelize.sync({ force: false }).then(() => {
  console.log('Database & tables synced!');
}).catch(err => {
  console.error('Error syncing database:', err);
});

const app = express();

// Danh sách các origin được phép
const allowedOrigins = [
  "http://localhost:5173",
  "https://shopquanao-f7yd.onrender.com",
];

app.set("query parser", "extended");
app.use(express.static("public"));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Gắn sequelize và models vào req
app.use((req, res, next) => {
  req.sequelize = sequelize;
  req.sequelize.models = sequelize.models;
  console.log('Available models:', sequelize.models);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to quanAoBE backend!" });
});

// Route để xử lý xác nhận trực tiếp
app.get('/verify-email-direct', verifyEmail);

// API để gửi lại email xác nhận
app.post('/resend-verification-email', resendVerificationEmail);

app.use(rootRoutes);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Lỗi server", error: err.message });
});

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});