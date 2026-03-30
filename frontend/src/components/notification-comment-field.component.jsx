import { useContext, useState } from "react";
import { UserContext } from "../App";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";


const NotificationCommentField = ({ _id, blog_author, index = undefined, replyingTo = undefined, setReplying, notification_id, notificationData }) => {
  let [comment, setComment] = useState("");
  let { _id: user_id } = blog_author;
  let { userAuth: { access_token } } = useContext(UserContext);
  let { notifications, notifications: { results }, setNotifications } = notificationData;
  let [isSubmitting, setIsSubmitting] = useState(false);




  const handleComment = () => {
    if (!access_token) {
      return toast.error("Please log in to comment");
    }
    if (!comment.trim().length) {
      return toast.error("Write something to leave a comment");
    }

    if (isSubmitting) return; // ✅ chặn spam click
    setIsSubmitting(true);    // ✅ bật loading

    axios.post(
      `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
      { _id, blog_author: user_id, comment, replying_to: replyingTo, notification_id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    //cập nhật thêm reply
      .then(data => {
        setReplying(false);
        results[index].reply = { comment, _id: data._id }
        setNotifications({...notifications,results})
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a reply"
        className="w-full p-4 border border-gray-200 rounded-xl resize-none
                   focus:outline-none focus:border-purple
                   focus:ring-2 focus:ring-purple/20 transition"

      />
      <button
        onClick={handleComment}
        className="px-6 py-2 bg-black text-white rounded-full
                     hover:bg-gray-800 transition
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2">Reply</button>
    </>
  )
}
export default NotificationCommentField;