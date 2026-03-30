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
      className="group flex items-start gap-4 p-4 mb-5 rounded-3xl bg-bg-list border border-grey shadow-md hover:border-blue-400 transition-all duration-300 cursor-pointer"
    >
      {/* INDEX */}
      <div className="flex-shrink-0 text-3xl font-bold text-blue-500">
        {index < 9 ? `0${index + 1}` : index + 1}
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TITLE */}
        <h2
          className="text-lg sm:text-xl font-bold text-dark-grey mb-2 line-clamp-2 transition-all duration-300 group-hover:text-blue-500 group-hover:translate-x-1"
        >
          {title}
        </h2>

        {/* AUTHOR INFO */}
        <div className="flex items-center gap-3">
          <img
            src={profile_img}
            alt={`${fullname}'s profile`}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm transition-transform duration-300 group-hover:scale-110"
          />

          <div className="flex flex-col text-sm sm:text-base">
            <span className="font-semibold text-black transition-colors duration-300 group-hover:text-blue-500">
              {fullname}
            </span>

            <span className="text-dark-grey transition-colors duration-300 group-hover:text-blue-500">
              @{username}
            </span>
          </div>

          <span className="ml-auto text-xs sm:text-sm text-dark-grey">
            {getDay(publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MinimalBlogPost;
