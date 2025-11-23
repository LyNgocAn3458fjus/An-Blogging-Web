// ========================== IMPORT THƯ VIỆN ========================== //
import express from 'express';                  // framework server
import mongoose from 'mongoose';                // MongoDB ODM
import 'dotenv/config';                         // load .env
import bcrypt from 'bcrypt';                    // hash password
import User from './Schema/User.js';            // model User
import { nanoid } from 'nanoid';                // tạo string ngẫu nhiên
import jwt from 'jsonwebtoken';                 // tạo token
import cors from 'cors';                        // enable CORS
import admin from "firebase-admin";             // Firebase Admin
import { createRequire } from "module";         // để dùng require với ES Module
const requireCJS = createRequire(import.meta.url);
const serviceAccountKey = requireCJS("./react-js-blog-website-946b4-firebase-adminsdk-fbsvc-127884941c.json");
import { getAuth } from "firebase-admin/auth";  
import { v2 as cloudinary } from 'cloudinary';

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

// Middleware
server.use(express.json());
server.use(cors());

// Kết nối MongoDB
mongoose.connect(process.env.DB_LOCATION, { autoIndex: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

// ========================== CẤU HÌNH CLOUDINARY ========================== //
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========================== HÀM TIỆN ÍCH ========================== //
// Tạo token và trả data cơ bản cho frontend
const formatDatatoSend = (user) => {
    const access_token = jwt.sign(
        { id: user._id },
        process.env.SECRET_ACCESS_KEY,
        { expiresIn: '1h' }
    );

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    };
};

// Tạo username từ email, nếu trùng thì thêm 5 ký tự ngẫu nhiên
const generateUsername = async (email) => {
    let username = email.split("@")[0];
    const exists = await User.exists({ "personal_info.username": username });
    if (exists) username += nanoid().substring(0, 5);
    return username;
};

// ========================== ROUTES ========================== //

// 1️⃣ Signup
server.post("/signup", async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || fullname.length < 3) return res.status(400).json({ error: "Full name must be at least 3 letters long" });
    if (!email || !emailRegex.test(email)) return res.status(400).json({ error: "Invalid email" });
    if (!password || !passwordRegex.test(password)) return res.status(400).json({
        error: "Password must be 6-20 chars, include 1 uppercase, 1 lowercase, 1 number"
    });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const username = await generateUsername(email);
        const user = new User({ personal_info: { fullname, email, password: hashedPassword, username } });
        await user.save();
        return res.status(200).json(formatDatatoSend(user));
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: "Email already exists" });
        return res.status(500).json({ error: err.message });
    }
});

// 2️⃣ Signin
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

// 3️⃣ Google Auth
server.post("/google-auth", async (req, res) => {
    try {
        const { access_token } = req.body;
        const decodeUser = await getAuth().verifyIdToken(access_token);
        const { email, name, picture } = decodeUser;
        const profile_img = picture.replace("s96-c", "s384-c");

        let user = await User.findOne({ "personal_info.email": email });

        if (user) {
            if (!user.google_auth) return res.status(403).json({ error: "This email was signed up without Google. Please log in with password." });
        } else {
            const username = await generateUsername(email);
            user = new User({ personal_info: { fullname: name, email, username, profile_img }, google_auth: true });
            await user.save();
        }

        return res.status(200).json(formatDatatoSend(user));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to authenticate with Google. Try another account." });
    }
});

// ========================== GENERATE UPLOAD URL (Cloudinary) ========================== //
const generateUploadURL = async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "banner_images";
    const upload_preset = "banner_upload";

    // Tạo chữ ký upload có thể dùng frontend
    const signature = cloudinary.utils.api_sign_request(
        { folder, timestamp, upload_preset },
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
        timestamp,
        signature,
        upload_preset
    };
};

// Lấy upload config cho frontend
server.get('/get-upload-url', async (req, res) => {
    try {
        const uploadConfig = await generateUploadURL();
        res.status(200).json({ uploadConfig });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// 5️⃣ Update banner URL
server.post('/update-banner', async (req, res) => {
    const { userId, bannerUrl } = req.body;
    if (!userId || !bannerUrl) return res.status(400).json({ error: 'Missing info' });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.personal_info.banner_img = bannerUrl;
        await user.save();

        return res.status(200).json({ bannerUrl });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ========================== KHỞI ĐỘNG SERVER ========================== //
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
