// ========================== IMPORT ========================== //
import { Link, Navigate, Outlet, useNavigate } from "react-router-dom"; // Link và Outlet dùng cho router
import { useContext, useState } from "react";
import { UserContext } from '../App';
import UserNavigationPanel from "./user-navigation.component";
import logo from "../imgs/logo.png";

// ========================== COMPONENT NAVBAR ========================== //
const Navbar = () => {
  // State để quản lý hiển thị search box và user panel
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);
  let navigate = useNavigate();
  // Lấy thông tin user từ context
  const { userAuth, userAuth: { access_token, profile_img } = {} } = useContext(UserContext) || {};

  // Toggle hiển thị user panel
  const handleUserNavPanel = () => {
    setUserNavPanel(currentVal => !currentVal);
  }

  // Ẩn user panel khi mất focus (có thể dùng click ngoài tốt hơn)
  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200)
  }
  //nhập thông tin tìm kiếm trên search
  const handleSearch = (e) => {
    let query = e.target.value;
    //nếu có nhập kí tự và nhập enter
    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`)
    }
  }

  return (
    <>
      <nav className="navbar flex items-center p-3 bg-gradient-blue-dark backdrop-blur-md shadow-sm relative z-50">
        {/* Logo */}
        <Link to="/" className="flex-none w-10 hover:opacity-80 transition">
          <img src={logo} className="w-full" alt="Logo" />
        </Link>

        {/* Search box */}
        <div
          className={
            "absolute w-full left-0 top-full mt-2 bg-white/90 backdrop-blur-md border-b border-gray-200 py-4 px-5 rounded-xl transition-all md:static md:mt-0 md:bg-transparent md:border-none md:p-0 md:w-auto " +
            (searchBoxVisibility
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none md:opacity-100 md:scale-100 md:pointer-events-auto")
          }
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-gray-100 p-3 pl-5 pr-14 md:pr-6 rounded-full placeholder:text-gray-400 focus:ring-2 focus:ring-black/20 focus:outline-none transition"
            onKeyDown={handleSearch}
          />
          <i className="fi fi-rr-search absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 md:pointer-events-none"></i>
        </div>

        {/* Phần tử bên phải */}
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          {/* Nút tìm kiếm (mobile) */}
          <button
            className="md:hidden bg-gray-100 w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
            onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>
        </div>

        {/* Link Write (desktop) */}
        <Link className="md:flex hidden gap-2 link px-4 py-2 rounded-lg hover:bg-gray-100 transition" to="/editor">
          <i className="fi fi-rs-edit-alt"></i>
          <p className="text-white">Write</p>
        </Link>

        {/* Nếu user đã đăng nhập */}
        {access_token ? (
          <>
            {/* Nút thông báo */}
            <Link to="/dashboard/notification">
              <button className="w-12 h-12 rounded-full bg-gray-100 relative hover:bg-gray-200 transition flex items-center justify-center">
                <i className="fi fi-rr-bell text-2xl"></i>
              </button>
            </Link>

            {/* Avatar user + user panel */}
            <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
              <button className="w-12 h-12 mt-1 rounded-full overflow-hidden hover:scale-105 transition-transform">
                <img className="w-full h-full object-cover" src={profile_img} />
              </button>
              {userNavPanel && <UserNavigationPanel />}
            </div>
          </>
        ) : (
          <>
            {/* Link Sign In / Sign Up */}
            <Link className="btn-grad-blue-deep py-3 px-6 text-white rounded-lg hover:opacity-90 transition" to="/signin">Sign In</Link>
            <Link className="btn-light py-2 px-4 rounded-lg hover:opacity-90 transition hidden md:block" to="/signup">Sign Up</Link>
          </>
        )}
      </nav>

      <Outlet />

    </>
  );
};

export default Navbar;
