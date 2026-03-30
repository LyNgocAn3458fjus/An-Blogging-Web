import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaGlobe
} from "react-icons/fa";
import { getFullDay } from "../common/date";

const ICON_MAP = {
  facebook: { Icon: FaFacebookF, color: "#1877F2" },
  github: { Icon: FaGithub, color: "#000000" },
  instagram: { Icon: FaInstagram, color: "#E4405F" },
  youtube: { Icon: FaYoutube, color: "#FF0000" },
  twitter: { Icon: FaTwitter, color: "#1DA1F2" },
  website: { Icon: FaGlobe, color: "#6B7280" }
};

const AboutUser = ({ className = "", bio, social_links, joinedAt }) => {
  return (
    <div className={`md:w-[90%] md:mt-7 ${className}`}>
      <p className="text-xl leading-7">
        {bio?.length ? bio : "Nothing to read here"}
      </p>

      <div className="flex gap-x-6 gap-y-3 flex-wrap my-7 items-center">
        {Object.keys(social_links).map((key) => {
          const link = social_links[key];
          const data = ICON_MAP[key];

          if (!link || !data) return null;

          const { Icon, color } = data;

          return (
            <Link
              to={link}
              key={key}
              target="_blank"
              className="transition-transform hover:scale-125 bg-light rounded-full p-2"
            >
              <Icon size={28} style={{ color }} />
            </Link>
          );
        })}
      </div>
      <p className="text-md leading-7 text-dark-grey">Joined on {getFullDay(joinedAt)}</p>
    </div>
  );
};

export default AboutUser;
