// ========================== IMPORT THƯ VIỆN ========================== //
import express from "express"; // framework server
import mongoose from "mongoose"; // MongoDB ODM
import "dotenv/config"; // load .env
import bcrypt from "bcrypt"; // hash password
import User from "./Schema/User.js"; // model User
import { nanoid } from "nanoid"; // tạo string ngẫu nhiên
import jwt from "jsonwebtoken"; // tạo token
import cors from "cors"; // enable CORS
import admin from "firebase-admin"; // Firebase Admin
import { createRequire } from "module"; // để dùng require với ES Module
const requireCJS = createRequire(import.meta.url);
const serviceAccountKey = requireCJS(
  "./react-js-blog-website-946b4-firebase-adminsdk-fbsvc-127884941c.json",
);
import { getAuth } from "firebase-admin/auth";
import { v2 as cloudinary } from "cloudinary";
import { verify } from "crypto";
import { error, profile, timeLog } from "console";
import Blog from "./Schema/Blog.js";
import { title } from "process";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";
import { json } from "stream/consumers";

// ========================== CẤU HÌNH SERVER ========================== //
const server = express();
const PORT = 3000;

// Khởi tạo Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

// Regex kiểm tra email và password
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

// Middleware
server.use(express.json());
server.use(cors());

// Kết nối MongoDB
mongoose
  .connect(process.env.DB_LOCATION, { autoIndex: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// ========================== CẤU HÌNH CLOUDINARY ========================== //
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ========================== HÀM TIỆN ÍCH ========================== //
// Tạo token và trả data cơ bản cho frontend
//check role
const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id, admin: user.admin },
    process.env.SECRET_ACCESS_KEY,
    { expiresIn: "1h" },
  );

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    isAdmin: user.admin, //check role
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
  const authHeader = req.headers["authorization"]; // lấy toàn bộ chuỗi trong authorization là một phần trong headers(tức xác thực)
  const token = authHeader && authHeader.split(" ")[1]; // nếu có authheaders tồn tại thì lấy phần thứ 2 sau khoảng tróng gàn vào token
  if (token == null) {
    return res.status(401).json({ error: "No access token" }); //server phản hồi lại nếu client không gửi token
  }
  //hàm chính xác thực JWT. Dùng verify để kiểm tra những thành phần trong function verify so với jwt
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user.id; // gọi req.user là người dùng đã xác thực bằng id
    req.admin = user.admin;
    next(); // cho phép request đi tiếp vào route
  });
};

// ========================== ROUTES ========================== //

// 1️⃣ Signup
server.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || fullname.length < 3)
    return res
      .status(400)
      .json({ error: "Full name must be at least 3 letters long" });
  if (!email || !emailRegex.test(email))
    return res.status(400).json({ error: "Invalid email" });
  if (!password || !passwordRegex.test(password))
    return res.status(400).json({
      error:
        "Password must be 6-20 chars, include 1 uppercase, 1 lowercase, 1 number",
    });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);
    const user = new User({
      personal_info: { fullname, email, password: hashedPassword, username },
    });
    await user.save();
    return res.status(200).json(formatDatatoSend(user));
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: "Email already exists" });
    return res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Signin
