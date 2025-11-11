// ========================== IMPORT THƯ VIỆN ========================== //
import { useContext, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";
// ========================== COMPONENT CHÍNH ========================== //
const UserAuthForm = ({ type }) => {
  const authForm = useRef(); // Tham chiếu đến form trong DOM
  const { userAuth: { access_token }, setUserAuth } = useContext(UserContext); // Lấy userAuth và hàm cập nhật
  console.log(access_token);

  // ===== GỬI DỮ LIỆU ĐĂNG NHẬP / ĐĂNG KÝ LÊN SERVER ===== //
  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data)); // Lưu user vào session
        setUserAuth(data); // Cập nhật context để app biết user đã đăng nhập
      })
      .catch(({ response }) => {
        toast.error(response.data.error); // Hiển thị lỗi nếu có
      });
  };

  // ===== XỬ LÝ SỰ KIỆN SUBMIT FORM ===== //
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn reload trang

    // Chọn đường dẫn API theo loại form
    const serverRoute = type === "sign-in" ? "/signin" : "/signup";

    // Biểu thức regex kiểm tra email và mật khẩu
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    // Lấy dữ liệu từ form DOM
    const form = new FormData(authForm.current);
    const formData = {};
    for (let [key, value] of form.entries()) formData[key] = value;

    // Kiểm tra dữ liệu nhập vào
    const { fullname, email, password } = formData;

    if (fullname && fullname.length < 3)
      return toast.error("Full name must be at least 3 letters long");

    if (!email || !email.length) return toast.error("Enter email");

    if (!emailRegex.test(email)) return toast.error("Email is invalid");

    if (!passwordRegex.test(password))
      return toast.error(
        "Password should be 6-20 characters long with at least 1 number, 1 lowercase, and 1 uppercase letter"
      );

    // Gửi dữ liệu hợp lệ lên server
    userAuthThroughServer(serverRoute, formData);
  };


  //Tạo chức năng xử lí handGoogleAuth
  const handleGoogleAuth =(e) =>{
    e.preventDefault();// chặn load lại trang
    authWithGoogle().then(user =>{
      let serviceRoute = "/google-auth";
      let formData = {
        access_token:user.accesstoken
      }
      userAuthThroughServer(serviceRoute, formData)


    }).catch(err =>{
      toast.error('trouble login through google')
      console.log(err)        
    })
  }
  // Nếu đã đăng nhập → chuyển hướng về trang chủ
  if (access_token) return <Navigate to="/" />;

  // ===== GIAO DIỆN FORM ===== //
  return (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster /> {/* Hiển thị thông báo */}

        <form ref={authForm} id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-4">
            {type === "sign-in"
              ? "Hello, welcome to us"
              : "Come and join us"}
          </h1>

          {/* Nếu là đăng ký thì hiển thị ô nhập fullname */}
          {type !== "sign-in" && (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          )}

          {/* Email */}
          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />

          {/* Password */}
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          {/* Nút Submit */}
          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>

          {/* Dòng phân cách */}
          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          {/* Nút đăng nhập bằng Google */}
          <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center" onClick={handleGoogleAuth}>
            <img src={googleIcon} className="w-5" alt="Google" />
            Continue with Google
          </button>

          {/* Link chuyển trang đăng nhập / đăng ký */}
          {type === "sign-in" ? (
            <p className="mt-4 text-xl text-center">
              Don’t you have an account?
              <Link
                to="/signup"
                className="underline ml-1 text-xl text-dark-grey"
              >
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-xl text-center">
              Already a member?
              <Link
                to="/signin"
                className="underline ml-1 text-xl text-dark-grey"
              >
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

// ========================== EXPORT COMPONENT ========================== //
export default UserAuthForm;
