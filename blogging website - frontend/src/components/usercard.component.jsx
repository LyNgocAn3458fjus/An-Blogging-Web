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
                rounded-3xl shadow-xl 
                bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50
                transition-all duration-500 cursor-pointer
                hover:shadow-2xl hover:scale-[1.02]
                group
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
                <h1 className="font-semibold text-gray-800 text-xl group-hover:text-purple-600 transition-colors duration-300">
                    {fullname}
                </h1>
                <p className="text-gray-500">@{username}</p>
            </div>
        </Link>
    );
};

export default UserCard;
