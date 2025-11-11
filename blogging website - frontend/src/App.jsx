import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useState, useEffect } from "react";
import { lookInSession } from "./common/session";


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
        {/* 🔹 Navbar là layout cha (chứa phần chung của trang) */}
        <Route path="/" element={<Navbar />}>
          {/* Trang đăng nhập */}
          <Route path="/signin" element={<UserAuthForm type="sign-in" />} />

          {/* Trang đăng ký */}
          <Route path="/signup" element={<UserAuthForm type="sign-up" />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;