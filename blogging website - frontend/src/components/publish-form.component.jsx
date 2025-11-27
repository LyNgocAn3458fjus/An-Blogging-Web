import { useContext } from "react";
import { Link } from "react-router-dom";
import { EditorContext } from "../pages/editor.pages";
import { Toaster, toast } from "react-hot-toast";
import defaultBanner from "../imgs/blog banner.png";
import AnimationWrapper from "../common/page-animation";
import logo from "../imgs/logo.png";
import Tag from "./tags.component";

const PublishForm = () => {
    // --- Lấy state và hàm cập nhật từ context ---
    const {
        blog,
        blog: { banner, title, tags, des },
        setBlog,
        setEditorState
    } = useContext(EditorContext);

    // --- Xử lý input tiêu đề ---
    const handleBlogTitleChange = (e) => {
        setBlog({ ...blog, title: e.target.value });
    };

    // --- Quay về editor ---
    const handleCloseEvent = () => setEditorState("editor");

    // --- Xử lý input mô tả ---
    const handleBlogDesChange = (e) => {
        setBlog({ ...blog, des: e.target.value });
    };

    // --- Ngăn enter xuống dòng trong textarea ---
    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) e.preventDefault();
    };

    // --- Xử lý thêm tag khi nhấn Enter hoặc dấu phẩy ---
    const handleKeyDown = (e) => {
        if (e.keyCode === 13 || e.keyCode === 188) {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (tags.length < 5) {
                if (tag && !tags.includes(tag)) {
                    setBlog({ ...blog, tags: [...tags, tag] });
                }
            } else {
                toast.error("You can only add up to 5 tags");
            }
            e.target.value = "";
        }
    };

    // --- Giới hạn ký tự mô tả ---
    const characterLimit = 200;

    // --- Xử lý publish cuối cùng ---
    const handleFinalPublish = () => {
        if (!title.trim()) return toast.error("Hãy nhập tiêu đề blog của bạn");
        if (!des.trim() || des.length > 200) return toast.error("Mô tả phải từ 1-200 ký tự.");
        if (!tags.length) return toast.error("Hãy thêm ít nhất 1 tag");

        toast.success("Blog đã được xuất bản!");
        console.log("Final Publish Data:", blog);
    };

    // --- Xử lý lỗi load banner ---
    const handleBannerError = (e) => e.target.src = defaultBanner;

    return (
        <AnimationWrapper>
            {/* Toast thông báo */}
            <Toaster />

            {/* --- NAVBAR --- */}
            <nav className="navbar fixed top-0 left-0 right-0 z-20 flex items-center p-4 bg-white shadow-lg">
                <Link to="/" className="flex-none w-10 md:w-12 hover:opacity-80 transition">
                    <img src={logo} alt="Logo" />
                </Link>
                <p className="ml-4 text-xl font-bold text-gray-800 line-clamp-1 max-w-[calc(100%-120px)] md:max-w-md">
                    Review & Publish
                </p>
                <div className="ml-auto flex items-center gap-4">
                    <button
                        className="btn-dark px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-md font-medium text-sm md:text-base"
                        onClick={handleFinalPublish}
                    >
                        Publish Blog
                    </button>
                    <button
                        className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-100 transition text-gray-700 text-sm md:text-base max-md:hidden"
                        onClick={handleCloseEvent}
                    >
                        Back
                    </button>
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <section className="pt-20 grid grid-cols-1 lg:grid-cols-3 bg-gray-50 min-h-screen">

                {/* --- CỘT 1: Preview --- */}
                <div className="lg:col-span-2 px-4 md:px-8 lg:px-16 py-8 bg-white border-r border-gray-200">
                    <div className="max-w-[700px] mx-auto space-y-10 pt-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Final Review</h1>

                        {/* Banner + Title + Description */}
                        <div className="space-y-4">
                            <p className="mb-2 text-gray-700 font-semibold">Banner Preview</p>
                            <img
                                src={banner || defaultBanner}
                                alt="Banner"
                                className="w-full aspect-video object-cover rounded-lg shadow-lg border border-gray-200"
                                onError={handleBannerError}
                            />

                            <h2 className="text-4xl font-extrabold line-clamp-2 mt-4 text-gray-900">
                                {title || "Untitled Blog"}
                            </h2>
                            <p className="text-2xl font-medium line-clamp-2 mt-4 text-dark-grey">
                                {des}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- CỘT 2: Additional Details --- */}
                <div className="px-4 md:px-8 lg:px-8 py-8 bg-gray-50/70">
                    <div className="max-w-[400px] mx-auto space-y-4">

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Details</h2>

                        {/* Title input */}
                        <div>
                            <p className="mb-2 text-gray-700 font-semibold">Blog Title</p>
                            <input
                                type="text"
                                defaultValue={title}
                                onChange={handleBlogTitleChange}
                                maxLength={100}
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />
                        </div>

                        {/* Short description */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-gray-700 font-semibold">Short description about your blog</label>
                            <textarea
                                defaultValue={des}
                                onChange={handleBlogDesChange}
                                onKeyDown={handleTitleKeyDown}
                                maxLength={characterLimit}
                                className="w-full border border-gray-300 rounded-lg p-3 resize-none"
                            />
                            <p className="text-sm text-gray-500 text-right">
                                {des.length} / 200 character
                            </p>
                        </div>

                        {/* Tags input */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-gray-700 font-semibold">
                                Topics – (Helps improve your blog post’s search ranking)
                            </label>
                            <input
                                type="text"
                                placeholder="Topic"
                                className="w-full border border-gray-300 rounded-lg p-3 resize-none"
                                onKeyDown={handleKeyDown}
                            />
                            {/* Hiển thị tags */}
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <Tag tag={tag} key={i} />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </AnimationWrapper>
    );
};

export default PublishForm;
