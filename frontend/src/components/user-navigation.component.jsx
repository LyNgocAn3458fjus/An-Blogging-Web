import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

//đây là một component hiên thị một lí danh sách giống dropdown trên navigation bar
const UserNavigationPanel = () => {
    // Lấy username và setUserAuth từ context
    const { userAuth: { username, isAdmin }, setUserAuth } = useContext(UserContext);

    // Hàm sign out user
    const signOutUser = () => {
        removeFromSession("user");       // Xóa session
        setUserAuth({ access_token: null }); // Cập nhật context
    }

    return (
        // Animation cho menu panel
        <AnimationWrapper className="absolute right-0 z-50" transition={{ duration: 0.2 }}>
            <div
                className="
                    bg-bg-nav   
                    absolute right-0
                    w-60
                    rounded-2xl
                    border border-grey
                    shadow-xl
                    duration-200
                    overflow-hidden
                "
            >
                {
                    isAdmin ? <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
                        <i className="fi fi-rs-edit-alt"></i>
                        <p className="text-white">Write</p>
                    </Link> : ""

                }

                {/* Link Profile */}
                <Link className="text-black link pl-8 py-4" to={`/user/${username}`}>
                    Profile
                </Link>

                {/* Link Dashboard */}
                <Link className="text-black link pl-8 py-4" to={"/dashboard"}>
                    DashBoard
                </Link>

                {/* Link Setting */}
                <Link className="text-black link pl-8 py-4" to={"/settings"}>
                    Settings
                </Link>

                {/* Dòng phân cách */}
                <span className="text-black block border-t border-grey w-full"></span>

                {/* Nút Sign Out */}
                <button
                    onClick={signOutUser}
                    className="text-black text-left w-full pl-8 py-4 hover:bg-grey duration-200"
                >
                    <h1 className="font-bold text-xl text-black">Sign Out</h1>
                    <p className="text-black">@{username}</p>
                </button>
            </div>
        </AnimationWrapper>
    )
}

export default UserNavigationPanel;
