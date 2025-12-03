import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import logo from "../imgs/logo.png";
import defaultBanner from "../imgs/blog banner.png";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";

const HomePage = () => {
    let [blogs, setBlogs] = useState(null)
    // lấy blog mới nhất
    const fetchLatestBlog = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
            .then(({ data }) => setBlogs(data.blogs))
            .catch(err => console.log(err));
    };

    // dùng useEffect xử lí các logic nhỏ nhỏ mà không cần re render
    useEffect(() => {
        fetchLatestBlog();
    }, [])// [] có nghia chỉ cho phép fetchLatestBlog chạy một lần khi vừa tạo
    return (
        // <AnimationWrapper>
        //     <div className="min-h-screen bg-gray-50">
        //         {/* HERO SECTION */}
        //         <section className="px-6 py-16 text-center max-w-3xl mx-auto">
        //             <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
        //                 Welcome to Your Modern Blog
        //             </h1>
        //             <p className="mt-4 text-lg text-gray-600">
        //                 A clean, elegant and modern space to read and share ideas.
        //             </p>

        //             <Link
        //                 to="/editor"
        //                 className="inline-block mt-8 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition shadow-md"
        //             >
        //                 Start Writing
        //             </Link>
        //         </section>

        //         {/* BLOG LIST SECTION */}
        //         <section className="max-w-5xl mx-auto px-6 pb-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        //             {blogs.length === 0 && (
        //                 <p className="text-gray-500 text-center col-span-full">
        //                     No blogs yet. Create your first post!
        //                 </p>
        //             )}

        //             {blogs.map((blog, index) => (
        //                 <Link
        //                     key={index}
        //                     to={`/blog/${blog._id}`}
        //                     className="group block bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-300 border"
        //                 >
        //                     <div className="aspect-video overflow-hidden">
        //                         <img
        //                             src={blog.banner || defaultBanner}
        //                             alt={blog.title}
        //                             className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        //                         />
        //                     </div>
        //                     <div className="p-4">
        //                         <h2 className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-black">
        //                             {blog.title}
        //                         </h2>
        //                         <p className="mt-2 text-gray-600 text-sm line-clamp-3">
        //                             {blog.des}
        //                         </p>
        //                         <div className="mt-4 flex flex-wrap gap-2">
        //                             {(blog.tags || []).slice(0, 3).map((tag, i) => (
        //                                 <span
        //                                     key={i}
        //                                     className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
        //                                 >
        //                                     #{tag}
        //                                 </span>
        //                             ))}
        //                         </div>
        //                     </div>
        //                 </Link>
        //             ))}
        //         </section>
        //     </div>
        // </AnimationWrapper>
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/* blog lates */}
                <div className="w-full">
                    {/* Chuyển hướng nhưng trong cùng 1 trang khác với Navigation  */}
                    {/* nút trending blogs mặc định ẩn nếu màng hình to */}
                    <InPageNavigation routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}>
                        <>
                            {
                                blogs == null ? <Loader /> :
                                    blogs.map((blog, i) => {
                                        return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                                <BlogPostCard content={blog} author={blog.author.personal_info}/>
                                        </AnimationWrapper>
                                    })
                            }
                        </>
                        <h1>Trending Blogs Here</h1>
                    </InPageNavigation>
                </div>
                {/* blog trending and filters */}
                <div>

                </div>
            </section>
        </AnimationWrapper>
    )
}
export default HomePage;

