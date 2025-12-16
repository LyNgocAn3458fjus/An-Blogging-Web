import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {
    let [blogs, setBlogs] = useState(null)
    let [trendingBlogs, setTrendingBlogs] = useState(null)
    let [pageState, setPageState] = useState("home")
    let categories = ["programming", "hollywood", "film making", "social media", "cooking", "technologies", "finances", "travel"];

    // tạo bảng blog theo từng trang/phân trang
    const fetchLatestBlogs = ({ page = 1 }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
            .then(async ({ data }) => {
                //hàm xử lí phân trang
                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    counteRoute: "/all-latest-blogs-count"
                })
                setBlogs(formatedData)
            })
            .catch(err => console.log(err));
    };

    //lấy blog trending 
    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then(({ data }) => setTrendingBlogs(data.blogs))
            .catch(err => console.log(err));
    }

    // ham fetch dùng để lấy dự liệu từ server thông qua endpoint
    const fetchBlogsByCategory = ({ page = 1 }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState, page })
            .then(async ({ data }) => {
                //hàm xử lí phân trang
                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    counteRoute: "/search-blogs-count",
                    data_to_send: { tag: pageState }
                })
                setBlogs(formatedData)
            })
            .catch(err => console.log(err));
    }

    // dùng useEffect xử lí các logic nhỏ nhỏ tab điều hướng mà không cần re render*+
    useEffect(() => {
        activeTabRef.current.click();
        if (pageState === "home") {
            fetchLatestBlogs({ page: 1 });
        }
        else {
            fetchBlogsByCategory({ page: 1 });
        }
        if (!trendingBlogs) {
            fetchTrendingBlogs();
        }
    }, [pageState])

    const loadBlogByCategory = (e) => {
        let category = e.target.innerText.toLowerCase(); // innerText là lấy và thay đổi nội dung text
        setBlogs(null);
        if (pageState === category) {
            setPageState("home")
            return;
        }
        setPageState(category)// chuyển đổi nút home theo category khi click vào
    }

    return (
        <AnimationWrapper>
            <section className="
                h-cover
                flex
                justify-center
                gap-10
                bg-soft-lavender
                p-6
                rounded-2xl
            ">
                {/* blog lates */}
                <div className="w-full bg-white rounded-xl shadow-sm p-4">
                    {/* Chuyển hướng nhưng trong cùng 1 trang khác với Navigation  */}
                    {/* nút trending blogs mặc định ẩn nếu màng hình to */}
                    <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]}>
                        {/* nơi in danh sach cac blog */}
                        <>
                            {
                                blogs === null ?
                                    (<Loader />) :
                                    (
                                        blogs.results.length ?
                                            blogs.results.map((blog, i) => {
                                                return (
                                                    <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                                        <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                    </AnimationWrapper>
                                                );

                                            })
                                            : <NoDataMessage message="No blog published" />
                                    )
                            }
                            {/* tải thêm blog mới */}
                            <LoadMoreDataBtn
                                state={blogs}
                                fetchDataFun={pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory}
                            />
                        </>
                        <>
                            {
                                trendingBlogs === null ?
                                    (<Loader />) :
                                    (
                                        trendingBlogs.length ?
                                            trendingBlogs.map((blog, i) => {
                                                return (
                                                    <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                                        < MinimalBlogPost blog={blog} index={i} />
                                                    </AnimationWrapper>
                                                );
                                            })
                                            : <NoDataMessage message="No trending blog" />
                                    )
                            }
                        </>

                    </InPageNavigation>
                </div>
                {/* blog trending and filters */}
                <div className="min-w-[50%] lg:min-w-[500px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden ">
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium">Storeies from all insterests</h1>
                            <div className="flex gap-3 flex-wrap mt-2">
                                {
                                    categories.map((category, i) => {
                                        return <button onClick={loadBlogByCategory} className={"tag" + (pageState === category ? " bg-black text-white" : " ")} key={i}>{category}</button>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className="font-medium text-xl mb-4">Trending  <i className="fi fi-rr-arrow-trend-up" /></h1>
                        {
                            trendingBlogs === null ? (<Loader />) :
                                trendingBlogs.map((blog, i) => {
                                    return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                        < MinimalBlogPost blog={blog} index={i} />
                                    </AnimationWrapper>
                                })
                        }
                    </div>
                </div>

            </section>
        </AnimationWrapper>
    )
}
export default HomePage;
