import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useState, useEffect } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import Notification from "./pages/notifications.page";
import ManageBlogs from "./pages/manage-blogs.page";
// chủ yếu để quản lí trạng thái xem người dùng có đăng nhập hay chưa

// 🔹 Tạo Context để chia sẻ thông tin user trong toàn app
export const UserContext = createContext({});
export const ThemeContext = createContext({});
// kiểm tra hệ điều hàng người dùng có đang bật dark mode không
export const darkThemePreference = () => window.matchMedia("(prefers-color-scheme:dark)").matches;
const App = () => {
  // 🔹 State lưu thông tin đăng nhập của user
  const [userAuth, setUserAuth] = useState();
  const [theme, setTheme] = useState(()=>{darkThemePreference() ? "dark" :"light"});

  // 🔹 Kiểm tra session khi trang được load
  useEffect(() => {
    let userInSession = lookInSession("user");
    //lất dữ liệu từ storage
    let themeInSession = lookInSession("theme");
    // Nếu có user trong session -> lưu lại vào state
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null })
    if (themeInSession) {
      setTheme(() => {
        document.body.setAttribute('data-theme', themeInSession)
      })
    } else {
      document.body.setAttribute('data-theme', theme)
    }
  }, []);

  return (
    // 🔹 Dùng Context Provider để truyền dữ liệu user cho toàn ứng dụng
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <Routes>
          <Route path="/editor" element={<Editor />} />
          {/* chỉnh sửa từng blog theo id */}
          <Route path="/editor/:blog_id" element={<Editor />} />
          <Route path="/" element={<Navbar />}>
            <Route path="dashboard" element={<SideNav />} >
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="notifications" element={<Notification />} />
            </Route>
            {/* index element dùng để khai báo route mặc định so với route cha là / */}
            {/* element là cái mình muốn hiển thị tại route */}
            <Route index element={<HomePage />} />
            <Route path="settings" element={<SideNav />} >
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
            <Route path="signin" element={<UserAuthForm type="sign-in" />} />
            <Route path="signup" element={<UserAuthForm type="sign-up" />} />
            <Route path="search/:query" element={<SearchPage />} />
            {/* khi để dâu : trước 1 tên thì react sẽ hiểu đó là biến */}
            <Route path="*" element={<PageNotFound />} />
            <Route path="user/:id" element={<ProfilePage />} />
            <Route path="blog/:blog_id" element={<BlogPage />} />
          </Route>
        </Routes>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;