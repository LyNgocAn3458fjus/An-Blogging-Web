import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
//đây là một component hiên thị một lí danh sách giống dropdown trên navigation bar
const UserNavigationPanel = () => {
    // Lấy username và setUserAuth từ context
    const { userAuth: { username }, setUserAuth } = useContext(UserContext);

    // Hàm sign out user
    const signOutUser = () => {
        removeFromSession("user");       // Xóa session
        setUserAuth({ access_token: null }); // Cập nhật context
    }

    return (
        // Animation cho menu panel
        <AnimationWrapper className="absolute right-0 z-50" transition={{ duration: 0.2 }}>
            <div className="bg-white absolute right-0 border -grey w-60 duration-200">
                
                {/* Link Write (mobile only) */}
                <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
                    <i className="fi fi-rs-edit-alt"></i>
                    <p>Write</p>
                </Link>

                {/* Link Profile */}
                <Link className="link pl-8 py-4" to={`/user/${username}`}>
                    Profile
                </Link>

                {/* Link Dashboard */}
                <Link className="link pl-8 py-4" to={"/user/dashborad"}>
                    DashBoard
                </Link>

                {/* Link Setting */}
                <Link className="link pl-8 py-4" to={"/user/setting"}>
                    Setting
                </Link>

                {/* Dòng phân cách */}
                <span className="absolute border-t border-grey w-[100%]"></span>

                {/* Nút Sign Out */}
                <button onClick={signOutUser} className="text-left p-4 hover:bg-grey w-full pl-8 py-4">
                    <h1 className="mg-1 font-bold text-xl">Sign Out</h1>
                    <p className="text-dark-grey">@{username}</p>
                </button>
            </div>
        </AnimationWrapper>
    )
}

export default UserNavigationPanel;
