// ========================== IMPORT THƯ VIỆN ========================== //
import express from 'express';                  // Framework tạo web server
import mongoose from 'mongoose';                // Kết nối & thao tác với MongoDB
import 'dotenv/config';                         // Đọc biến môi trường từ file .env
import bcrypt from 'bcrypt';                    // Mã hóa mật khẩu
import User from './Schema/User.js';            // Schema User
import { nanoid } from 'nanoid';                // Tạo chuỗi ID ngẫu nhiên
import jwt from 'jsonwebtoken';                 // Tạo JWT token
import cors from 'cors';                        // Cho phép CORS (cross-origin)
import admin from "firebase-admin";             // Firebase Admin
import { createRequire } from "module";         // Dùng require() trong ESM
const requireCJS = createRequire(import.meta.url);
const serviceAccountKey = requireCJS("./react-js-blog-website-946b4-firebase-adminsdk-fbsvc-127884941c.json");
import { getAuth } from "firebase-admin/auth";  // Xác thực token Google 
import aws from "aws-sdk"

// ========================== CẤU HÌNH SERVER ========================== //
const server = express();
const PORT = 3000;

// Khởi tạo Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

// Regex kiểm tra email và password
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

// Middleware: cho phép server đọc JSON và xử lý CORS
server.use(express.json());
server.use(cors());

// Kết nối MongoDB
mongoose.connect(process.env.DB_LOCATION, { autoIndex: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Dừng server nếu không kết nối được DB
    });
//setting up backblaze similiar with S3 bucket
const s3 = new aws.S3({
  endpoint: process.env.B2_ENDPOINT, // B2 S3 endpoint
  accessKeyId: process.env.AWS_ACCESS_KEY, // keyID,access_key
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // appKey , secret_access_key
  signatureVersion: 'v4',
  region: process.env.AWS_REGION
});

// ========================== HÀM TIỆN ÍCH ========================== //
// Format dữ liệu trả về cho client (chỉ cần thiết)
const formatDatatoSend = (user) => {
    const access_token = jwt.sign(
        { id: user._id },
        process.env.SECRET_ACCECSS_KEY,
        { expiresIn: '1h' }
    );

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    };
};

// Tạo username từ email, đảm bảo không trùng
const generateUsername = async (email) => {
    let username = email.split("@")[0]; // Lấy phần trước @
    const exists = await User.exists({ "personal_info.username": username });
    if (exists) {
        username += nanoid().substring(0, 5); // Thêm 5 ký tự ngẫu nhiên nếu trùng
    }
    return username;
};

// ========================== ROUTES ========================== //
// 1️⃣ Đăng ký tài khoản
server.post("/signup", async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || fullname.length < 3) {
        return res.status(400).json({ error: "Full name must be at least 3 letters long" });
    }
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email" });
    }
    if (!password || !passwordRegex.test(password)) {
        return res.status(400).json({
            error: "Password must be 6-20 chars, include 1 uppercase, 1 lowercase, 1 number"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const username = await generateUsername(email);
        const user = new User({
            personal_info: { fullname, email, password: hashedPassword, username }
        });
        await user.save();
        return res.status(200).json(formatDatatoSend(user));
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: "Email already exists" });
        return res.status(500).json({ error: err.message });
    }
});

// 2️⃣ Đăng nhập
server.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ "personal_info.email": email });
        if (!user) return res.status(403).json({ error: "Email not found" });

        const isPasswordValid = await bcrypt.compare(password, user.personal_info.password);
        if (!isPasswordValid) return res.status(403).json({ error: "Incorrect password" });

        return res.status(200).json(formatDatatoSend(user));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 3️⃣ Google Authentication
server.post("/google-auth", async (req, res) => {
    try {
        const { access_token } = req.body;
        const decodeUser = await getAuth().verifyIdToken(access_token);
        const { email, name, picture } = decodeUser;
        const profile_img = picture.replace("s96-c", "s384-c");

        let user = await User.findOne({ "personal_info.email": email });

        if (user) {
            if (!user.google_auth) {
                return res.status(403).json({
                    error: "This email was signed up without Google. Please log in with password."
                });
            }
        } else {
            const username = await generateUsername(email);
            user = new User({
                personal_info: { fullname: name, email, username, profile_img },
                google_auth: true
            });
            await user.save();
        }

        return res.status(200).json(formatDatatoSend(user));
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Failed to authenticate with Google. Try another account."
        });
    }
});

// ========================== KHỞI ĐỘNG SERVER ========================== //
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
