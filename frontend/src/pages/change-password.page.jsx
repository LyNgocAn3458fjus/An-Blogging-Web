import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { toast, Toaster } from "react-hot-toast";
import { useRef, useContext } from "react";
import { UserContext } from "../App";
import axios from "axios";

const ChangePassword = () => {
    let { userAuth: { access_token } } = useContext(UserContext);
    let ChangePasswordForm = useRef();

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const handleSubmit = (e) => {
        e.preventDefault();

        let form = new FormData(ChangePasswordForm.current);
        let formData = {};

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        let { currentPassword, newPassword } = formData;

        if (!currentPassword.length || !newPassword.length) {
            return toast.error("Fill all the input");
        }

        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            return toast.error("Password must be 6-20 chars, include 1 uppercase, 1 lowercase, 1 number");
        }

        e.target.setAttribute("disabled", true);
        let loadingToast = toast.loading("Updating...");

        axios.post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/change-password`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        )
            .then(() => {
                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                toast.success("Now, your password updated");
            })
            .catch(({ response }) => {
                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                toast.error(response.data.error);
            });
    };

    return (
        <AnimationWrapper>
            <Toaster />

            <form ref={ChangePasswordForm}>
                {/* Title */}
                <h1 className="max-md:hidden text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Change Password
                </h1>
                <div className="py-10 w-full md:max-w-[400px] space-y-4 text-dark">
                    <InputBox name="currentPassword" type="password" placeholder="Current Password" icon="fi-rr-unlock" className="profile-edit-input transition-all focus:ring-2 focus:ring-indigo-400 hover:border-indigo-400" />
                    <InputBox name="newPassword" type="password" placeholder="New Password" icon="fi-rr-unlock" className="profile-edit-input transition-all focus:ring-2 focus:ring-indigo-400 hover:border-indigo-400" />
                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="btn-dark px-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
                        Change Password
                    </button>
                </div>
            </form>
        </AnimationWrapper>
    );
};

export default ChangePassword;
