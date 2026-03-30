import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";
import NoDataMessage from "../components/nodata.component";

// -------------------- Default Profile --------------------
export const profileDataStructure = {
    personal_info: { fullname: "", username: "", profile_img: "", bio: "" },
    account_info: { total_posts: 0, total_reads: 0 },
    social_links: {},
    joinedAt: "",
};

const ProfilePage = () => {
    const { id: profileId } = useParams();
    const { userAuth } = useContext(UserContext);

    const [profile, setProfile] = useState(profileDataStructure);
    const [blogs, setBlogs] = useState(null);
    const [loading, setLoading] = useState(true);

    const {
        personal_info: { fullname, username, profile_img, bio },
        account_info: { total_posts, total_reads },
        social_links,
        joinedAt,
    } = profile;

    // -------------------- FETCH BLOGS --------------------
    const fetchUserBlogs = ({ page = 1, user_id }) => {
        user_id = user_id ?? blogs?.user_id;

        axios
            .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
                author: user_id,
                page,
            })
            .then(async ({ data }) => {
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    counteRoute: "/search-blogs-count",
                    data_to_send: { author: user_id },
                });

                formattedData.user_id = user_id;
                setBlogs(formattedData);
            })
            .catch(console.error);
    };

    // -------------------- FETCH PROFILE --------------------
    const fetchProfile = () => {
        axios
            .post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`, {
                username: profileId,
            })
            .then(({ data }) => {
                if (!data) return setLoading(false);

                setProfile(data);
                fetchUserBlogs({ user_id: data._id });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    // -------------------- EFFECT --------------------
    useEffect(() => {
        setProfile(profileDataStructure);
        setBlogs(null);
        setLoading(true);
        fetchProfile();
    }, [profileId]);

    // -------------------- GUARDS --------------------
    if (loading) return <Loader />;
    if (!username) return <PageNotFound />;

    // -------------------- RENDER --------------------
    return (
        <AnimationWrapper className="bg-bg-soft">
            <section className="h-cover max-w-5xl mx-auto flex flex-col md:flex-row-reverse gap-8 bg-bg-main rounded-2xl p-6">
                
                {/* LEFT - PROFILE INFO */}
                <div className="flex flex-col items-center md:items-start gap-4 md:w-[45%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px]">
                    <img
                        src={profile_img}
                        alt="avatar"
                        className="w-36 h-36 rounded-full object-cover border"
                    />

                    <h1 className="text-xl font-semibold">@{username}</h1>
                    <p className="text-lg font-medium">{fullname}</p>
                    <p className="text-sm text-black">
                        {total_posts} posts · {total_reads} reads
                    </p>

                    {profileId === userAuth?.username && (
                        <Link to="/settings/edit-profile" className="btn-light text-white">
                            Edit profile
                        </Link>
                    )}

                    {/* Desktop About */}
                    <AboutUser
                        className="max-md:hidden"
                        bio={bio}
                        social_links={social_links}
                        joinedAt={joinedAt}
                    />
                </div>

                {/* RIGHT - CONTENT */}
                <div className="w-full bg-white rounded-xl p-4 shadow-sm">
                    <InPageNavigation routes={["Blogs", "About"]} defaultHidden={["About"]}>
                        
                        {/* BLOGS TAB */}
                        <>
                            {blogs === null ? (
                                <Loader />
                            ) : blogs.results.length ? (
                                blogs.results.map((blog, i) => (
                                    <div key={i}>
                                        <BlogPostCard
                                            content={blog}
                                            author={blog.author.personal_info}
                                        />
                                    </div>
                                ))
                            ) : (
                                <NoDataMessage message="This user hasn't published any blogs yet." />
                            )}

                            <LoadMoreDataBtn
                                state={blogs}
                                fetchDataFun={fetchUserBlogs}
                            />
                        </>

                        {/* ABOUT TAB */}
                        <AboutUser
                            className="text-black"
                            bio={bio}
                            social_links={social_links}
                            joinedAt={joinedAt}
                        />
                    </InPageNavigation>
                </div>

            </section>
        </AnimationWrapper>
    );
};

export default ProfilePage;
