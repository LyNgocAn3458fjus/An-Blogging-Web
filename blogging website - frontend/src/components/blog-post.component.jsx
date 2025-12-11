    import { getDay } from "../common/date";
    import { Link } from "react-router-dom";

    const BlogPostCard = ({ content, author }) => {
        const {
            publishedAt,
            tags,
            title,
            des,
            banner,
            activity: { total_likes },
            blog_id: id,
        } = content;

        const { fullname, profile_img, username } = author;

        return (
            <Link
                to={`blog/${id}`}
                className="relative flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-2xl hover:shadow-4xl transition-all duration-500 cursor-pointer group bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50"
            >
                {/* Banner */}
                <div className="relative w-full md:w-1/3 h-64 md:h-auto overflow-hidden rounded-t-3xl md:rounded-l-3xl">
                    <img
                        src={banner}
                        alt="blog banner"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between p-6 md:p-8 w-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 animate-fadeIn">
                        <img
                            src={profile_img}
                            alt={`${fullname}'s profile`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg animate-pulse-slow"
                        />
                        <div>
                            <p className="font-bold text-gray-900">{fullname}</p>
                            <p className="text-gray-500 text-sm">@{username}</p>
                        </div>
                        <p className="ml-auto text-gray-400 text-sm">{getDay(publishedAt)}</p>
                    </div>

                    {/* Title & Description */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold text-gray-600 group-hover:text-purple-600 transition-colors duration-500 line-clamp-2 animate-slideUp">
                            {title}
                        </h2>
                        <p className="text-gray-700 line-clamp-3 mt-1 animate-slideUp delay-150">{des}</p>
                    </div>

                    {/* Tags & Likes */}
                    <div className="flex flex-wrap items-center gap-3 mt-6">
                        {tags?.map((tag, i) => (
                            <span
                                key={i}
                                className="py-1 px-4 rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 text-dark font-medium text-sm shadow-md whitespace-nowrap animate-bounce"
                            >
                                {tag}
                            </span>
                        ))}

                        <div className="flex items-center gap-1 ml-auto text-gray-600 hover:text-red-500 transition-colors duration-300">
                            <i className="fi fi-rr-heart text-xl animate-pulse"></i>
                            <span className="font-medium">{total_likes}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    export default BlogPostCard;