server.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) return res.status(403).json({ error: "Email not found" });

    const isPasswordValid = await bcrypt.compare(
      password,
      user.personal_info.password,
    );
    if (!isPasswordValid)
      return res.status(403).json({ error: "Incorrect password" });

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
      if (!user.google_auth)
        return res.status(403).json({
          error:
            "This email was signed up without Google. Please log in with password.",
        });
    } else {
      const username = await generateUsername(email);
      user = new User({
        personal_info: { fullname: name, email, username, profile_img },
        google_auth: true,
      });
      await user.save();
    }

    return res.status(200).json(formatDatatoSend(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Failed to authenticate with Google. Try another account.",
    });
  }
});
//change password check password nhập và password user trước đó có nhập đúng format không
server.post("/change-password", verifyJWT, (req, res) => {
  let { currentPassword, newPassword } = req.body;
  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res
      .status(403)
      .json({
        error:
          "Password must be 6-20 chars, include 1 uppercase, 1 lowercase, 1 number",
      });
  }
  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res
          .status(403)
          .json({
            error:
              "You can't change password because you plogged in throught google",
          });
      }
      //so sánh mật khẩu current và mật khẩu đã tồn tại trong db
      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({
                error:
                  "Some error occured while changing the password, please try again here",
              });
          }
          if (!result) {
            return res
              .status(403)
              .json({ error: "Incorrect current password" });
          }
          //chuyển đặt mk thành 1 dạng kí tự hash
          //callback là hàm chạy sau cùng và nó đảm bảo rằng code trong hàm này chỉ chạy khi hashed_password đã đc chuyển hóa(nói cách khác nó giống như kết quả đánh giá cho quá trình chuyển đổi)
          bcrypt.hash(newPassword, 10, (err, hashed_password) => {
            if (err) {
              return res.status(500).json({ error: "Failed to hash password" });
            }

            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashed_password },
            )
              .then(() => {
                return res.status(200).json({ status: "Password changed" });
              })
              .catch(() => {
                return res
                  .status(500)
                  .json({ error: "Failed to save new password" });
              });
          });
        },
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "User not found" });
    });
});

// ========================== GENERATE UPLOAD URL (Cloudinary) ========================== //
const generateUploadURL = async () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "banner_images";
  const upload_preset = "banner_upload";

  // Tạo chữ ký upload có thể dùng frontend
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp, upload_preset },
    process.env.CLOUDINARY_API_SECRET,
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
    timestamp,
    signature,
    upload_preset,
  };
};

// Lấy upload config cho frontend
server.get("/get-upload-url", async (req, res) => {
  try {
    const uploadConfig = await generateUploadURL();
    res.status(200).json({ uploadConfig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// 5️⃣ Update banner URL
server.post("/update-banner", async (req, res) => {
  const { userId, bannerUrl } = req.body;
  if (!userId || !bannerUrl)
    return res.status(400).json({ error: "Missing info" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.personal_info.banner_img = bannerUrl;
    await user.save();

    return res.status(200).json({ bannerUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// Upload profile image
server.post("/update-profile-img", verifyJWT, (req, res) => {
  let { url } = req.body;
  User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
    .then(() => {
      return res.status(200).json({ profile_img: url });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
//updata toàn bộ profile
server.post("/update-profile", verifyJWT, (req, res) => {
  let { username, bio, social_links } = req.body;
  let bioLimit = 150;
  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: "Username should be at least 3 letters long" });
  }
  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `Bio should not be more than ${bioLimit} characters` });
  }
  let socialLinksArr = Object.keys(social_links); //lấy mảng tất cả các key của social_link mà k lấy value
  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;
        //hostname = https://youtube.com
        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] !== "website"
        ) {
          return res
            .status(403)
            .json({
              error: `${socialLinksArr[i]} link is valid. You must to enter full link`,
            });
        }
      }
    }
  } catch (err) {
    return res
      .status(500)
      .json({
        error: "You must provide full social links with http(s) included",
      });
  }
  let UpdateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };
  User.findOneAndUpdate({ _id: req.user }, UpdateObj, { runValidator: true })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(409).json({ error: "Username is already taken" });
      }
      return res.status(500).json({ error: err.message });
    });
});
//Latest blog route
server.post("/latest-blogs", (req, res) => {
  let { page } = req.body;
  let maxLimit = 5;
  Blog.find({ draft: false }) //tìm kiểm blog nào không phải bản nháp
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.full_name -_id",
    ) //lấy thông tin của tác giả giống với join trong mongo
    .sort({ publishedAt: -1 }) // xắp xếp blog theo ngày xuất bản -1 là mới lên dầu , 1 là cũ lên đầu
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit) // Công thức: .skip((page - 1) * limit).VD litmit 5 bài/1 trang thì ở trang 1 là display 1-5
    .limit(maxLimit) // giới hạn số bài viết hiển thị
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
//Blog theo trang
server.post("/all-latest-blogs-count", (req, res) =>
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    }),
);

