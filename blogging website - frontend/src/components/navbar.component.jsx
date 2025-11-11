// ========================== IMPORT ========================== //
import { Link, Outlet } from "react-router-dom"; // Link và Outlet dùng cho router
import { useContext, useState } from "react"; 
import { UserContext } from '../App';
import UserNavigationPanel from "./user-navigation.component";
import logo from "../imgs/logo.png";

// ========================== COMPONENT NAVBAR ========================== //
const Navbar = () => {
  // State để quản lý hiển thị search box và user panel
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);

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

  return (
    <>
      <nav className="navbar">

        {/* Logo: nhấn về trang chủ */}
        <Link to="/" className="flex-none w-10">
          <img src={logo} className="w-full" alt="Logo" />
        </Link>

        {/* Search box */}
        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto " +
            (searchBoxVisibility ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark md:pl-12"
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>

        {/* Phần tử bên phải */}
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          {/* Nút tìm kiếm (mobile) */}
          <button
            className="md:hidden bg-grey w-12 h-12 flex items-center justify-center rounded-full"
            onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>
        </div>

        {/* Link Write (desktop) */}
        <Link className="md:flex hidden gap-2 link" to="/editor">
          <i className="fi fi-rs-edit-alt"></i>
          <p>Write</p>
        </Link>

        {/* Nếu user đã đăng nhập */}
        {access_token ? (
          <>
            {/* Nút thông báo */}
            <Link to="/dashboard/notification">
              <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                <i className="fi fi-rr-bell text-2xl block mt-1"></i>
              </button>
            </Link>

            {/* Avatar user + user panel */}
            <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
              <button className="w-12 h-12 mt-1">
                <img className="w-full h-full object-cover rounded-full" src={profile_img} />
              </button>
              {userNavPanel && <UserNavigationPanel />}
            </div>
          </>
        ) : (
          <>
            {/* Link Sign In / Sign Up */}
            <Link className="btn-dark py-2" to="/signin">Sign In</Link>
            <Link className="btn-light py-2 hidden md:block" to="/signup">Sign Up</Link>
          </>
        )}
      </nav>

      {/* Outlet để render các route con */}
      <Outlet />
    </>
  );
};

export default Navbar;
