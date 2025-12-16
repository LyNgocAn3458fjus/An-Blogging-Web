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
            to={`/blog/${id}`}
            className="
                group relative flex flex-col md:flex-row
                overflow-hidden rounded-3xl
                bg-soft-white
                shadow-lg hover:shadow-xl
                transition-all duration-300
            "
        >
            {/* Banner */}
            <div className="relative w-full md:w-1/3 h-64 md:h-auto overflow-hidden">
                <img
                    src={banner}
                    alt="blog banner"
                    className="
                        w-full h-full object-cover
                        transition-transform duration-500
                        group-hover:scale-105
                    "
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between w-full p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={profile_img}
                        alt={`${fullname}'s profile`}
                        className="
                            w-10 h-10 rounded-full object-cover
                            border border-white shadow
                        "
                    />
                    <div>
                        <p className="font-semibold text-black">{fullname}</p>
                        <p className="text-sm text-dark-grey">@{username}</p>
                    </div>
                    <p className="ml-auto text-sm text-dark-grey">
                        {getDay(publishedAt)}
                    </p>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                    <h2
                        className="
                            text-xl md:text-2xl font-semibold
                            text-black
                            group-hover:text-purple
                            transition-colors duration-300
                            line-clamp-2
                        "
                    >
                        {title}
                    </h2>
                    <p className="text-dark-grey line-clamp-3">
                        {des}
                    </p>
                </div>

                {/* Tags & Likes */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                    {tags?.map((tag) => (
                        <span
                            key={tag}
                            className="
                                px-3 py-1 text-sm font-medium
                                rounded-full
                                bg-grey text-dark-grey
                                whitespace-nowrap
                            "
                        >
                            {tag}
                        </span>
                    ))}

                    <div
                        className="
                            ml-auto flex items-center gap-1
                            text-dark-grey
                            hover:text-red
                            transition-colors duration-300
                        "
                    >
                        <i className="fi fi-rr-heart text-lg"></i>
                        <span className="font-medium">{total_likes}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BlogPostCard;
