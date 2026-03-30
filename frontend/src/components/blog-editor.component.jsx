import { Link, useNavigate, useParams } from "react-router-dom";
import darklogo from "../imgs/darklogo.png";
import lightlogo from "../imgs/lightlogo.png";
import { Toaster, toast } from "react-hot-toast";
import Editor, { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import { UserContext } from "../App";
import { useContext, useEffect } from "react";
import { uploadImage } from "../common/cloudinary";
import defaultBanner from "../imgs/blog banner.png";
import axios from "axios";
import { ThemeContext } from "../App";

const BlogEditor = () => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let navigate = useNavigate();
  let { blog, setBlog, textEditor, setTextEditor, setEditorState } =
    useContext(EditorContext);

  const { title, banner, content, tags, des } = blog || {};
  const { theme, setTheme } = useContext(ThemeContext);
  let { blog_id } = useParams();
  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holderId: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Let's write an awesome story",
        }),
      );
    }
  }, []);

  const handleBannerUpload = (e) => {
    const img = e.target.files[0];
    if (!img) return;

    let loadingToast = toast.loading("Uploading...");

    uploadImage(img)
      .then((url) => {
        if (url) {
          toast.dismiss(loadingToast);
          toast.success("Uploaded 👍");
          setBlog({ ...blog, banner: url });
        }
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error("Upload failed: " + err.message);
      });
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) e.preventDefault();
  };

  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handleError = (e) => {
    e.target.src = defaultBanner;
  };

  const handlePublishEvent = () => {
    if (!banner.length)
      return toast.error("Please download the banner to publish it.");
    if (!title.length) return toast.error("Enter a title to publish it.");

    if (textEditor.isReady) {
      textEditor.save().then((data) => {
        if (data.blocks.length) {
          setBlog({ ...blog, content: data });
          setEditorState("publish");
        } else return toast.error("Write something for your blog.");
      });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) return;
    if (!title.length)
      return toast.error("Write blog title before saving as a draft");

    let loadingToast = toast.loading("Saving draft...");
    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogOjt = { title, banner, des, content, tags, draft: true };

        axios
          .post(
            import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
            { ...blogOjt, id: blog_id },
            {
              headers: { Authorization: `Bearer ${access_token}` },
            },
          )
          .then(() => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Saving successful");
            setTimeout(() => navigate("/dashboard/blogs?tab=draft"), 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            return toast.error(response.data.error);
          });
      });
    }
  };

  return (
    <div className="bg-bg-soft">
      <nav className="navbar flex items-center p-3 bg-bg-nav backdrop-blur-md shadow-sm">
        <Link to="/" className="flex-none w-10 hover:opacity-80 transition">
          <img src={theme == "light" ? darklogo : lightlogo} alt="Logo" className="rounded-md" />
        </Link>

        <p className="max-md:hidden text-black ml-4 text-xl font-medium">
          {title.length ? title : "New blog"}
        </p>

        <div className="flex gap-3 ml-auto">
          <button
            className="btn-grad-blue-deep px-7 py-2 rounded-lg"
            onClick={handlePublishEvent}
          >
            Publish
          </button>

          <button
            onClick={handleSaveDraft}
            className="btn-grad-grey px-5 py-2 rounded-lg border border-grey hover:bg-grey transition"
          >
            Save Draft
          </button>
        </div>
      </nav>

      <Toaster />

      <div className="mx-auto max-w-[900px] w-full mt-6 p-2">
        <div className="relative aspect-video bg-bg-list border border-grey cursor-pointer overflow-hidden rounded-xl">
          <label
            htmlFor="uploadBanner"
            className="w-full h-full block relative"
          >
            <img
              src={banner}
              className="z-10 w-full h-full object-cover"
              onError={handleError}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 flex items-center justify-center transition-all duration-300 hover:opacity-100">
              <p className="text-white text-lg">Upload Image</p>
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
          defaultValue={title}
          placeholder="Blog Title"
          className="text-4xl font-semibold w-full h-20 resize-none outline-none bg-transparent mt-10 leading-tight border-b border-grey placeholder:text-dark-grey focus:border-black transition-all duration-300"
          onKeyDown={handleTitleKeyDown}
          onChange={handleTitleChange}
        ></textarea>

        <hr className="w-full opacity-10 my-5" />

        <div id="textEditor" className="font-gelasio"></div>
      </div>
    </div>
  );
};

export default BlogEditor;
