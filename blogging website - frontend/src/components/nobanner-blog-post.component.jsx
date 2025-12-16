import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const MinimalBlogPost = ({ blog, index }) => {
    const {
        title,
        blog_id: id,
        author: { personal_info: { fullname, username, profile_img } },
        publishedAt
    } = blog;

    return (
        <Link
            to={`blog/${id}`}
            className="
                flex items-center 
                gap-3 sm:gap-4
                p-3 sm:p-4
                mb-5 rounded-3xl
                shadow-lg hover:shadow-xl
                transition-all duration-500
                bg-soft-white border border-grey
                hover:-translate-y-1 hover:scale-[1.02]
                cursor-pointer group
            "
        >
            {/* INDEX */}
            <div
                className="
                    text-xl sm:text-2xl
                    font-extrabold text-grey
                    group-hover:text-purple
                    transition-colors duration-500
                "
            >
                {index < 9 ? `0${index + 1}` : index + 1}
            </div>

            {/* INFO */}
            <div className="flex flex-col w-full">
                {/* AUTHOR */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <img
                        src={profile_img}
                        alt={`${fullname}'s profile`}
                        className="
                            w-8 h-8 
                            sm:w-10 sm:h-10
                            rounded-full object-cover 
                            border-2 border-white shadow-md
                            group-hover:scale-110 
                            transition-transform duration-500
                        "
                    />

                    <div>
                        <p
                            className="
                                text-sm sm:text-base
                                font-semibold text-black
                            "
                        >
                            {fullname}
                        </p>
                        <p className="text-dark-grey text-xs sm:text-sm">
                            @{username}
                        </p>
                    </div>

                    <p className="ml-auto text-dark-grey text-xs sm:text-sm font-medium">
                        {getDay(publishedAt)}
                    </p>
                </div>

                {/* TITLE */}
                <h2
                    className="
                        mt-3
                        text-base sm:text-lg
                        font-bold text-dark-grey
                        group-hover:text-purple
                        transition-colors duration-500
                    "
                >
                    {title}
                </h2>
            </div>
        </Link>
    );
};

export default MinimalBlogPost;
