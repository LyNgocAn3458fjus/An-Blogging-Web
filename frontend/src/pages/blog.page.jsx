import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer from "../components/comments.component";
import { fetchComments } from "../components/comments.component";

export const blogStructure = {
  title: '',
  des: '',
  content: [],
  tags: [],
  author: { personal_info: {} },
  banner: '',
  publishedAt: '',
};

export const BlogContext = createContext({});

const BlogPage = () => {

  const { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [loading, setLoading] = useState(true);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  const [similarBlogs, setSimilarBlogs] = useState(null);
  const [isLikeByUser, setLikeByUser] = useState(false);

  const {
    title,
    content,
    banner,
    author: {
      personal_info: {
        fullname,
        username: author_username,
        profile_img
      } = {}
    },
    publishedAt,
    tags
  } = blog;

  const fetchBlog = () => {
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, { blog_id })
      .then(async ({ data: { blog } }) => {

        blog.comments = await fetchComments({
          blog_id: blog._id,
          setParentCommentCountFun: setTotalParentCommentsLoaded
        });

        setBlog(blog);

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
          tag: tags[0],
          limit: 6,
          eliminate_blog: blog_id
        })
          .then(({ data }) => {
            setSimilarBlogs(data.blogs);
          });

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blog_id]);

  const resetState = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setLikeByUser(false);
    setTotalParentCommentsLoaded(0);
  };

  return (
    <AnimationWrapper>
      {
        loading ? <Loader /> :
          <BlogContext.Provider value={{
            blog,
            setBlog,
            isLikeByUser,
            setLikeByUser,
            commentsWrapper,
            setCommentsWrapper,
            totalParentCommentsLoaded,
            setTotalParentCommentsLoaded
          }}>

            <CommentsContainer />
            <div className="bg-bg-main">
              <div className="max-w-3xl mx-auto px-4 py-12">
                <article
                  className="
                  bg-white rounded-2xl overflow-hidden
                  shadow-sm border border-gray-100
                "
                >
                  {/* Banner */}
                  {banner && (
                    <div className="relative overflow-hidden">
                      <img
                        src={banner}
                        alt={title}
                        className="w-full h-64 object-cover aspect-video"
                      />
                    </div>
                  )}

                  <div className="p-8">

                    {/* Title */}
                    <h1 className="text-3xl font-semibold mb-4 text-gray-900">
                      {title}
                    </h1>

                    {/* Author + Date */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                      {profile_img && (
                        <img
                          src={profile_img}
                          alt={fullname}
                          className="w-8 h-8 object-cover rounded-full"
                        />
                      )}

                      <span className="font-medium text-gray-700">
                        {fullname}
                        <br />
                        <Link to={`/user/${author_username}`} className="underline">
                          {author_username}
                        </Link>
                      </span>

                      <p className="ml-auto text-dark opacity-75 max-sm:ml-12 max-sm:pl-5">
                        Published on {getDay(publishedAt)}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-slate max-w-none prose-a:text-purple prose-a:font-medium">

                      {typeof content === "string" ? content : ""}

                      <BlogInteraction />

                      <div className="text-dark first-letter:my-12 font-gelasio blog-page-content">
                        {
                          content[0]?.blocks?.map((block, i) => (
                            <div key={i} className="my-4 md:my-8">
                              <BlogContent block={block} />
                            </div>
                          ))
                        }
                      </div>

                      <BlogInteraction />

                      {/* Similar Blogs */}
                      {
                        similarBlogs !== null && similarBlogs.length ? (
                          <>
                            <h1 className="text-2xl mt-14 font-medium">
                              Similar Blogs
                            </h1>

                            {
                              similarBlogs.map((blog, i) => {
                                let { author: { personal_info } } = blog;

                                return (
                                  <AnimationWrapper key={i}>
                                    <BlogPostCard
                                      content={blog}
                                      author={personal_info}
                                    />
                                  </AnimationWrapper>
                                );
                              })
                            }
                          </>
                        ) : ""
                      }

                    </div>
                  </div>
                </article>
              </div>
            </div>


          </BlogContext.Provider>
      }
    </AnimationWrapper>
  );
};

export default BlogPage;
