import { Link, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { useContext, useEffect } from "react";
import { uploadImage } from "../common/aws";
import { Toaster, toast } from "react-hot-toast";
import Editor, { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";

const BlogEditor = () => {
  let { userAuth: { access_token } } = useContext(UserContext)
  let navigate = useNavigate();
  // Lấy blog và state từ EditorContext
  // Destructuring giúp lấy cả object blog lẫn từng trường của blog
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState
  } = useContext(EditorContext)

  // ---------------------------
  // 1. KHỞI TẠO EDITOR.JS
  // ---------------------------
  useEffect(() => {
    if (!textEditor.isReady)
    // Khởi tạo EditorJS và lưu vào state textEditor
    {
      setTextEditor(new EditorJS({
        holderId: "textEditor",       // ID div để render editor
        data: content,                     // dữ liệu ban đầu (chưa load blog)
        tools: tools,                 // custom tools
        placeholder: "Let's write an awesome story"
      }))
    }

  }, [])


  // ---------------------------
  // 2. HANDLE UPLOAD ẢNH BANNER
  // ---------------------------
  const handleBannerUpload = (e) => {
    const img = e.target.files[0];
    if (!img) return;

    let loadingToast = toast.loading("Uploading...");

    uploadImage(img)
      .then((url) => {
        if (url) {
          toast.dismiss(loadingToast);
          toast.success("Uploaded 👍");

          // Cập nhật link banner trong blog
          setBlog({ ...blog, banner: url })
        }
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error("Upload failed: " + err.message);
      });
  };


  // ---------------------------
  // 3. NGĂN ENTER XUỐNG DÒNG Ở TITLE
  // ---------------------------
  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) e.preventDefault();
  };


  // ---------------------------
  // 4. AUTO-RESIZE TITLE + UPDATE STATE
  // ---------------------------
  const handleTitleChange = (e) => {
    let input = e.target;

    // Auto resize chiều cao textarea theo nội dung
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    // Update blog.title
    setBlog({ ...blog, title: input.value })
  };


  // ---------------------------
  // 5. FALLBACK KHI ẢNH BANNER LỖI
  // ---------------------------
  const handleError = (e) => {
    e.target.src = defaultBanner;
  }

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Hãy tải banner để xuất bản nó")
    }
    if (!title.length) {
      return toast.error("Hãy nhập title để xuất bản nó")
    }
    if (textEditor.isReady) {
      textEditor.save().then(data => {
        if (data.blocks.length) {
          setBlog({ ...blog, content: data });
          setEditorState("publish")
        } else {
          return toast.error("Hãy viết gì đó cho blog của bạn")
        }
      }).catch(
        (err) => {
          console.log(err)
        }
      )
    }
  }
  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write blog title before saving as a draft")
    }

    let loadingToast = toast.loading("Saving draft...");
    e.target.classList.add('disable');
    if (textEditor.isReady) {
      textEditor.save().then(content => {
        let blogOjt = {
          title, banner, des, content, tags, draft: true
        }
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogOjt, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
          .then(() => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
            toast.success("Saving successful");

            setTimeout(() => {
              navigate("/")
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);

            return toast.error(response.data.error)
          })
      })
    }


  }
  // ---------------------------
  // 6. UI RENDER
  // ---------------------------
  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar flex items-center p-3 bg-white/80 backdrop-blur-md shadow-sm">

        {/* Logo */}
        <Link to="/" className="flex-none w-10 hover:opacity-80 transition">
          <img src={logo} alt="Logo" />
        </Link>

        {/* Show title nếu có, còn không thì New Blog */}
        <p className="max-md:hidden text-black ml-4 text-lg tracking-wide font-medium">
          {title.length ? title : "New blog"}
        </p>

        {/* Nút Publish + Save draft */}
        <div className="flex gap-3 ml-auto">
          <button className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition shadow-sm" onClick={handlePublishEvent}>
            Publish
          </button>
          <button onClick={handleSaveDraft} className="px-5 py-2 border border-gray-400 rounded-lg hover:bg-gray-100 transition">
            Save Draft
          </button>
        </div>
      </nav>

      {/* Toast hiển thị message */}
      <Toaster />

      {/* Hiệu ứng tạo trang */}
      <AnimationWrapper>
        <section className="fade-in">

          {/* Container chính */}
          <div className="mx-auto max-w-[900px] w-full mt-6 p-2">

            {/* Upload banner */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-200 border-gray-300 border-4 cursor-pointer overflow-hidden rounded-xl transition duration-300 hover:shadow-xl hover:-translate-y-1">

              <label htmlFor="uploadBanner" className="w-full h-full block group relative">

                {/* Banner hiển thị */}
                <img
                  src={banner}
                  className="z-10 w-full h-full object-cover transition duration-300 group-hover:opacity-75"
                  onError={handleError}
                />

                {/* Overlay khi hover */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                  <p className="text-white text-lg tracking-wide">Upload Image</p>
                </div>

                {/* Input file ẩn */}
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            {/* Title */}
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-semibold w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:text-gray-400 bg-transparent border-b border-gray-300 focus:border-black transition-all duration-300"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            {/* EditorJS sẽ gắn vào div này */}
            <div id="textEditor" className="font-gelasio"></div>

          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
