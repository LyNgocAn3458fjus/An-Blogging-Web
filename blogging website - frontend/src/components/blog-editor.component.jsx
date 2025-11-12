import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import work from "../imgs/work.jpg";

// Component BlogEditor: viết/soạn thảo bài blog
const BlogEditor = () => {
  // Xử lý khi người dùng chọn ảnh banner
  const handleBannerUpload = (e) => {
    const img = e.target.files[0];
    console.log(img); // log file để kiểm tra
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar flex items-center p-2">
        {/* Logo */}
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="Logo" />
        </Link>

        {/* Tiêu đề */}
        <p className="max-md:hidden text-black ml-4">New blog</p>

        {/* Các nút chức năng */}
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2">Publish</button>
          <button className="btn-light py-2">Save Draft</button>
        </div>
      </nav>

      {/* Nội dung chính */}
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            {/* Banner upload */}
            <div className="relative aspect-video hover:opacity-80 bg-white border-gray-300 border-4 cursor-pointer">
              {/* Label dùng để click vào ảnh và trigger input file */}
              <label htmlFor="uploadBanner" className="w-full h-full block">
                <img
                  src={work}
                  className="z-20 w-full h-full object-cover"
                  alt="Banner preview"
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  hidden
                  onChange={handleBannerUpload} // xử lý file khi chọn
                />
              </label>
            </div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
