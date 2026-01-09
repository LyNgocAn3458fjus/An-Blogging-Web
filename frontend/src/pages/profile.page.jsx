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

import { motion } from "framer-motion";

// -------------------- Motion Variants --------------------
const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: "easeOut" } };
const avatarHover = { whileHover: { scale: 1.05, rotate: 2, transition: { duration: 0.3 } } };
const cardHover = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, whileHover: { scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }, transition: { duration: 0.4 } };
const buttonHover = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };

// Cấu trúc mặc định cho profile
export const profileDataStructure = {
    personal_info: { fullname: "", username: "", profile_img: "", bio: "" },
    account_info: { total_posts: 0, total_reads: 0 },
    social_links: {},
    joinedAt: " ",
};

const ProfilePage = () => {
    const { id: profileId } = useParams();
    const { userAuth } = useContext(UserContext);
    const username = userAuth?.username;

    const [profile, setProfile] = useState(profileDataStructure);
    const [blogs, setBlogs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileLoaded, setProfileLoaded] = useState("");

    const {
        personal_info: { fullname, username: profile_username, profile_img, bio },
        account_info: { total_posts, total_reads },
        social_links,
        joinedAt,
    } = profile;

    // -------------------- FETCH BLOGS --------------------
    const getBlog = ({ page = 1, user_id }) => {
        user_id = user_id === undefined ? blogs?.user_id : user_id;

        axios
            .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, { author: user_id, page })
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
            .catch(err => console.log(err));
    };

    // -------------------- FETCH USER PROFILE --------------------
    const fetchUserProfile = () => {
        axios
            .post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`, { username: profileId })
            .then(({ data: user }) => {
                if (user !== null) setProfile(user);
                setProfileLoaded(profileId);
                getBlog({ user_id: user._id });
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    };

    // -------------------- RESET STATE --------------------
    const resetState = () => {
        setProfile(profileDataStructure);
        setLoading(true);
        setProfileLoaded("");
    };

    // -------------------- EFFECT --------------------
    useEffect(() => {
        if (profileId !== profileLoaded) setBlogs(null);
        if (blogs === null) {
            resetState();
            fetchUserProfile();
        }
    }, [profileId, blogs]);

    // -------------------- RENDER --------------------
    if (loading) return <Loader />;

    if (!profile_username?.length) return <PageNotFound />;

    return (
        <AnimationWrapper>
            <motion.section {...fadeInUp} className="h-cover max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center md:items-start gap-6 md:gap-8 min-[1100px]:gap-12 bg-soft-lavender rounded-2xl p-6">
                
                {/* -------------------- LEFT / PROFILE INFO -------------------- */}
                <motion.div {...fadeInUp} className="flex flex-col items-center md:items-start gap-4 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
                    <motion.img {...avatarHover} className="w-40 h-40 md:w-32 md:h-32 rounded-full object-cover border border-gray-200 shadow-sm" src={profile_img} alt="avatar" />
                    <motion.h1 {...fadeInUp} className="text-xl md:text-2xl font-semibold">@{profile_username}</motion.h1>
                    <motion.p {...fadeInUp} className="text-xl md:text-2xl font-medium">{fullname}</motion.p>
                    <motion.p {...fadeInUp} className="text-xl md:text-2xl font-medium">{total_posts.toLocaleString()} posts – {total_reads.toLocaleString()} reads</motion.p>

                    {/* Nếu là chính mình thì hiển thị nút chỉnh sửa */}
                    {profileId === username && (
                        <motion.div {...buttonHover} className="flex gap-4 mt-2">
                            <Link className="btn-light rounded-md" to="/setting/edit-profile">Edit profile</Link>
                        </motion.div>
                    )}

                    {/* Thông tin AboutUser bên trái, chỉ hiển thị trên desktop */}
                    <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt} />
                </motion.div>

                {/* -------------------- RIGHT / CONTENT -------------------- */}
                <div className="max-md:mt-12 w-full bg-white rounded-xl p-4 shadow-sm">
                    <InPageNavigation routes={["Blogs", "About"]} defaultHidden={["About"]}>
                        {/* Blogs Tab */}
                        <>
                            {blogs === null ? (
                                <Loader />
                            ) : blogs.results.length ? (
                                <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                                    {blogs.results.map((blog, i) => (
                                        <motion.div key={i} {...cardHover}>
                                            <BlogPostCard content={blog} author={blog.author.personal_info} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <NoDataMessage message="This user hasn't published any blogs yet." />
                            )}

                            <LoadMoreDataBtn state={blogs} fetchDataFun={getBlog} />
                        </>

                        {/* About Tab */}
                        <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
                    </InPageNavigation>
                </div>
            </motion.section>
        </AnimationWrapper>
    );
};

export default ProfilePage;
