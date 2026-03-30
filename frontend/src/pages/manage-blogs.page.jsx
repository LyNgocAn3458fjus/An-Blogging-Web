// =====================
// Imports
// =====================
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context
import { UserContext } from "../App";

// Utils
import { filterPaginationData } from "../common/filter-pagination-data";

// Components
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import AnimationWrapper from "../common/page-animation";
import {
    ManagePublishedBlogCard,
    ManageDraftBlogPost,
} from "../components/manage-blogcard.component";

// =====================
// Component
// =====================
const ManageBlogs = () => {
    // ---------------------
    // State
    // ---------------------
    const [blogs, setBlogs] = useState(null);
    const [drafts, setDrafts] = useState(null);
    const [query, setQuery] = useState("");

    // ---------------------
    // Context & Params
    // ---------------------
    const {
        userAuth: { access_token },
    } = useContext(UserContext);

    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get("tab");

    // ---------------------
    // Fetch blogs
    // ---------------------
    const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
        axios
            .post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/user-written-blogs`,
                {
                    page,
                    draft,
                    query,
                    deletedDocCount,
                },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            )
            .then(async ({ data }) => {
                const formattedData = await filterPaginationData({
                    state: draft ? drafts : blogs,
                    data: data.blogs,
                    page,
                    user: access_token,
                    counteRoute: "/user-written-blogs-count",
                    data_to_send: { draft, query },
                });

                draft ? setDrafts(formattedData) : setBlogs(formattedData);
            })
            .catch(console.error);
    };

    // ---------------------
    // Effects
    // ---------------------
    useEffect(() => {
        if (!access_token) return;

        if (blogs === null) {
            getBlogs({ page: 1, draft: false });
        }

        if (drafts === null) {
            getBlogs({ page: 1, draft: true });
        }
    }, [access_token, blogs, drafts, query]);

    // ---------------------
    // Handlers
    // ---------------------
    const handleSearch = (e) => {
        const searchQuery = e.target.value;
        setQuery(searchQuery);

        if (e.key === "Enter" && searchQuery.length) {
            setBlogs(null);
            setDrafts(null);
        }
    };

    const handleChange = (e) => {
        if (!e.target.value.length) {
            setQuery("");
            setBlogs(null);
            setDrafts(null);
        }
    };

    // =====================
    // Render
    // =====================
    return (
        <>
            {/* Title */}
            <h1 className="max-md:hidden text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Manage Blogs
            </h1>

            <Toaster />

            {/* Search */}
            <div className="relative max-md:mt-5 md:mt-8 mb-10">
                <input
                    type="search"
                    placeholder="Search Blogs"
                    className="w-full p-4 pl-12 pr-6 rounded-full transition-all
                               focus:ring-2 focus:ring-indigo-400
                               hover:border-indigo-400 text-grey"
                    onChange={handleChange}
                    onKeyDown={handleSearch}
                />
                <i className="fi fi-rr-search absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 md:pointer-events-none"></i>
            </div>

            {/* Tabs */}
            <InPageNavigation
                routes={["Publish Blogs", "Drafts"]}
                defaultActiveIndex={activeTab !== "draft" ? 0 : 1}
            >
                {/* Published Blogs */}
                {blogs === null ? (
                    <Loader />
                ) : blogs.results.length ? (
                    <>
                        {blogs.results.map((blog, i) => (
                            <AnimationWrapper 
                                key={i}
                                transition={{ delay: i * 0.04 }}
                            >
                                <ManagePublishedBlogCard
                                    blog={{
                                        ...blog,
                                        index: i,
                                        setStateFunc: setBlogs,
                                    }}
                                />
                            </AnimationWrapper>
                        ))}

                        <LoadMoreDataBtn
                            state={blogs}
                            fetchDataFun={getBlogs}
                            additionalParam={{
                                draft: false,
                                deletedDocCount: blogs.deletedDocCount,
                            }}
                        />
                    </>
                ) : (
                    <NoDataMessage message="No published blogs" />
                )}

                {/* Draft Blogs */}
                {drafts === null ? (
                    <Loader />
                ) : drafts.results.length ? (
                    <>
                        {drafts.results.map((blog, i) => (
                            <AnimationWrapper
                                key={i}
                                transition={{ delay: i * 0.04 }}
                            >
                                <ManageDraftBlogPost
                                    blog={{
                                        ...blog,
                                        index: i,
                                        setStateFunc: setDrafts,
                                    }}
                                />
                            </AnimationWrapper>
                        ))}

                        <LoadMoreDataBtn
                            state={drafts}
                            fetchDataFun={getBlogs}
                            additionalParam={{
                                draft: true,
                                deletedDocCount: drafts.deletedDocCount,
                            }}
                        />
                    </>
                ) : (
                    <NoDataMessage message="No drafts available" />
                )}
            </InPageNavigation>
        </>
    );
};

export default ManageBlogs;
