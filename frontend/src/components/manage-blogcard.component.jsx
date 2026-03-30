import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const deleteBlog = (blog, access_token, target) => {
    let { index, blog_id, setStateFunc } = blog;
    target.setAttribute("disabled", true); //tắt nút xóa
    axios
        .post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/delete-blog`,
            { blog_id },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            },
        )
        .then(({ data }) => {
            target.removeAttribute("disabled");
            setStateFunc((preVal) => {
                let { deleteDocCount, totalDocs, results } = preVal;
                results.splice(index, 1);
                if (!deleteDocCount) {
                    deleteDocCount = 0;
                }
                // nếu trang hiện tại không còn blog nhưng toàn bộ hệ thông còn số tổng số blog > 0 thì loading lại
                if (!results.length && totalDocs - 1 > 0) {
                    return null;
                }
                return {
                    ...preVal,
                    totalDocs: totalDocs - 1,
                    deleteDocCount: deleteDocCount + 1,
                };
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

const BlogStats = ({ stats }) => {
    return (
        <div
            className="flex gap-4 bg-white rounded-xl shadow-sm px-4 py-3
                        max-lg:mb-6 max-lg:pb-6 max-lg:border-b border-grey"
        >
            {Object.keys(stats).map(
                (key, i) =>
                    !key.includes("parent") && (
                        <div
                            key={key}
                            className={`flex flex-col items-center w-full justify-center ${i !== 0 ? "border-l border-grey" : ""
                                }`}
                        >
                            <h1 className="text-2xl font-semibold mb-1">
                                {stats[key].toLocaleString()}
                            </h1>
                            <p className="text-xs uppercase tracking-wide text-dark-grey">
                                {key.split("_")?.[1] || key}
                            </p>
                        </div>
                    ),
            )}
        </div>
    );
};

export const ManagePublishedBlogCard = ({ blog }) => {
    let { banner, blog_id, title, publishedAt, activity } = blog;
    let {
        userAuth: { access_token },
    } = useContext(UserContext);
    let [showStat, setShowStat] = useState(false);

    return (
        <>
            <div
                className="flex flex-col gap-4 p-4 bg-white rounded-xl
                            shadow-sm hover:shadow-md transition text-dark" 
            >
                <div className="flex gap-4">
                    <img
                        src={banner}
                        className="max-md:hidden lg:hidden xl:block
                                   w-28 h-28 rounded-lg object-cover flex-none"
                    />

                    <div className="flex flex-col justify-between w-full">
                        <Link
                            to={`/blog/${blog_id}`}
                            className="text-lg font-semibold hover:text-blue-600 transition"
                        >
                            {title}
                        </Link>

                        <p className="text-sm text-dark-grey line-clamp-1">
                            Published on {getDay(publishedAt)}
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 text-sm">
                    <Link
                        to={`/editor/${blog_id}`}
                        className="underline hover:text-blue-600 transition"
                    >
                        Edit
                    </Link>

                    <button
                        onClick={() => setShowStat((v) => !v)}
                        className="underline lg:hidden hover:text-blue-600 transition"
                    >
                        {showStat ? "Hide stats" : "Stats"}
                    </button>

                    <button
                        onClick={(e) => {
                            deleteBlog(blog, access_token, e.target);
                        }}
                        className="underline text-red hover:text-red transition font-medium"
                    >
                        Delete
                    </button>
                </div>

                <div className="max-lg:hidden">
                    <BlogStats stats={activity} />
                </div>
            </div>

            {showStat && (
                <div className="lg:hidden mt-3">
                    <BlogStats stats={activity} />
                </div>
            )}
        </>
    );
};

export const ManageDraftBlogPost = ({ blog }) => {
    let { title, des, blog_id, index } = blog;
    let {
        userAuth: { access_token },
    } = useContext(UserContext);

    index++;
    return (
        <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
            <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">
                {index < 10 ? "0" + index : index}
            </h1>

            <div>
                <h1 className="flex gap-6 mb-3">{title}</h1>
                <p className="line-clamp-2 font-gelasio">
                    {des.length ? des : "No Description"}
                </p>
                <div className="flex gap-6 mt-3 ">
                    <Link
                        to={`/editor/${blog_id}`}
                        className="pr-4 py-2 underline hover:text-blue-600 transition"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={(e) => {
                            deleteBlog(blog, access_token, e.target);
                        }}
                        className="pr-4 py-2 underline text-red hover:text-red transition font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
