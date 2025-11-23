import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { useContext, useEffect} from "react";
import { uploadImage } from "../common/aws";
import { Toaster, toast } from "react-hot-toast";
import Editor, { EditorContext } from "../pages/editor.pages";
import EditorJS  from "@editorjs/editorjs";
import {tools} from "./tools.component";

const BlogEditor = () => {
  let { blog, blog: { title, banner, content, tags, des }, setBlog } = useContext(EditorContext)
  useEffect(()=>{
    let editor = new EditorJS({
      holderId:"textEditor",
      data:'',
      tools:tools,
      placeholder:"Let's write an awesome story"
    })
  },[])
  const handleBannerUpload = (e) => { 
    const img = e.target.files[0];
    if (!img) return;
    let loadingToast = toast.loading("Uploading...");

    uploadImage(img)
      .then((url) => {
        if (url) {
          toast.dismiss(loadingToast);
          toast.success("Uploaded 👍");
          setBlog({ ...blog, banner: url })
        }
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        return toast.error("Upload failed: " + err.message);
      });
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) e.preventDefault();
  };

  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value })
  };
  const handleError = (e) => {
    let img = e.target;
    img.src = defaultBanner; 
  }
  return (
    <>
      <nav className="navbar flex items-center p-3 bg-white/80 backdrop-blur-md shadow-sm">
        <Link to="/" className="flex-none w-10 hover:opacity-80 transition">
          <img src={logo} alt="Logo" />
        </Link>

        <p className="max-md:hidden text-black ml-4 text-lg tracking-wide font-medium">
          {title.length ? title : "New blog"}
        </p>

        <div className="flex gap-3 ml-auto">
          <button className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition shadow-sm">
            Publish
          </button>
          <button className="px-5 py-2 border border-gray-400 rounded-lg hover:bg-gray-100 transition">
            Save Draft
          </button>
        </div>
      </nav>
      <Toaster />
      <AnimationWrapper>
        <section className="fade-in">
          <div className="mx-auto max-w-[900px] w-full mt-6 p-2">

            <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-200 border-gray-300 border-4 cursor-pointer overflow-hidden rounded-xl transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <label htmlFor="uploadBanner" className="w-full h-full block group relative">
                <img
                  src={banner}
                  className="z-10 w-full h-full object-cover transition duration-300 group-hover:opacity-75"
                  onError={handleError}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                  <p className="text-white text-lg tracking-wide">Upload Image</p>
                </div>
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea
              placeholder="Blog Title"
              className="text-4xl font-semibold w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:text-gray-400 bg-transparent border-b border-gray-300 focus:border-black transition-all duration-300"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
            <hr className="w-ful opacity-10 my-5"/>
            <div id="textEditor" className="font-gelasio">
              
            </div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
