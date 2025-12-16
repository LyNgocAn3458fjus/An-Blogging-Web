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
import { verify } from 'crypto';
import { error, timeLog } from 'console';
import Blog from './Schema/Blog.js'
import { title } from 'process';

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

//kiểm tra token của client chỉ cho phép những yêu cầu hợp lệ 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];// lấy toàn bộ chuỗi trong authorization là một phần trong headers(tức xác thực)
    const token = authHeader && authHeader.split(" ")[1];// nếu có authheaders tồn tại thì lấy phần thứ 2 sau khoảng tróng gàn vào token
    if (token == null) {
        return res.status(401).json({ error: "No access token" })//server phản hồi lại nếu client không gửi token
    }
    //hàm chính xác thực JWT. Dùng verify để kiểm tra những thành phần trong function verify so với jwt
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access token is invalid" })
        }
        req.user = user.id// gần thông tin user bằng id đã xác thực vào request 
        next()// cho phép request đi tiếp vào route
    })
}

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
//Latest blog route
server.post("/latest-blogs", (req, res) => {
    let { page } = req.body
    let maxLimit = 5;
    Blog.find({ draft: false }) //tìm kiểm blog nào không phải bản nháp
        .populate("author", "personal_info.profile_img personal_info.username personal_info.full_name -_id")//lấy thông tin của tác giả giống với join trong mongo
        .sort({ "publishedAt": -1 })// xắp xếp blog theo ngày xuất bản -1 là mới lên dầu , 1 là cũ lên đầu
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)// Công thức: .skip((page - 1) * limit).VD litmit 5 bài/1 trang thì ở trang 1 là display 1-5
        .limit(maxLimit)// giới hạn số bài viết hiển thị 
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })

})
//Blog theo trang
server.post("/all-latest-blogs-count", (req, res) =>
    Blog.countDocuments({ draft: false })
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })
        })
)


//lọc blog theo danh mục(categories)
server.post("/search-blogs", (req, res) => {
    let { tag,author, query, page } = req.body; // dư liệu tag nhạn từ client
    let findQuery;
    //kiểm tra xem người dùng tìm kiếm nd theo tag hay theo search query
    if (tag) {
        findQuery = { tags: tag, draft: false }
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }//tạo ra regex để tìm query và không phân biệt i tức chưa hoa chữ thường
    }
    else if(author){
        findQuery = {author,draft:false }//có author và là bản thật
    }
    let maxLimit = 2;
    Blog.find(findQuery) //tìm kiểm blog nào không phải bản nháp
        .populate("author", "personal_info.profile_img personal_info.username personal_info.full_name -_id")//lấy thông tin của tác giả giống với join trong mongo
        .sort({ "publishedAt": -1 })// xắp xếp blog theo ngày xuất bản -1 là mới lên dầu , 1 là cũ lên đầu
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)  // công thức tính phân trang //  dúng skip để bỏ qua trính bị trung dữ liệu
        .limit(maxLimit)// giới hạn số bài viết hiển thị 
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})
// tổng số bài blog sẽ có theo mỗi tag. VD technology có 13 bài 
server.post("/search-blogs-count", (req, res) => {
    let { tag, author, query } = req.body;//destructuring nhận các tag khi người dùng chọn và gán vào đối tượng tag
    let findQuery
    if (tag) {
        findQuery = { tags: tag, draft: false }
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') }//tạo ra regex để tìm query và không phân biệt i tức chưa hoa chữ thường
    }
    else if(author){
        findQuery = {author,draft:false }//có author và là bản thật
    }
    Blog.countDocuments(findQuery)
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch(
            err => {
                return res.status(500).json({ error: err.message })
            }
        )

})
//tìm kiếm user 
server.post("/search-users", (req, res) => {
    let { query } = req.body;// dữ liệu nhập trên thanh tìm kiếm 
    //new RegExp thường dùng trong tìm kiếm vào kết quản nó có dạng query/i trên tab
    User.find({ "personal_info.username": new RegExp(query, 'i') })   //RegExp(mẫu cần tìm, tùy chọn còn gọi là yêu cầu,đk)
        .limit(50)
        .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .then(users => {
            return res.status(200).json({ users })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})
// xử lí dữ liệu khi client gửi tên username để xem profile
//find trả về nhiều kết quả 1 list, còn findOne chỉ trả 1 kết quả
server.post("/get-profile",(req,res)=>{
    let  {username} = req.body// tên người dùng nhập trên input
    User.findOne({"personal_info.username":username})
    .select("-personal_info.password -google_auth -updateAt -blogs") // loại bỏ thông tin quan trọng
    .then(user =>{
        return res.status(200).json(user)
    })
    .catch(err=>{
        return res.status(500).json({error:err.message})
    })
})


//hiển thị blog theo trending
server.get("/trending-blogs", (req, res) => {
    Blog.find({ draft: false }).populate("author", "personal_info.profile_img personal_info.username personal_info.full_name -_id")
        .sort({ "activity.total_read": -1, "activity.total_like": -1, "publishedAt": -1 })// sắp xếp giảm giần cái nào lượt nhiều đương trước, trending
        .select("blog_id title publishedAt -_id ")
        .limit(5)
        .then((blogs) => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})


server.post("/create-blog", verifyJWT, (req, res) => {
    let authorId = req.user;// lấy thông tin user đã đăng nhập(tức đã được verify)
    let { title, des, banner, tags, content, draft } = req.body; // lấy cái trường đó từ req.body(tức từ nội dùng của trang)
    if (!title.length) {//kiểm tra sự tồn tại của từng trường đảm bảo không để trống
        return res.status(403).json({ error: "You must provide a title" });
    }
    if (!draft) {// nếu không phải là bảng draft thì tiếp tục kiểm tra kĩ hơn
        if (!title.length || des.length > 200) {
            return res.status(403).json({ error: "You must provide blog descriptiton under 200 characters" });
        }
        if (!banner.length) {
            return res.status(403).json({ error: "You must provide blog banner to publish it" });
        }
        if (!content.blocks.length) {
            return res.status(403).json({ error: "There must be some blog content  to publish it" });
        }
        if (!tags.length || tags.length > 5) {
            return res.status(403).json({ error: "Provide tags in order to publish blog,  Maximum 5" });
        }
    }

    tags = tags.map(tag => tag.toLowerCase());// chuyển các phần tử tags về chưa thường
    let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();// chuyển tiêu đề về dạng slug và thêm id cho nó
    let blog = new Blog({
        title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)//tạo các instance và lưu vào DB
    })
    blog.save().then(blog => {//lưu thành công
        let incrementVal = draft ? 0 : 1;// nếu không tăng số bài đăng là draft(bản thảo) nếu tăng là publish 
        //Dùng điều kiện authorid = id của client để tìm người người 
        //sau đó cập nhập số bài viết incrementVal, và push (tức thêm new blog vào list blogs của user)
        User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
            .then(user => {
                return res.status(200).json({ id: blog_id })
            })
            .catch(err => {
                return res.status(500).json({ error: "Failed to update total posts number" })
            })

    })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

// ========================== KHỞI ĐỘNG SERVER ========================== //
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
