import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
    const {
        personal_info: { fullname, username, profile_img },
    } = user;

    return (
        <Link
            to={`/user/${username}`}
            className="
                flex items-center gap-5 p-4
                rounded-3xl
                shadow-xl hover:shadow-2xl
                transition-all duration-500
                cursor-pointer group
                bg-bg-main
                hover:-translate-y-1 hover:scale-[1.02]
            "
        >
            {/* Avatar */}
            <img
                src={profile_img}
                alt={`${fullname}'s profile`}
                className="
                    w-14 h-14 rounded-full object-cover
                    border-2 border-white shadow-lg
                    transition-transform duration-500
                    group-hover:scale-110
                "
            />

            {/* Text */}
            <div className="flex flex-col">
                <h1
                    className="
                        font-semibold text-black text-xl
                        group-hover:text-purple
                        transition-colors duration-300
                    "
                >
                    {fullname}
                </h1>
                <p className="text-dark-grey">@{username}</p>
            </div>
        </Link>
    );
};

export default UserCard;
