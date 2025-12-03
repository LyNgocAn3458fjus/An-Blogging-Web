import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // Link: chuyển trang, useNavigate: redirect
import { EditorContext } from "../pages/editor.pages"; // Context chứa state blog
import { Toaster, toast } from "react-hot-toast"; // Toast notification
import defaultBanner from "../imgs/blog banner.png"; // Banner mặc định nếu user chưa chọn
import AnimationWrapper from "../common/page-animation"; // Wrapper animation
import logo from "../imgs/logo.png";
import Tag from "./tags.component"; // Component hiển thị tag
import axios from "axios"; // Gọi API
import { UserContext } from "../App"; // Context chứa thông tin user

const PublishForm = () => {

    /* --------------------------- CONTEXT & STATE --------------------------- */
    const { userAuth: { access_token } } = useContext(UserContext); // Lấy token đăng nhập
    const navigate = useNavigate(); // Hook để điều hướng trang

    const {
        blog,
        blog: { banner, title, tags, des, content },
        setBlog,
        setEditorState
    } = useContext(EditorContext); // Lấy state blog và hàm set từ EditorContext

    const characterLimit = 200; // Giới hạn ký tự mô tả

    /* ----------------------------- INPUT HANDLERS ---------------------------- */

    // Khi user gõ tiêu đề, cập nhật state blog
    const handleBlogTitleChange = (e) => {
        setBlog({ ...blog, title: e.target.value });
    };

    // Khi user gõ mô tả, cập nhật state blog
    const handleBlogDesChange = (e) => {
        setBlog({ ...blog, des: e.target.value });
    };

    // Ngăn enter xuống dòng trong textarea (chỉ cho phép một dòng)
    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) e.preventDefault();
    };

    // Khi user nhấn Enter hoặc dấu phẩy trong input tag
    const handleKeyDown = (e) => {
        if (e.keyCode === 13 || e.keyCode === 188) { // Enter hoặc ,
            e.preventDefault();

            const tag = e.target.value.trim(); // Lấy tag, loại bỏ khoảng trắng
            if (!tag) return; // Bỏ qua nếu rỗng

            if (tags.length >= 5) { // Giới hạn 5 tag
                toast.error("You can only add up to 5 tags");
                return;
            }

            if (!tags.includes(tag)) { // nếu thẻ tag không có trong mã tags thì cập nhập
                setBlog({ ...blog, tags: [...tags, tag] });// không cho tag trùng
            }

            e.target.value = ""; // Xóa input sau khi thêm
        }
    };

    // Quay về trang editor (chưa publish)
    const handleCloseEvent = () => setEditorState("editor");

    // Nếu banner load lỗi, hiển thị banner mặc định
    const handleBannerError = (e) => (e.target.src = defaultBanner);

    /* ---------------------------- PUBLISH HANDLER --------------------------- */

    const publishBlog = (e) => {
        // Nếu nút đang disable, không làm gì cả (tránh click nhiều lần)
        if (e.target.className.includes("disable")) return;

        // Validation đầu vào
        if (!title.length) return toast.error("Write blog title before publishing");
        if (!des.length || des.length > 200)
            return toast.error("You must provide blog description under 200 characters");
        if (!tags.length) return toast.error("Enter at least 1 tag to help us rank your blog");

        // Hiển thị toast loading
        const loadingToast = toast.loading("Publishing...");
        e.target.classList.add("disable"); // disable nút bấm

        // Tạo object gửi lên backend
        const blogOjt = { title, banner, des, content, tags, draft: false };

        // Gọi API publish blog bằng cấu trúc post(url,data,config)
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogOjt, {
                headers: { Authorization: `Bearer ${access_token}` }, // gửi token xác thực
            })
            .then(() => {
                // Sau khi publish thành công
                e.target.classList.remove("disable"); // mở lại nút bấm
                toast.dismiss(loadingToast); // tắt toast loading
                toast.success("Published successfully");

                // Redirect về trang chủ sau 0.5s
                setTimeout(() => navigate("/"), 500);
            })
            .catch(({ response }) => {
                // Nếu lỗi xảy ra
                e.target.classList.remove("disable");
                toast.dismiss(loadingToast);
                toast.error(response.data.error);
            });
    };

    /* ------------------------------- JSX RENDER ------------------------------- */

    return (
        <AnimationWrapper>
            {/* Toast notification */}
            <Toaster />

            {/* ------------------------------ NAVBAR ------------------------------ */}
            <nav className="navbar fixed top-0 left-0 right-0 z-20 flex items-center p-4 bg-white shadow-lg">
                <Link to="/" className="flex-none w-10 md:w-12 hover:opacity-80 transition">
                    <img src={logo} alt="Logo" />
                </Link>

                <p className="ml-4 text-xl font-bold text-gray-800 line-clamp-1 max-w-[calc(100%-120px)] md:max-w-md">
                    Review & Publish
                </p>

                <div className="ml-auto flex items-center gap-4">
                    <button
                        className="btn-dark px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-md"
                        onClick={publishBlog} // Click publish
                    >
                        Publish Blog
                    </button>

                    <button
                        className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-100 transition text-gray-700 max-md:hidden"
                        onClick={handleCloseEvent} // Back về editor
                    >
                        Back
                    </button>
                </div>
            </nav>

            {/* ------------------------------ MAIN LAYOUT ------------------------------ */}
            <section className="pt-20 grid grid-cols-1 lg:grid-cols-3 bg-gray-50 min-h-screen">

                {/* --------------------------- LEFT: PREVIEW --------------------------- */}
                <div className="lg:col-span-2 px-4 md:px-8 lg:px-16 py-8 bg-white border-r border-gray-200">
                    <div className="max-w-[700px] mx-auto space-y-10 pt-8">

                        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Final Review</h1>

                        <div className="space-y-4">
                            <p className="mb-2 text-gray-700 font-semibold">Banner Preview</p>

                            <img
                                src={banner || defaultBanner} // Banner hoặc mặc định
                                alt="Banner"
                                onError={handleBannerError} // nếu lỗi load banner
                                className="w-full aspect-video object-cover rounded-lg shadow-lg border"
                            />

                            <h2 className="text-4xl font-extrabold mt-4 text-gray-900">
                                {title || "Untitled Blog"} {/* Nếu chưa nhập title */}
                            </h2>

                            <p className="text-2xl font-medium mt-4 text-dark-grey">
                                {des} {/* Description */}
                            </p>
                        </div>

                    </div>
                </div>

                {/* --------------------- RIGHT: ADDITIONAL DETAILS --------------------- */}
                <div className="px-4 md:px-8 lg:px-8 py-8 bg-gray-50/70">
                    <div className="max-w-[400px] mx-auto space-y-6">

                        <h2 className="text-2xl font-bold text-gray-800">Additional Details</h2>

                        {/* TITLE */}
                        <div>
                            <p className="mb-2 text-gray-700 font-semibold">Blog Title</p>
                            <input
                                type="text"
                                defaultValue={title}
                                onChange={handleBlogTitleChange}
                                maxLength={100}
                                className="w-full border rounded-lg p-3"
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="text-gray-700 font-semibold">Short Description</label>
                            <textarea
                                defaultValue={des}
                                onChange={handleBlogDesChange}
                                onKeyDown={handleTitleKeyDown}
                                maxLength={characterLimit}
                                className="w-full border rounded-lg p-3 resize-none"
                            />
                            <p className="text-sm text-gray-500 text-right">
                                {des.length} / {characterLimit} characters
                            </p>
                        </div>

                        {/* TAGS */}
                        <div>
                            <label className="text-gray-700 font-semibold">Topics (up to 5 tags)</label>
                            <input
                                type="text"
                                placeholder="Topic"
                                className="w-full border rounded-lg p-3"
                                onKeyDown={handleKeyDown}
                            />

                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag, i) => (
                                    <Tag key={i} tag={tag} tagIndex={i} /> // Hiển thị từng tag
                                ))}
                            </div>

                            <p className="text-sm text-gray-500 text-right">
                                {tags.length} / 5 tags
                            </p>
                        </div>

                    </div>
                </div>
            </section>
        </AnimationWrapper>
    );
};

export default PublishForm;
