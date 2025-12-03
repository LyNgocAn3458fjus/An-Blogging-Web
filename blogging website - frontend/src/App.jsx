import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useState, useEffect } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";


// chủ yếu để quản lí trạng thái xem người dùng có đăng nhập hay chưa

// 🔹 Tạo Context để chia sẻ thông tin user trong toàn app
export const UserContext = createContext({});

const App = () => {
  // 🔹 State lưu thông tin đăng nhập của user
  const [userAuth, setUserAuth] = useState();

  // 🔹 Kiểm tra session khi trang được load
  useEffect(() => {
    let userInSession = lookInSession("user");

    // Nếu có user trong session -> lưu lại vào state
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    // 🔹 Dùng Context Provider để truyền dữ liệu user cho toàn ứng dụng
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/" element={<Navbar />}>
        {/* index element dùng để khai báo route mặc định so với route cha là / */}
          <Route index element={<HomePage />} />
          <Route path="/signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="/signup" element={<UserAuthForm type="sign-up" />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;