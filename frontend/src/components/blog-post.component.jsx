import { getDay } from "../common/date";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { cardHover, bannerHover, overlayHover, titleHover, tagHover, likeHover } from "../common/motion";

const BlogPostCard = ({ content, author }) => {
  const {
    blog_id: id,
    publishedAt,
    tags,
    title,
    des,
    banner,
    activity: { total_likes },
  } = content;

  const { fullname, profile_img, username } = author;

  return (
    <AnimationWrapper KeyValue={id} className="w-full">
      <Link
        to={`/blog/${id}`}
        className={`group relative flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.15)] ${cardHover}`}
      >
        {/* Banner */}
        <div className="relative w-full md:w-1/3 h-52 md:h-auto overflow-hidden">
          <img src={banner} alt="blog banner" className={`w-full h-full object-cover ${bannerHover}`} />
          <div className={overlayHover} />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between w-full p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <img src={profile_img} alt={`${fullname}'s profile`} className="w-10 h-10 rounded-full object-cover border border-white shadow" />
            <div>
              <p className="font-semibold text-black">{fullname}</p>
              <p className="text-sm text-dark-grey">@{username}</p>
            </div>
            <p className="ml-auto text-sm text-dark-grey">{getDay(publishedAt)}</p>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className={`text-xl md:text-2xl font-semibold text-black line-clamp-2 ${titleHover}`}>{title}</h2>
            <p className="text-dark-grey/80 text-sm leading-relaxed line-clamp-2">{des}</p>
          </div>

          {/* Tags & Likes */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {tags?.map(tag => (
              <span key={tag} className={`px-3 py-1 text-xs font-medium rounded-full bg-dark-grey/5 text-dark-grey border border-dark-grey/10 ${tagHover}`}>
                {tag}
              </span>
            ))}

            <div className={`ml-auto flex items-center gap-1 text-dark-grey/70 ${likeHover}`}>
              <i className="fi fi-rr-heart text-lg" />
              <span className="font-medium">{total_likes}</span>
            </div>
          </div>
        </div>
      </Link>
    </AnimationWrapper>
  );
};

export default BlogPostCard;