//lọc blog theo danh mục(categories)
server.post("/search-blogs", (req, res) => {
  let { tag, author, query, page, limit, eliminate_blog } = req.body; // dư liệu tag nhạn từ client
  let findQuery;
  //kiểm tra xem người dùng tìm kiếm nd theo tag hay theo search query
  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } }; //$ne tức là not equal nghĩa là không bằng(loại bỏ bài blog đang xem ra khỏi đề cử)
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") }; //tạo ra regex để tìm query và không phân biệt i tức chưa hoa chữ thường
  } else if (author) {
    findQuery = { author, draft: false }; //có author và là bản thật
  }
  let maxLimit = limit ? limit : 2;
  Blog.find(findQuery) //tìm kiểm blog nào không phải bản nháp
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.full_name -_id",
    ) //lấy thông tin của tác giả giống với join trong mongo
    .sort({ publishedAt: -1 }) // xắp xếp blog theo ngày xuất bản -1 là mới lên dầu , 1 là cũ lên đầu
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit) // công thức tính phân trang //  dúng skip để bỏ qua trính bị trung dữ liệu
    .limit(maxLimit) // giới hạn số bài viết hiển thị
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
// tổng số bài blog sẽ có theo mỗi tag. VD technology có 13 bài
server.post("/search-blogs-count", (req, res) => {
  let { tag, author, query } = req.body; //destructuring nhận các tag khi người dùng chọn và gán vào đối tượng tag
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") }; //tạo ra regex để tìm query và không phân biệt i tức chưa hoa chữ thường
  } else if (author) {
    findQuery = { author, draft: false }; //có author và là bản thật
  }
  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
//tìm kiếm user
server.post("/search-users", (req, res) => {
  let { query } = req.body; // dữ liệu nhập trên thanh tìm kiếm
  //new RegExp thường dùng trong tìm kiếm vào kết quản nó có dạng query/i trên tab
  User.find({ "personal_info.username": new RegExp(query, "i") }) //RegExp(mẫu cần tìm, tùy chọn còn gọi là yêu cầu,đk)
    .limit(50)
    .select(
      "personal_info.fullname personal_info.username personal_info.profile_img -_id",
    )
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
// xử lí dữ liệu khi client gửi tên username để xem profile
//find trả về nhiều kết quả 1 list, còn findOne chỉ trả 1 kết quả
server.post("/get-profile", (req, res) => {
  let { username } = req.body; // tên người dùng nhập trên input
  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updateAt -blogs") // loại bỏ thông tin quan trọng
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
//lấy dữ liệu detail khi dựa trên blog_id
server.post("/get-blog", (req, res) => {
  const { blog_id, draft, mode } = req.body;
  let incrementVal = mode !== "edit" ? 1 : 0;
  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } },
    { new: true },
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img",
    )
    .select("title des banner content activity publishedAt blog_id tags")
    .then((blog) => {
      // update user đọc blog (chạy nền, KHÔNG gửi response ở đây)
      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementVal } },
      ).catch((err) => {
        return res.status(500).json({ error: err.message });
      });
      // nếu blog là bản nháp và ! không có quền xem, truy cập bản nháp
      if (blog.draft && !draft) {
        return res.status(500).json({ error: "You can not access draft blog" });
      }
      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//hiển thị blog theo trending
server.get("/trending-blogs", (req, res) => {
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.full_name -_id",
    )
    .sort({
      "activity.total_read": -1,
      "activity.total_like": -1,
      publishedAt: -1,
    }) // sắp xếp giảm giần cái nào lượt nhiều đương trước, trending
    .select("blog_id title publishedAt -_id ")
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
//xử lí like blog
server.post("/like-blog", verifyJWT, (req, res) => {
  let user_id = req.user; // nếu verifyJWT gán đúng id
  //lấy id của user đã đăng nhập
  let { _id, isLikeByUser } = req.body; // nhận id từ bài blog, event click từ user
  let incrementVal = !isLikeByUser ? 1 : -1;
  //tìm kiếm id click và cập nhật tổng số like
  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } },
  ).then((blog) => {
    if (!isLikeByUser) {
      //hàm khởi tạo(contructor) truyền các dữ liệu sau vào
      let like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      }); //gọi hàm thông báo khi like
      like.save().then((notification) => {
        return res.status(200).json({ liked_by_user: true });
      });
    }
    //nếu đã like
    else {
      //findOneAndUpdate(tìm document thỏa đk) xóa khỏi db
      Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
        .then((data) => {
          return res.status(200).json({ liked_by_user: false });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  });
});
//lấy thông tin khi user like blog
server.post("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user; //lấy user_id đã được verify
  let { _id } = req.body; //id của like blog khi user click
  //exists() kiểm tra document(user,like,blog) có tổn tại hay khôgn
  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
  //result là toàn bộ thông tin của thao tác click đó
});

//thêm comment
server.post("/add-comment", verifyJWT, (req, res) => {
  // id user lấy từ middleware verifyJWT
  let user_id = req.user;

  // lấy dữ liệu gửi lên từ client
  let { _id, comment, blog_author, replying_to, notification_id } = req.body;

  // validate comment rỗng
  if (!comment.length) {
    return res.status(403).json({ error: "Write something to leave" });
  }

  // tạo 1 document comment mới
  let commentObj = {
    blog_id: _id, // id bài blog
    blog_author, // tác giả blog
    comment, // nội dung comment
    commented_by: user_id, // người comment
  };
  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }

  // lưu comment vào MongoDB
  new Comment(commentObj)
    .save()
    .then(async (commentFile) => {
      // destructuring dữ liệu từ document vừa lưu
      let { comment, commentedAt, children } = commentFile;

      // cập nhật blog:
      // - push id comment vào mảng comments
      // - tăng tổng số comment
      // - tăng tổng comment cha
      Blog.findOneAndUpdate(
        { _id },
        {
          $push: { comments: commentFile._id },
          $inc: {
            "activity.total_comments": 1,
            "activity.total_parent_comments": replying_to ? 0 : 1,
          },
        },
      ).then((blog) => {
        console.log("New comment created");
      });

      // tạo notification cho tác giả blog
      let notificationObj = {
        type: replying_to ? "reply" : "comment",
        blog: _id, // ❗ sửa "_id" string → biến _id
        notification_for: blog_author,
        user: user_id,
        comment: commentFile._id,
      };

      if (replying_to) {
        notificationObj.replied_on_comment = replying_to;
        await Comment.findOneAndUpdate(
          { _id: replying_to },
          { $push: { children: commentFile._id } },
        ).then((replyingToCommentDoc) => {
          notificationObj.notification_for = replyingToCommentDoc.commented_by;
        });
        if (notification_id) {
          Notification.findOneAndUpdate(
            { _id: notification_id },
            { reply: commentFile._id },
          )
            .then((notification) => {
              console.log("notification updated");
            })
            .catch((err) => {
              console.log(err.message);
            });
        }
      }

      new Notification(notificationObj)
        .save()
        .then(() => console.log("New notification created"));

      // trả dữ liệu cần thiết cho frontend
      return res.status(200).json({
        comment,
        commentedAt,
        _id: commentFile._id,
        user_id,
        children,
        parent: commentFile.parent || null,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Failed to add comment" });
    });
});

//fetching comment children theo parent_id
server.post("/get-replies", async (req, res) => {
  let { _id, skip } = req.body;
  let maxLimit = 5;

  Comment.findOne({ _id })
    .populate({
      path: "children",
      options: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select:
          "personal_info.profile_img personal_info.fullname personal_info.username",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

const deleteComments = async (_id) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id });
    if (!comment) return;

    // 1️⃣ Remove khỏi parent nếu là reply
    if (comment.parent) {
      await Comment.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: _id } },
      );
    }

    // 2️⃣ Xoá notification liên quan
    await Notification.deleteMany({
      $or: [{ comment: _id }, { reply: _id }],
    });

    // 3️⃣ Update blog
    await Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $pull: { comments: _id },
        $inc: {
          "activity.total_comments": -1,
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        },
      },
    );

    // 4️⃣ Xoá reply (đệ quy – có kiểm soát)
    if (comment.children && comment.children.length) {
      for (const replyId of comment.children) {
        await deleteComments(replyId);
      }
    }
  } catch (err) {
    console.error("Delete comment error:", err.message);
  }
};

