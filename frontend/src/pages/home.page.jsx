import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { filterPaginationData } from "../common/filter-pagination-data";

const HomePage = () => {
    const [blogs, setBlogs] = useState(null);
    const [trendingBlogs, setTrendingBlogs] = useState(null);
    const [pageState, setPageState] = useState("home");

    const categories = [
        "programming",
        "hollywood",
        "film making",
        "social media",
        "cooking",
        "technologies",
        "finances",
        "travel",
    ];

    const fetchLatestBlogs = ({ page = 1 }) => {
        axios
            .post(`${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`, { page })
            .then(async ({ data }) => {
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    counteRoute: "/all-latest-blogs-count",
                });
                setBlogs(formattedData);
            })
            .catch(console.error);
    };

    const fetchTrendingBlogs = () => {
        axios
            .get(`${import.meta.env.VITE_SERVER_DOMAIN}/trending-blogs`)
            .then(({ data }) => setTrendingBlogs(data.blogs))
            .catch(console.error);
    };

    const fetchBlogsByCategory = ({ page = 1 }) => {
        axios
            .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
                tag: pageState,
                page,
            })
            .then(async ({ data }) => {
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    counteRoute: "/search-blogs-count",
                    data_to_send: { tag: pageState },
                });
                setBlogs(formattedData);
            })
            .catch(console.error);
    };

    useEffect(() => {
        setBlogs(null);

        if (pageState === "home") {
            fetchLatestBlogs({ page: 1 });
        } else {
            fetchBlogsByCategory({ page: 1 });
        }

        if (!trendingBlogs) {
            fetchTrendingBlogs();
        }
    }, [pageState]);

    const loadBlogByCategory = (e) => {
        const category = e.currentTarget.innerText.toLowerCase();
        setPageState(pageState === category ? "home" : category);
    };

    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10 bg-bg-soft text-black p-8 rounded-2xl transition-all duration-300">

                {/* LEFT */}
                <div className="w-full bg-bg-nav rounded-2xl shadow-md p-6 transition-all duration-300">

                    <InPageNavigation
                        routes={[pageState, "trending blogs"]}
                        defaultHidden={["trending blogs"]}
                    >

                        <>
                            {blogs === null ? (
                                <Loader />
                            ) : blogs.results.length ? (
                                blogs.results.map((blog, i) => (
                                    <AnimationWrapper
                                        key={i}
                                        transition={{ delay: i * 0.08 }}
                                    >
                                        <div className="bg-bg-list rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                            <BlogPostCard
                                                content={blog}
                                                author={blog.author.personal_info}
                                            />
                                        </div>
                                    </AnimationWrapper>
                                ))
                            ) : (
                                <NoDataMessage message="No blog published" />
                            )}

                            <LoadMoreDataBtn
                                state={blogs}
                                fetchDataFun={
                                    pageState === "home"
                                        ? fetchLatestBlogs
                                        : fetchBlogsByCategory
                                }
                            />
                        </>

                        <>
                            {trendingBlogs === null ? (
                                <Loader />
                            ) : trendingBlogs.length ? (
                                trendingBlogs.map((blog, i) => (
                                    <AnimationWrapper
                                        key={i}
                                        transition={{ delay: i * 0.08 }}
                                    >
                                        <div className="bg-bg-list rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                            <MinimalBlogPost
                                                blog={blog}
                                                index={i}
                                            />
                                        </div>
                                    </AnimationWrapper>
                                ))
                            ) : (
                                <NoDataMessage message="No trending blog" />
                            )}
                        </>
                    </InPageNavigation>
                </div>

                {/* RIGHT */}
                <div className="min-w-[50%] lg:min-w-[500px] max-w-min border-l border-slate pl-8 pt-3 max-md:hidden">

                    <div className="flex flex-col gap-10">

                        <div>
                            <h1 className="font-semibold text-lg text-black mb-3">
                                Stories from all interests
                            </h1>

                            <div className="flex gap-3 flex-wrap">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={loadBlogByCategory}
                                        className={
                                            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 " +
                                            (pageState === category
                                                ? "bg-black text-bg-main shadow-md"
                                                : "bg-bg-soft text-grey hover:bg-slate hover:text-black")
                                        }
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-14">
                        <h1 className="font-semibold text-xl mb-6 text-black flex items-center gap-2">
                            Trending
                            <i className="fi fi-rr-arrow-trend-up text-navy" />
                        </h1>

                        {trendingBlogs === null ? (
                            <Loader />
                        ) : (
                            trendingBlogs.map((blog, i) => (
                                <AnimationWrapper
                                    key={i}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <div className="bg-bg-list rounded-xl p-4 mb-3 hover:shadow-md transition-all duration-300">
                                        <MinimalBlogPost
                                            blog={blog}
                                            index={i}
                                        />
                                    </div>
                                </AnimationWrapper>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    );

};

export default HomePage;
