// BlogPage.jsx – trang hiển thị chi tiết bài blog

import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
// Animation & hover dùng chung với HomePage
import { cardHover, bannerHover, titleHover, authorImageHover, } from "../common/motion"
import { fadeInUp, bannerMotion, titleMotion } from "../common/motion";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer from "../components/comments.component";
import { fetchComments } from "../components/comments.component";

// Cấu trúc blog mặc định để tránh lỗi undefined
export const blogStructure = {
  title: '',
  des: '',
  content: [],
  tags: [],
  author: { personal_info: {} },
  banner: '',
  publishedAt: '',
};
// tạo context
export const BlogContext = createContext({});

const BlogPage = () => {
  // Lấy blog_id từ URL
  const { blog_id } = useParams();

  // State lưu blog & loading
  const [blog, setBlog] = useState(blogStructure);
  const [loading, setLoading] = useState(true);
  //State lưu trữ trạng thái comment 
  const [commentsWrapper, setCommentsWrapper] = useState(false);

  //State lưu trữ trạng thái comment gốc khi chưa có xự phản hồi của comment con  
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0)// chưa load comment nào
  // Tách dữ liệu blog (an toàn)
  const { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } = {} },
    publishedAt,
    tags
  } = blog;
  const [similarBlogs, setSimilarBlogs] = useState(null)
  //quản lí trạng tháy like blog dùng false cho state bật tắt
  const [isLikeByUser, setLikeByUser] = useState(false)

  // Gọi API lấy blog hiện tại và các blog có liên quan
  const fetchBlog = () => {
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, { blog_id })
      .then(async ({ data: { blog } }) => {
        blog.comments = await fetchComments({ blog_id: blog._id, setParentCommentCountFun: setTotalParentCommentsLoaded })
        setBlog(blog)
        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, { tag: tags[0], limit: 6, eliminate_blog: blog_id })
          .then(({ data }) => {
            setSimilarBlogs(data.blogs);
          })
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  // Fetch lại khi blog_id đổi
  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blog_id]);
  // thiết lại lại blog, blog tương tự reset hoàn toàn trang để tránh bị ghi đè, lẫn lộn dữ liệu 
  const resetState = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setLikeByUser(false);
    // setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  }

  return (

    <AnimationWrapper>
      {
        loading ? <Loader />
          :
          // provider nơi phát dữ liệu
          <BlogContext.Provider value={{ blog, setBlog, isLikeByUser, setLikeByUser, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>
            {/* khung chat comment */}
            <CommentsContainer />
            <div className="max-w-3xl mx-auto px-4 py-12">
              <motion.article
                {...fadeInUp}
                className={`
          group
          bg-white rounded-2xl overflow-hidden
          shadow-sm border border-gray-100
          ${cardHover}
        `}
              >
                {/* Banner */}
                {banner && (
                  <motion.div
                    {...bannerMotion}
                    className="relative overflow-hidden"
                  >
                    <img
                      src={banner}
                      alt={title}
                      className={`w-full h-64 object-cover aspect-video ${bannerHover}`}
                    />
                  </motion.div>
                )}

                <div className="p-8">
                  {/* Tiêu đề */}
                  <motion.h1
                    {...titleMotion}
                    className={`
              text-3xl font-semibold mb-4
              text-gray-900
              ${titleHover}
            `}
                  >
                    {title}
                  </motion.h1>

                  {/* Tác giả + ngày đăng */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                    {profile_img && (
                      <img
                        src={profile_img}
                        alt={fullname}
                        className={`w-8 h-8 object-cover ${authorImageHover}`}
                      />
                    )}

                    <span className="font-medium text-gray-700">
                      {fullname}
                      <br />
                      <Link to={`/user/${author_username}`} className="underline">{author_username}</Link>
                    </span>

                    <p className="ml-auto text-dark-grey opacity-75 max-sm:ml-12 max-sm:pl-5">Published on {getDay(publishedAt)}</p>
                  </div>

                  {/* Nội dung – chỉ render string để tránh lỗi React */}
                  <div
                    className="
              prose prose-slate max-w-none
              prose-a:text-purple
              prose-a:font-medium
            "
                  >
                    {typeof content === "string"
                      ? content
                      : ""}
                    <BlogInteraction />
                    {/* nội dung của mỗi blog sẽ hiển thị ở đây  */}
                    <div className="my-12  font-gelasio blog-page-content">
                      {
                        // có thể crash khúc này
                        content[0].blocks.map((block, i) => {
                          return <div key={i} className="my-4 md:my-8">
                            <BlogContent block={block} />
                          </div>
                        })
                      }
                    </div>
                    <BlogInteraction />
                    {/* Hiển thị list blog tương tự của 1 tác giả */}
                    {
                      similarBlogs !== null && similarBlogs.length ? <>
                        <h1 className="text-2xl mt-14 font-medium">Similar Blogs</h1>
                        {
                          similarBlogs.map((blog, i) => {
                            let { author: { personal_info } } = blog;//lấy thông tin tác giả từ bài blog tương tự
                            return (
                              <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                                <BlogPostCard content={blog} author={personal_info} />
                              </AnimationWrapper>
                            )
                          })
                        }

                      </> : " "
                    }
                  </div>
                </div>
              </motion.article>
            </div>
          </BlogContext.Provider>



      }

    </AnimationWrapper>
  );
};

export default BlogPage;
