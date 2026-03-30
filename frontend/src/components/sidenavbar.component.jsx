import { Outlet, NavLink, Navigate } from "react-router-dom";
import { UserContext } from "../App";
import { useContext, useEffect, useRef, useState } from "react";

const SideNav = () => {
  const { userAuth = {} } = useContext(UserContext)
  const { access_token, new_notification_available = false, isAdmin } = userAuth

  let page = location.pathname.split("/")[2];

  let [pageState, setPageState] = useState(
    page?.replace(/-/g, " ") ?? "dashboard"
  );

  let activeTabLine = useRef(null);
  let sideBarIconTab = useRef(null);
  let pageStateTab = useRef(null);
  let [showSideNav, setShowSideNav] = useState(false);
  const baseLink =
    "group relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200";

  const activeLink =
    "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md";

  const inactiveLink =
    "text-gray-600 hover:bg-gray-100";

  const changePageState = (e) => {
    const { offsetWidth, offsetLeft } = e.currentTarget;

    if (activeTabLine.current) {
      activeTabLine.current.style.width = offsetWidth + "px";
      activeTabLine.current.style.left = offsetLeft + "px";
    }

    if (e.currentTarget === sideBarIconTab.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setShowSideNav(false);
    pageStateTab.current?.click();
  }, [pageState]);
  if (!access_token) {
    return <Navigate to="/signin" replace />;
  }
  return (
    <div className="bg-bg-main">
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col bg-bg-soft">
        {/* ===== Mobile header ===== */}
        <div className="sticky top-[80px] z-30 md:hidden">
          <div className="bg-bg-nav py-1 border-b border-gray-200 flex overflow-x-auto relative rounded-md">
            <button
              ref={sideBarIconTab}
              className="p-5 capitalize"
              onClick={changePageState}
            >
              <i className="fi fi-rr-bars-staggered pointer-events-none" />
            </button>

            <button
              ref={pageStateTab}
              className="p-5 capitalize"
              onClick={changePageState}
            >
              {pageState}
            </button>

            <hr
              ref={activeTabLine}
              className="absolute bottom-0 h-[2px] bg-indigo-500 duration-300"
            />
          </div>
        </div>

        {/* ===== Sidebar ===== */}
        <aside
          className={
            "min-w-[220px] h-[calc(100vh-80px)] " +
            "absolute md:sticky top-24 " +
            "overflow-y-auto p-6 md:pr-0 md:border-r border-gray-200 " +
            "bg-bg-main z-20 " +
            "max-md:top-[64px] max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 " +
            "transition-all duration-300 " +
            (!showSideNav
              ? "max-md:opacity-0 max-md:pointer-events-none"
              : "opacity-100 pointer-events-auto")
          }
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your content
            </p>
          </div>

          <hr className="border-gray-200 -ml-6 mb-8 mr-6" />

          {/* NAV */}
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/dashboard/blogs"
              onClick={() => setPageState("blogs")}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
            >
              <i className="fi fi-rr-document text-lg group-hover:scale-110 transition" />
              Blogs
            </NavLink>

            <NavLink
              to="/dashboard/notifications"
              onClick={() => setPageState("notifications")}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
            >
              <div className="relative">
                <i className="fi fi-rr-bell text-lg group-hover:scale-110 transition" />
                {
                  new_notification_available ?
                    <span className="bg-red w-3 h-3 rounded-full absolute z-10 bottom-4 left-2"></span> : ""
                }
              </div>

              Notifications
            </NavLink>

            {
              isAdmin ? <NavLink
                to="/editor"
                onClick={() => setPageState("write")}
                className={`${baseLink} text-gray-600 hover:bg-indigo-50`}
              >
                <i className="fi fi-rr-edit text-lg group-hover:scale-110 transition" />
                Write
              </NavLink> : ""
            }

            <h2 className="mt-6 mb-2 text-xs uppercase tracking-widest text-gray-400">
              Settings
            </h2>

            <NavLink
              to="/settings/edit-profile"
              onClick={() => setPageState("edit profile")}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? "bg-gray-900 text-white" : inactiveLink
                }`
              }
            >
              Edit profile
            </NavLink>

            <NavLink
              to="/settings/change-password"
              onClick={() => setPageState("change password")}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? "bg-gray-900 text-white" : inactiveLink
                }`
              }
            >
              Change password
            </NavLink>
          </nav>
        </aside>

        {/* ===== Main content ===== */}
        <main className="flex-1 px-10 py-8 bg-bg-main relative z-10">
          <Outlet />
        </main>
      </section>
    </div>

  );
};

export default SideNav;
