import { Link } from "react-router-dom";
import PageNotFoundImage from "../imgs/400.png";
import Logo from "../imgs/logo.png"; // nếu bạn có logo, thay đường dẫn lại

const PageNotFound = () => {
    return (
        <section className="min-h-screen w-full flex flex-col items-center justify-between bg-gray-50 px-4 py-10">


            {/* Khu vực hình 404 */}
            <div className="flex flex-col items-center mt-10">
                <img
                    src={PageNotFoundImage}
                    alt="404 Not Found"
                    className="max-w-[250px] w-full drop-shadow-xl rounded-xl"
                />

                <h1 className="text-4xl font-bold text-gray-800 mt-6">
                    Oops! The page you're looking for doesn’t exist.
                </h1>

                <p className="text-gray-600 text-lg mt-2 max-w-[500px] text-center">
                    The link may have changed or the page may have been deleted.
                    Please return to the homepage to continue your experience.<Link className=" text-twitter font-medium underline " to="/">Home page</Link>

                </p>
            </div>

            {/* Logo + mô tả cuối màn hình */}
            <div className="flex flex-col items-center mb-6 opacity-80 mt-5">
                <img
                    src={Logo}
                    alt="Logo"
                    className="w-16 h-16 mb-2 object-contain"
                />

                <p className="text-gray-500 text-sm text-center max-w-[300px]">
                    A platform for sharing knowledge and connecting the programming community.
                </p>
            </div>


        </section>

    );
};

export default PageNotFound;
