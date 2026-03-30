import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useState, useContext } from "react";
import { UserContext } from "../App";
import NotificationCommentField from "./notification-comment-field.component";
import axios from "axios";

const NotificationCard = ({ data, index, notificationState }) => {
    let [isReplying, setReplying] = useState(false)

    let { seen,
        type,
        reply,
        createdAt,
        comment,
        replied_on_comment,
        user, user: { personal_info: { fullname, username, profile_img } },
        blog: { _id, blog_id, title },
        _id: notification_id
    } = data
    let { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;
    let { userAuth: { username: author_username, profile_img: author_profile_img, access_token } } = useContext(UserContext);
    const handleReplyClick = () => setReplying(preVal => !preVal)
    const handleDelete = (comment_id, type, target) => {
        target.setAttribute("disabled", true);
        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`, { _id: comment_id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(() => {
                if (type == 'comment') {
                    results.splice(index, 1);//splice(vị trí, số phần tử xóa) cắt,xóa 1 phần tử
                } else {
                    delete results[index].reply //Xóa thuộc tính reply khỏi object nằm ở vị trí index trong mảng results.   
                }
                target.removeAttribute("disabled");
                setNotifications({ ...notifications, results, totalDocs: totalDocs - 1, deleteDocCount: notifications.deleteDocCount + 1 })
            })
            .catch(err => {
                console.log(err);
            })
    }
    return (
        <div
            className={
                "p-6 border-b border-grey transition " +
                (!seen
                    ? "bg-grey border-l-4 border-black"
                    : "")
            }
        >

            <div className="flex gap-5">
                <img
                    src={profile_img}
                    className="w-14 h-14 rounded-full object-cover border border-grey shadow-sm"
                />

                <div className="flex-1">
                    <h1 className="text-lg text-dark-grey leading-snug">
                        <span className="font-medium lg:inline hidden capitalize">{fullname}</span>
                        <Link to={`/user/${username}`} className="mx-1 font-medium text-black hover:underline">
                            @{username}
                        </Link>
                        <span className="font-normal text-dark-grey">
                            {type === "like" ? " liked your blog" : type === "comment" ? " commented on" : " replied on"}
                        </span>
                    </h1>

                    {
                        type === "reply" ? (
                            <p className="mt-3 p-4 bg-grey/20 rounded-md text-dark-grey text-sm">
                                {replied_on_comment.comment}
                            </p>
                        ) : (
                            <Link
                                to={`/blogs/${blog_id}`}
                                className="block mt-2 font-medium underline line-clamp-1 hover:text-purple"
                            >
                                “{title}”
                            </Link>
                        )
                    }
                </div>
            </div>

            {
                type !== "like" && (
                    <p className="ml-14 pl-5 mt-4 font-gelasio text-xl text-dark-grey">
                        {comment.comment}
                    </p>
                )
            }

            <div className="ml-14 pl-5 mt-4 flex items-center gap-8 text-sm text-dark-grey">
                <p>{getDay(createdAt)}</p>

                {
                    type !== "like" && (
                        <>
                            {
                                !reply ? <button
                                    onClick={handleReplyClick}
                                    className="underline hover:text-purple transition"
                                >
                                    Reply
                                </button> : ""
                            }
                            <button onClick={(e) => handleDelete(comment._id, "comment", e.target)} className="underline hover:text-red transition">
                                Delete
                            </button>
                        </>
                    )
                }
            </div>

            {
                isReplying && (
                    <div className="ml-14 pl-5 mt-4">
                        <NotificationCommentField
                            _id={_id}
                            blog_author={user}
                            index={index} replyingTo={comment._id}
                            setReplying={setReplying} notification_id={notification_id}
                            notificationData={notificationState}
                        />
                    </div>
                )
            }

            {
                reply ?
                    <div className="ml-l p-5 mt-5 rounded-md bg-gray-100 border-gray-200">
                        <div className="flex gap-5 mb-3 ">
                            <img className="w-8 h-8 rounded-full" src={author_profile_img} />

                            <div>
                                <h1 className="font-medium text-xl text-dark-grey">
                                    <Link className="mx-1 text-black underline" to={`user/${author_username}`} >@{author_username}</Link>
                                    <span className="font-normal">replied to </span>
                                    <Link className="mx-1 text-black underline" to={`user/${username}`}>{username}</Link>
                                </h1>
                            </div>
                        </div>
                        <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>
                        <button onClick={(e) => handleDelete(comment._id, "reply", e.target)} className="ml-14 underline hover:text-red transition">Delete</button>
                    </div>
                    : ""
            }
        </div>
    )
}

export default NotificationCard
