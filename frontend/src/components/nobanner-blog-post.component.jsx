import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { motion } from "framer-motion";

const MinimalBlogPost = ({ blog, index }) => {
  const {
    title,
    blog_id: id,
    author: { personal_info: { fullname, username, profile_img } },
    publishedAt
  } = blog;

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="w-full"
    >
      <Link
        to={`blog/${id}`}
        className="flex items-start gap-4 p-4 mb-5 rounded-3xl bg-soft-white border border-grey shadow-md hover:border-blue-400 transition-colors duration-300 cursor-pointer"
      >
        {/* INDEX */}
        <div className="flex-shrink-0 text-3xl font-bold text-blue-500">
          {index < 9 ? `0${index + 1}` : index + 1}
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col">
          {/* TITLE */}
          <motion.h2
            whileHover={{ x: 3, color: "#3b82f6" }} // Slight move + blue on hover
            transition={{ duration: 0.3 }}
            className="text-lg sm:text-xl font-bold text-dark-grey mb-2 line-clamp-2"
          >
            {title}
          </motion.h2>

          {/* AUTHOR INFO */}
          <div className="flex items-center gap-3">
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              src={profile_img}
              alt={`${fullname}'s profile`}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="flex flex-col text-sm sm:text-base">
              <motion.span
                whileHover={{ color: "#3b82f6" }}
                transition={{ duration: 0.3 }}
                className="font-semibold text-black"
              >
                {fullname}
              </motion.span>
              <motion.span
                whileHover={{ color: "#3b82f6" }}
                transition={{ duration: 0.3 }}
                className="text-dark-grey"
              >
                @{username}
              </motion.span>
            </div>
            <span className="ml-auto text-xs sm:text-sm text-dark-grey">{getDay(publishedAt)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MinimalBlogPost;
