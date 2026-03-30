import { useContext, useState } from "react";
import { UserContext } from "../App";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";
import { toast } from "react-hot-toast";

// nơi nhập cmt
const CommentField = ({ action, index = undefined, replyingTo = undefined, setReplying }) => {
  let {
    blog,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_comments, total_parent_comments }
    },
    setBlog,
    setTotalParentCommentsLoaded
  } = useContext(BlogContext);

  let {
    userAuth: { access_token, username, fullname, profile_img }
  } = useContext(UserContext);

  // 🔹 State lưu nội dung comment
  const [comment, setComment] = useState("");

  // ✅ THÊM STATE LOADING (KHÔNG ẢNH HƯỞNG LOGIC)
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      { _id, blog_author, comment, replying_to: replyingTo },
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    .then(({ data }) => {
      setIsSubmitting(false); // ✅ tắt loading
      setComment("");

      // 🔹 Gắn info user cho comment mới
      data.commented_by = {
        personal_info: { username, profile_img, fullname }
      };

      let newCommentArr;

      if (replyingTo) {
        commentsArr[index].children.push(data._id);
        data.childrenLevel = commentsArr[index].childrenLevel + 1;
        data.parentIndex = index;
        commentsArr[index].isReplyLoaded = true;
        commentsArr.splice(index + 1, 0, data);
        newCommentArr = commentsArr;
        setReplying(false);
      } else {
        data.childrenLevel = 0;
        newCommentArr = [data, ...commentsArr];
      }

      let parentCommentIncrementVal = replyingTo ? 0 : 1;

      setBlog({
        ...blog,
        comments: { ...comments, results: newCommentArr },
        activity: {
          ...activity,
          total_comments: total_comments + 1,
          total_parent_comments:
            total_parent_comments + parentCommentIncrementVal
        }
      });

      setTotalParentCommentsLoaded(
        preVal => preVal + parentCommentIncrementVal
      );
    })
    .catch(err => {
      setIsSubmitting(false); // ✅ đảm bảo không xoay vĩnh viễn
      console.log(err);
    });
  };

  return (
    <div className="space-y-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={
          action === "Reply" ? "Write a reply..." : "Write a comment..."
        }
        className="w-full p-4 border border-gray-200 rounded-xl resize-none
                   focus:outline-none focus:border-purple
                   focus:ring-2 focus:ring-purple/20 transition text-gray-500"
        rows={3}
      />

      <div className="flex gap-2 justify-end">
        {action === "Reply" && (
          <button
            onClick={() => setReplying(false)}
            className="px-4 py-2 text-black hover:text-text-white transition"
          >
            Cancel
          </button>
        )}

        <button
          onClick={handleComment}
          disabled={isSubmitting}
          className="px-6 py-2 bg-dark text-light rounded-full
                     hover:bg-gray-800 transition
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          {isSubmitting && (
            <i className="fi fi-rr-spinner animate-spin"></i>
          )}
          {action}
        </button>
      </div>
    </div>
  );
};

export default CommentField;