//check if có lỗi
server.post("/delete-comment", verifyJWT, async (req, res) => {
  try {
    const user_id = req.user;
    const { _id } = req.body;

    const comment = await Comment.findOne({ _id });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (user_id == comment.commented_by || user_id == comment.blog_author) {
      await deleteComments(_id);
      return res.status(200).json({ status: "done" });
    }

    return res.status(403).json({ error: "You can not delete this comment" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.post("/get_blog_comments", async (req, res) => {
  let { blog_id, skip = 0 } = req.body;
  let limit = 5;

  Comment.find({
    blog_id,
    isReply: false, // ✅ CHỈ LẤY COMMENT CHA
  })
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullname personal_info.profile_img",
    )
    .sort({ commentedAt: -1 })
    .skip(skip)
    .limit(limit)
    .then((comment) => {
      return res.status(200).json(comment);
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/create-blog", verifyJWT, (req, res) => {
  let authorId = req.user; // lấy thông tin user đã đăng nhập(tức đã được verify)
  let isAdmin = req.admin;
  if (isAdmin) {
    let { title, des, banner, tags, content, draft, id } = req.body; // lấy cái trường đó từ req.body(tức từ nội dùng của trang)
    if (!title.length) {
      //kiểm tra sự tồn tại của từng trường đảm bảo không để trống
      return res.status(403).json({ error: "You must provide a title" });
    }
    if (!draft) {
      // nếu không phải là bảng draft thì tiếp tục kiểm tra kĩ hơn
      if (!title.length || des.length > 200) {
        return res.status(403).json({
          error: "You must provide blog descriptiton under 200 characters",
        });
      }
      if (!banner.length) {
        return res
          .status(403)
          .json({ error: "You must provide blog banner to publish it" });
      }
      if (!content.blocks.length) {
        return res
          .status(403)
          .json({ error: "There must be some blog content  to publish it" });
      }
      if (!tags.length || tags.length > 5) {
        return res
          .status(403)
          .json({ error: "Provide tags in order to publish blog,  Maximum 5" });
      }
    }

    tags = tags.map((tag) => tag.toLowerCase()); // chuyển các phần tử tags về chưa thường
    let blog_id =
      id ||
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid(); // chuyển tiêu đề về dạng slug và thêm id cho nó

    if (id) {
      //finOneAndUpdate(dk tìm, dữ liệu cập nhật, tùy chọn)
      Blog.findOneAndUpdate(
        { blog_id },
        { title, des, banner, content, tags, draft: draft ? draft : false },
      )
        .then(() => {
          return res.status(200).json({ id: blog_id });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ error: "Failled to update total posts numer " });
        });
    } else {
      let blog = new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author: authorId,
        blog_id,
        draft: Boolean(draft), //tạo các instance và lưu vào DB
      });
      blog
        .save()
        .then((blog) => {
          //lưu thành công
          let incrementVal = draft ? 0 : 1; // nếu không tăng số bài đăng là draft(bản thảo) nếu tăng là publish
          //Dùng điều kiện authorid = id của client để tìm người người
          //sau đó cập nhập số bài viết incrementVal, và push (tức thêm new blog vào list blogs của user)
          User.findOneAndUpdate(
            { _id: authorId },
            {
              $inc: { "account_info.total_posts": incrementVal },
              $push: { blogs: blog._id },
            },
          )
            .then((user) => {
              return res.status(200).json({ id: blog_id });
            })
            .catch((err) => {
              return res
                .status(500)
                .json({ error: "Failed to update total posts number" });
            });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  }
  else {
    return res.status(404).json({ error: "Only administrators are allowed to create blog" })
  }
});
// lấy các bản tin thao báo mới
server.get("/new-notification", verifyJWT, (req, res) => {
  let user_id = req.user;

  //kiểm tra tồn tại có thông báo nào gửi cho tôi, chưa đọc và không phải do chỉnh tôi tự tạo
  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id },
  })
    .then((results) => {
      if (results) {
        return res.status(200).json({ new_notification_available: true });
      } else {
        return res.status(200).json({ new_notification_available: false });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});
//lấy danh sách các thông báo có bộ lọc
server.post("/notifications", verifyJWT, (req, res) => {
  let user_id = req.user; // ✅
  // Dữ liệu client gửi lên: trang, bộ lọc, số thông báo đã xoá
  let { page, filter, deletedDocCount } = req.body;
  let maxLimit = 10;
  // Điều kiện tìm notification:
  // - gửi cho user hiện tại
  // - không lấy notification do chính user tạo
  let findQuery = {
    notification_for: user_id,
    user: { $ne: user_id },
  };

  // Tính số document cần bỏ qua (phân trang)
  let skipDocs = (page - 1) * maxLimit;

  // Nếu filter khác 'all' thì lọc theo loại notification
  if (filter !== "all") {
    findQuery.type = filter;
  }

  // Nếu đã xoá notification ở client thì bù lại số lượng skip
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  // Query lấy danh sách notification
  Notification.find(findQuery)
    .skip(skipDocs) // phân trang
    .limit(maxLimit)
    .populate("blog", "title blog_id") // lấy thông tin bài viết
    .populate(
      "user",
      "personal_info.fullname personal_info.username personal_info.profile_img",
    ) // người tạo
    .populate("comment", "comment") // comment gốc
    .populate("replied_on_comment", "comment") // comment bị reply
    .populate("reply", "comment") // nội dung reply
    .sort({ createdAt: -1 }) // mới nhất lên trước
    .select("createdAt type seen reply") // chỉ lấy field cần thiết
    .then((notifications) => {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => {
          console.log("Notification seen");
        });
      return res.status(200).json({ notifications });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});
//đếm tất cả các thông báo
server.post("/all-notification-count", verifyJWT, (req, res) => {
  let user_id = req.user; // ✅
  let { filter } = req.body;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };
  if (filter !== "all") {
    findQuery.type = filter;
  }
  //đêm số thông báo
  Notification.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//lấy tứ cả bài blog mà user đã viết bao gồm cả bảng draft
server.post("/user-written-blogs", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { page, draft, query, deletedDocCount } = req.body;
  let maxLimit = 5;
  let skipDocs = (page - 1) * maxLimit; //phân trang cứ 1 trang là 5 bài
  //nếu có bài viết bị xóa thì số bài viết bỏ qua cũng sẽ giảm dần theo bài viết bị xóa
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }
  //new RegExp(query, 'i') lấy các title có chưa từ khóa tìm kiếm không phân biệt chữ hoa chưa thường
  Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select("title banner publishedAt blog_id activity des draft -_id") // nhưng field mà UI cần để hiển thi dữ liệu
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//đếm tổng số blog của user để UI chia bài và phân trang cho đúng
server.post("/user-written-blogs-count", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { draft, query } = req.body;
  //new RegExp(query, 'i') lấy các title có chưa từ khóa tìm kiếm không phân biệt chữ hoa chưa thường
  Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, "i") })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/delete-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { blog_id } = req.body;
  let isAdmin = req.admin;
  if(isAdmin)
  {
Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      //khi xóa 1 bài blog dùng deleteMany sẽ xóa luôn nhiều thông báo liên quan theo blog id như ai like, comment,reply,..
      Notification.deleteMany({ blog: blog._id }).then((data) => {
        console.log("notificaitons deleted");
      });
      Comment.deleteMany({ blog: blog._id }).then((data) => {
        console.log("comments deleted");
      });
      User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } },
      ).then((user) => {
        console.log("Blog deleted");
      });
      return res.status(200).json({ status: "done" });
    })
    .catch((err) => {
      return res.status(403).json({ error: err.message });
    });
  }
  else{
    return res.status(403).json({error:"Only administrators are allowed to delete blog"})
  }
  
});
// ========================== KHỞI ĐỘNG SERVER ========================== //
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
