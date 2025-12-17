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
import RainSplash from "../common/RainSplash";

const UserAuthForm = ({ type }) => {
  const authForm = useRef();
  // const {
  //   userAuth: { access_token },
  //   setUserAuth,
  // } = useContext(UserContext);
  //được thay thế bằng bản an toàn hơn


  const context = useContext(UserContext) || {};
  const access_token = context.userAuth?.access_token ?? null;
  const setUserAuth = context.setUserAuth ?? (() => { });




  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const serverRoute = type === "sign-in" ? "/signin" : "/signup";

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const form = new FormData(authForm.current);
    const formData = {};
    for (let [key, value] of form.entries()) formData[key] = value;

    const { fullname, email, password } = formData;

    if (fullname && fullname.length < 3)
      return toast.error("Full name must be at least 3 letters long");
    if (!email) return toast.error("Enter email");
    if (!emailRegex.test(email)) return toast.error("Email is invalid");
    if (!passwordRegex.test(password))
      return toast.error(
        "Password must be 6-20 chars, include uppercase, lowercase & number"
      );

    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        let serviceRoute = "/google-auth";
        let formData = {
          access_token: user.accesstoken,
        };
        userAuthThroughServer(serviceRoute, formData);
      })
      .catch((err) => {
        toast.error("Trouble logging in through Google");
        console.log(err);
      });
  };

  if (access_token) return <Navigate to="/" />;

  return (
    <AnimationWrapper keyValue={type}>
      <section className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
        <RainSplash  dropCount={40} groundHeight={60} />
        <Toaster />

        <form
          ref={authForm}
          id="formElement"
          className="relative z-10 w-[80%] max-w-[420px] p-8 rounded-xl backdrop-blur-lg shadow-lg border bg-gradient-blue-dark border-gray-200 animate-fadeIn"
        >
          <h1 className="text-4xl font-gelasio tracking-wide text-center mb-6 text-white">
            {type === "sign-in" ? "Hello, welcome back" : "Join our community"}
          </h1>

          {type !== "sign-in" && (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button
            className="w-full py-3 bg-black text-white rounded-lg mt-10 text-lg tracking-wide hover:bg-gray-900 transition shadow-md"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative flex items-center gap-2 my-8 text-gray-400 text-sm font-semibold uppercase">
            <hr className="w-1/2 border-gray-300" />
            <p>or</p>
            <hr className="w-1/2 border-gray-300" />
          </div>

          <button
            className="w-full flex items-center justify-center gap-4 py-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-400 transition shadow-sm"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} className="w-5" />
            Continue with Google
          </button>

          {type === "sign-in" ? (
            <p className="mt-6 text-center text-white">
              Don’t have an account?
              <Link to="/signup" className="underline ml-1 text-white">
                Join us
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-center text-white">
              Already a member?
              <Link to="/signin" className="underline ml-1 text-white">
                Sign in
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
