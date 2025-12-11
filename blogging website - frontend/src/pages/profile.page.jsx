import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // thư viện animation mạnh mẽ
import AnimationWrapper from "../common/page-animation"; // wrapper animation fade-in page

// tạo structure hiển thị lên FE
export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: "",
    },
    account_info: {
        total_posts: 0,
        total_blogs: 0
    },
    social_links: {},
    joinedAt: " "
}

// Loading shimmer animation hiển thị khi fetch data
const LoadingShimmer = () => (
    <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-32 h-32 rounded-full bg-gray-300 animate-pulse mb-4"></div> {/* avatar shimmer */}
        <div className="w-48 h-6 bg-gray-300 animate-pulse rounded mb-2"></div> {/* tên shimmer */}
        <div className="w-32 h-4 bg-gray-300 animate-pulse rounded"></div> {/* username shimmer */}
    </div>
);

const ProfilePage = () => {
    let { id: profileId } = useParams(); // khai báo id là tham số động id và đổi tên nó thành profileId cần lấy trong URL   
    let [profile, setProfile] = useState(profileDataStructure);// nhập giá trị bạn đầu là một khuôn dữ liệu profile rỗng
    let [loading, setLoading] = useState(true)// ban đầu chưa có data sẽ loading

    // destructuring dữ liệu từ đối tượng profile 
    let { 
        personal_info: { fullname, username: profile_username, profile_img, bio }, 
        account_info: { total_posts, total_blogs }, 
        social_links, 
        joinedAt 
    } = profile;

    // hàm fetch profile từ server
    const fetchUserProfile = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", { username: profileId })
            .then(({ data: user }) => {
                console.log(user);
                setProfile(user); // cập nhật state profile
                setLoading(false); // tắt loading
            })
            .catch(err => { 
                console.log(err); 
                setLoading(false);
            });
    }

    // gọi API fetchUserProfile lần đầu, tự động lấy hết data đẩy lên profile
    useEffect(() => {
        fetchUserProfile();
    }, [profileId]); // thêm profileId để khi đổi URL thì fetch lại

    // nếu đang loading thì hiển thị shimmer
    if (loading) return <LoadingShimmer />;

    return (
        // AnimationWrapper giúp page fade-in khi render
        <AnimationWrapper KeyValue={profileId} className="p-6 md:p-12 max-w-6xl mx-auto relative">

            {/* Background subtle gradient animation */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 rounded-3xl"></div> 
            {/* -z-10 để background nằm sau nội dung, animate-gradient-x là lớp CSS tự định nghĩa để gradient di chuyển nhẹ */}

            {/* Khung chính profile */}
            <div className="flex flex-col md:flex-row gap-10 bg-white bg-opacity-80 backdrop-blur-md rounded-3xl shadow-2xl p-8">

                {/* Avatar */}
                <motion.div
                    className="flex-shrink-0 relative"
                    whileHover={{ scale: 1.05, rotate: 2 }} // khi hover avatar, scale và rotate nhẹ
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <img
                        src={profile_img}
                        alt={`${fullname}'s avatar`}
                        className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
                    />
                    <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></span> {/* badge online nhấp nháy */}
                </motion.div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                    
                    {/* Name & Username */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} // xuất hiện từ mờ + trượt lên
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-4"
                    >
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500">
                            {fullname} {/* Gradient chữ nổi bật */}
                        </h1>
                        <p className="text-gray-500 text-lg mt-1">@{profile_username}</p>
                        {joinedAt && (
                            <p className="text-gray-400 text-sm mt-1">Joined: {new Date(joinedAt).toLocaleDateString()}</p>
                        )}
                    </motion.div>

                    {/* Bio */}
                    {bio && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-gray-600 mt-2 text-lg"
                        >
                            {bio} {/* phần giới thiệu cá nhân */}
                        </motion.p>
                    )}

                    {/* Account Stats */}
                    <motion.div
                        className="flex gap-6 mt-6"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.2 } } // stagger animation cho các card
                        }}
                    >
                        {[
                            { label: "Posts", value: total_posts },
                            { label: "Blogs", value: total_blogs }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                className="text-center p-4 bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 rounded-2xl shadow-lg flex-1 cursor-pointer hover:scale-105 transition-transform duration-300"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                            >
                                <p className="text-2xl font-bold text-gray-700">{stat.value}</p>
                                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Social Links */}
                    {social_links && Object.keys(social_links).length > 0 && (
                        <motion.div
                            className="flex gap-4 mt-6 flex-wrap"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {Object.entries(social_links).map(([key, link]) => (
                                <a
                                    key={key}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 text-black rounded-full shadow-md hover:scale-110 hover:shadow-lg transition-all duration-300"
                                >
                                    {key} {/* button link mạng xã hội */}
                                </a>
                            ))}
                        </motion.div>
                    )}

                </div>
            </div>
        </AnimationWrapper>
    )
}

export default ProfilePage;
