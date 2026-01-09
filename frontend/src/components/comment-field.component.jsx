import { useContext, useState } from "react";
import { UserContext } from "../App";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";
import { toast } from "react-hot-toast";

const CommentField = ({ action, index, replyingTo, setReplying }) => {

  // 🔹 Lấy dữ liệu blog + hàm cập nhật từ BlogContext
  const {
    blog,
    blog: {
      _id, // id bài blog
      author: { _id: blog_author }, // id tác giả blog
      comments = { results: [] }, // ⚠️ default để tránh undefined
      activity,
      activity: { total_comments, total_parent_comments }
    },
    setBlog, // cập nhật blog state
    setTotalParentCommentsLoaded // cập nhật số comment cha đã load
  } = useContext(BlogContext);

  // 🔹 Đảm bảo commentsArr luôn là mảng
  const commentsArr = comments.results || [];

  // 🔹 Lấy thông tin user đăng nhập
  const {
    userAuth: { access_token, username, fullname, profile_img }
  } = useContext(UserContext);

  // 🔹 State lưu nội dung comment
  const [comment, setComment] = useState("");

  // 🔹 State loading khi đang gửi comment
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================= HANDLE SUBMIT COMMENT =================
  const handleComment = async () => {

    // ❌ Chưa đăng nhập
    if (!access_token) {
      return toast.error("Please log in to comment");
    }

    // ❌ Comment rỗng
    if (!comment.trim().length) {
      return toast.error("Write something to leave a comment");
    }

    setIsSubmitting(true);

    try {
      // 🔹 Gửi comment lên server
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`, {
        _id, // blog id
        blog_author,
        comment,
        replying_to: replyingTo // nếu là reply

      },
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      );

      // 🔹 Reset textarea
      setComment("");

      // 🔹 Gắn info user cho comment mới (update UI ngay)
      data.commented_by = {
        personal_info: { username, profile_img, fullname }
      };
      let newCommentArr;
      // 🔹 Level comment (0 = comment, 1 = reply)
      data.childrenLevel = replyingTo ? 1 : 0;



      if (replyingTo) {
        // 🔹 Nếu là reply → thêm vào comment cha
        commentsArr[index].children.push(data._id);
        data.parentIndex = index;

        commentsArr[index].isReplyLoaded = true;

        // 🔹 Chèn reply ngay sau comment cha
        commentsArr.splice(index + 1, 0, data);
        newCommentArr = [...commentsArr];

        setReplying(false);
      } else {
        // 🔹 Nếu là comment mới → thêm lên đầu
        newCommentArr = [data, ...commentsArr];
      }

      // 🔹 Chỉ tăng parent comment khi không phải reply
      const parentCommentIncrementVal = replyingTo ? 0 : 1;

      // 🔹 Cập nhật blog state
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

      // 🔹 Cập nhật số parent comment đã load
      setTotalParentCommentsLoaded(
        preVal => preVal + parentCommentIncrementVal
      );

      toast.success(replyingTo ? "Reply added" : "Comment added");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= UI =================
  return (
    <div className="space-y-3">

      {/* 🔹 Textarea nhập comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={
          action === "Reply" ? "Write a reply..." : "Write a comment..."
        }
        className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition"
        rows={3}
      />

      <div className="flex gap-2 justify-end">

        {/* 🔹 Nút cancel chỉ hiện khi reply */}
        {action === "Reply" && (
          <button
            onClick={() => setReplying(false)}
            className="px-4 py-2 text-gray-600 hover:text-black transition"
          >
            Cancel
          </button>
        )}

        {/* 🔹 Nút submit comment */}
        <button
          onClick={handleComment}
          disabled={isSubmitting}
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
