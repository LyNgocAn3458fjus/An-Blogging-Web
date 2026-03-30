import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import Loader from "../components/loader.component";

import { UserContext } from "../App";
import { profileDataStructure } from "./profile.page";
import { uploadImage } from "../common/cloudinary";
import { storeInSession } from "../common/session";

const BIO_LIMIT = 150;
const API = import.meta.env.VITE_SERVER_DOMAIN;

const EditProfile = () => {
    /* ================= CONTEXT ================= */
    const {
        userAuth,
        userAuth: { access_token },
        setUserAuth,
    } = useContext(UserContext);

    /* ================= REFS ================= */
    const profileImgRef = useRef(null);
    const formRef = useRef(null);

    /* ================= STATE ================= */
    const [profile, setProfile] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const [updatedProfileImg, setUpdatedProfileImg] = useState(null);
    const [charactersLeft, setCharactersLeft] = useState(BIO_LIMIT);

    /* ================= DERIVED ================= */
    const {
        personal_info: {
            fullname,
            username: profile_username,
            profile_img,
            email,
            bio,
        },
        social_links,
    } = profile;

    /* ================= EFFECT ================= */
    useEffect(() => {
        if (!access_token) return;

        axios
            .post(`${API}/get-profile`, { username: userAuth.username })
            .then(({ data }) => {
                setProfile(data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load profile");
                setLoading(false);
            });
    }, [access_token]);

    /* ================= HANDLERS ================= */
    const handleCharacterChange = (e) => {
        setCharactersLeft(BIO_LIMIT - e.target.value.length);
    };

    const handleImagePreview = (e) => {
        const img = e.target.files?.[0];
        if (!img) return;

        profileImgRef.current.src = URL.createObjectURL(img);
        setUpdatedProfileImg(img);
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!updatedProfileImg) return;

        const btn = e.currentTarget;
        const loadingToast = toast.loading("Updating avatar...");
        btn.setAttribute("disabled", true);

        try {
            const url = await uploadImage(updatedProfileImg);
            if (!url) throw new Error("Upload failed");

            const { data } = await axios.post(
                `${API}/update-profile-img`,
                { url },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );

            const newUserAuth = { ...userAuth, profile_img: data.profile_img };
            storeInSession("user", JSON.stringify(newUserAuth));
            setUserAuth(newUserAuth);
            setUpdatedProfileImg(null);

            toast.success("Avatar updated");
        } catch (err) {
            toast.error(err?.response?.data?.error || err.message);
        } finally {
            toast.dismiss(loadingToast);
            btn.removeAttribute("disabled");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = Object.fromEntries(new FormData(formRef.current));
        const { username, bio, youtube, facebook, twitter, github, instagram, website } = formData;

        if (username.length < 3)
            return toast.error("Username should be at least 3 letters long");

        if (bio.length > BIO_LIMIT)
            return toast.error(`Bio should not be more than ${BIO_LIMIT} characters`);

        const btn = e.currentTarget;
        const loadingToast = toast.loading("Updating profile...");
        btn.setAttribute("disabled", true);

        try {
            const { data } = await axios.post(
                `${API}/update-profile`,
                {
                    username,
                    bio,
                    social_links: { youtube, facebook, twitter, github, instagram, website },
                },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );

            if (userAuth.username !== data.username) {
                const newUserAuth = { ...userAuth, username: data.username };
                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);
            }

            toast.success("Profile updated successfully");
        } catch ({ response }) {
            toast.error(response?.data?.error || "Update failed");
        } finally {
            toast.dismiss(loadingToast);
            btn.removeAttribute("disabled");
        }
    };

    /* ================= RENDER ================= */
    if (loading) return <Loader />;

    return (
        <AnimationWrapper>
            <form ref={formRef} className="max-w-5xl mx-auto">
                <Toaster />

                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">Edit Profile</h1>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* ========== AVATAR ========== */}
                    <div className="flex flex-col items-center">
                        <label
                            htmlFor="uploadImg"
                            className="group relative w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-lg hover:shadow-2xl transition"
                        >
                            <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                <img
                                    ref={profileImgRef}
                                    src={profile_img}
                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white font-medium opacity-0 group-hover:opacity-100 transition">
                                Change Avatar
                            </div>
                        </label>

                        <input
                            id="uploadImg"
                            type="file"
                            accept=".jpeg,.png,.jpg"
                            hidden
                            onChange={handleImagePreview}
                        />

                        <button
                            onClick={handleImageUpload}
                            className="mt-6 px-8 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple- text-black font-medium shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition"
                        >
                            {updatedProfileImg ? "Save new avatar" : "Upload avatar"}
                        </button>
                    </div>

                    {/* ========== FORM ========== */}
                    <div className="flex-1 space-y-6 bg-bg-list p-5 rounded-md text-dark">
                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                            <h2 className="text-lg font-semibold text-indigo-600 mb-4">Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputBox name="fullname" type="text" defaultValue={fullname} disable icon="fi-rr-user" />
                                <InputBox name="email" type="email" defaultValue={email} disable icon="fi-rr-envelope" />
                            </div>

                            <InputBox name="username" type="text" defaultValue={profile_username} icon="fi-rr-at" />

                            <p className="text-sm text-gray-500 mt-1">
                                Username will be visible and used for search
                            </p>
                        </div>

                        {/* Bio */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                            <h2 className="text-lg font-semibold text-indigo-600 mb-4">Bio</h2>

                            <textarea
                                name="bio"
                                maxLength={BIO_LIMIT}
                                defaultValue={bio}
                                placeholder="Tell something about yourself"
                                className="input-box bg-gray-200 h-40 resize-none leading-7 pl-5 focus:ring-2 focus:ring-indigo-400 hover:border-indigo-300 transition"
                                onChange={handleCharacterChange}
                            />

                            <p className={`text-sm mt-1 ${charactersLeft < 20 ? "text-red-500" : "text-gray-400"}`}>
                                {charactersLeft} characters left
                            </p>
                        </div>

                        {/* Social */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                            <h2 className="text-lg font-semibold text-indigo-600 mb-4">Social links</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                {Object.keys(social_links).map((key) => (
                                    <InputBox
                                        key={key}
                                        name={key}
                                        type="text"
                                        defaultValue={social_links[key]}
                                        placeholder="https://"
                                        icon={key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="btn-dark px-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                        >
                            Update Profile
                        </button>
                    </div>
                </div>
            </form>
        </AnimationWrapper>
    );
};

export default EditProfile;
