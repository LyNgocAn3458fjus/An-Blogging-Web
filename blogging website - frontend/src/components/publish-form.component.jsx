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
        if (e.keyCode === 13 || e.keyCode === 188) {
            e.preventDefault();

            const tag = e.target.value.trim();
            if (!tag) return;

            if (tags.length >= 5) {
                toast.error("You can only add up to 5 tags");
                return;
            }

            if (!tags.includes(tag)) {
                setBlog({ ...blog, tags: [...tags, tag] });
            }

            e.target.value = "";
        }
    };

    // Quay về trang editor (chưa publish)
    const handleCloseEvent = () => setEditorState("editor");

    // Nếu banner load lỗi, hiển thị banner mặc định
    const handleBannerError = (e) => (e.target.src = defaultBanner);

    /* ---------------------------- PUBLISH HANDLER --------------------------- */

    const publishBlog = (e) => {
        if (e.target.className.includes("disable")) return;

        if (!title.length) return toast.error("Write blog title before publishing");
        if (!des.length || des.length > 200)
            return toast.error("You must provide blog description under 200 characters");
        if (!tags.length) return toast.error("Enter at least 1 tag to help us rank your blog");

        const loadingToast = toast.loading("Publishing...");
        e.target.classList.add("disable");

        const blogOjt = { title, banner, des, content, tags, draft: false };

        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogOjt, {
                headers: { Authorization: `Bearer ${access_token}` },
            })
            .then(() => {
                e.target.classList.remove("disable");
                toast.dismiss(loadingToast);
                toast.success("Published successfully");

                setTimeout(() => navigate("/"), 500);
            })
            .catch(({ response }) => {
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
            <nav className="navbar fixed top-0 left-0 right-0 z-20 flex items-center p-4 bg-gradient-blue-dark backdrop-blur-md shadow-sm">
                <Link to="/" className="flex-none w-10 md:w-12 hover:opacity-80 transition">
                    <img src={logo} alt="Logo" />
                </Link>

                <p className="ml-4 text-xl font-medium text-black line-clamp-1">
                    Review & Publish
                </p>

                <div className="ml-auto flex items-center gap-3">
                    <button
                        className="btn-grad-blue-deep px-6 py-2 rounded-lg"
                        onClick={publishBlog}
                    >
                        Publish
                    </button>

                    <button
                        className="btn-grad-grey px-5 py-2 rounded-lg max-md:hidden"
                        onClick={handleCloseEvent}
                    >
                        Back
                    </button>
                </div>
            </nav>

            {/* ------------------------------ MAIN LAYOUT ------------------------------ */}
            <section className="pt-20 min-h-screen bg-soft-lavender grid grid-cols-1 lg:grid-cols-3">

                {/* --------------------------- LEFT: PREVIEW --------------------------- */}
                <div className="lg:col-span-2 px-4 md:px-8 lg:px-16 py-10 bg-soft-white border-r border-grey">
                    <div className="max-w-[720px] mx-auto space-y-10">

                        <h1 className="text-3xl font-bold text-gray-800">
                            Final Review
                        </h1>

                        <div className="space-y-5">
                            <p className="text-gray-600 font-medium">
                                Banner Preview
                            </p>

                            <img
                                src={banner || defaultBanner}
                                alt="Banner"
                                onError={handleBannerError}
                                className="w-full aspect-video object-cover rounded-xl shadow-lg border border-grey"
                            />

                            <h2 className="text-4xl font-extrabold text-gray-900">
                                {title || "Untitled Blog"}
                            </h2>

                            <p className="text-xl text-dark-grey">
                                {des}
                            </p>
                        </div>

                    </div>
                </div>

                {/* --------------------- RIGHT: ADDITIONAL DETAILS --------------------- */}
                <div className="px-4 md:px-8 py-10 bg-soft-lavender/70">
                    <div className="max-w-[420px] mx-auto space-y-6">

                        <h2 className="text-2xl font-bold text-gray-800">
                            Additional Details
                        </h2>

                        {/* TITLE */}
                        <div>
                            <p className="mb-2 text-gray-700 font-medium">Blog Title</p>
                            <input
                                type="text"
                                defaultValue={title}
                                onChange={handleBlogTitleChange}
                                maxLength={100}
                                className="w-full bg-soft-white border border-grey rounded-lg p-3 outline-none focus:border-black transition"
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="text-gray-700 font-medium">
                                Short Description
                            </label>
                            <textarea
                                defaultValue={des}
                                onChange={handleBlogDesChange}
                                onKeyDown={handleTitleKeyDown}
                                maxLength={characterLimit}
                                className="w-full bg-soft-white border border-grey rounded-lg p-3 resize-none outline-none focus:border-black transition"
                            />
                            <p className="text-sm text-dark-grey text-right">
                                {des.length} / {characterLimit}
                            </p>
                        </div>

                        {/* TAGS */}
                        <div>
                            <label className="text-gray-700 font-medium">
                                Topics (up to 5 tags)
                            </label>
                            <input
                                type="text"
                                placeholder="Topic"
                                className="w-full bg-soft-white border border-grey rounded-lg p-3 outline-none focus:border-black transition"
                                onKeyDown={handleKeyDown}
                            />

                            <div className="flex flex-wrap gap-2 mt-3">
                                {tags.map((tag, i) => (
                                    <Tag key={i} tag={tag} tagIndex={i} />
                                ))}
                            </div>

                            <p className="text-sm text-dark-grey text-right">
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
