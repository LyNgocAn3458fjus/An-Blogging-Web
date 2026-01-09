import { useContext, useState } from "react";
import { BlogContext } from "../pages/blog.page";
import { UserContext } from "../App";
import { toast } from "react-hot-toast";
import CommentField from "./comment-field.component";
import { getDay } from "../common/date";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  const {
    blog,
    blog: {
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_parent_comments },
      author: { personal_info: { username: blog_author } }
    },
    setBlog,
    setTotalParentCommentsLoaded
  } = useContext(BlogContext);

  const { userAuth: { access_token, username } } = useContext(UserContext);

  const {
    commented_by: {
      personal_info: { fullname, username: commented_by_username, profile_img }
    },
    commentedAt,
    comment,
    _id,
    children
  } = commentData;

  const [isReplying, setReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("Please log in to reply");
    }
    setReplying(prev => !prev);
  };

  const handleDeleteComment = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`,
        { _id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      );

      // Remove comment from array
      commentsArr.splice(index, 1);

      // Update counts
      const parentCommentDecrement = commentData.childrenLevel === 0 ? 1 : 0;

      setBlog({
        ...blog,
        comments: { ...comments, results: commentsArr },
        activity: {
          ...activity,
          total_comments: activity.total_comments - 1,
          total_parent_comments: total_parent_comments - parentCommentDecrement
        }
      });

      setTotalParentCommentsLoaded(prev => prev - parentCommentDecrement);

      toast.success("Comment deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadReplies = async ({ skip = 0 }) => {
    if (children.length) {
      // Hide replies
      commentsArr[index].isReplyLoaded = false;
      setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
    } else {
      // Load replies from server
      try {
        const { data: { replies } } = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`,
          { _id, skip }
        );

        commentData.isReplyLoaded = true;

        replies.forEach((reply, i) => {
          reply.childrenLevel = commentData.childrenLevel + 1;
          commentsArr.splice(index + 1 + i + skip, 0, reply);
        });

        setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load replies");
      }
    }
  };

  return (
    <div className="border-l-2 border-gray-100" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="flex gap-3 mb-3">
        <img
          src={profile_img}
          alt={fullname}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-gray-900">{fullname}</p>
            <p className="text-sm text-gray-500">@{commented_by_username}</p>
            <p className="text-xs text-gray-400">{getDay(commentedAt)}</p>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{comment}</p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <button
              onClick={handleReplyClick}
              className="text-gray-500 hover:text-purple transition"
            >
              <i className="fi fi-rr-comment-dots mr-1"></i>
              Reply
            </button>

            {(username === commented_by_username || username === blog_author) && (
              <button
                onClick={handleDeleteComment}
                disabled={isDeleting}
                className="text-gray-500 hover:text-red transition disabled:opacity-50"
              >
                <i className="fi fi-rr-trash mr-1"></i>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>

          {/* Reply Field */}
          {isReplying && (
            <div className="mt-4">
              <CommentField
                action="Reply"
                index={index}
                replyingTo={_id}
                setReplying={setReplying}
              />
            </div>
          )}
        </div>
      </div>

      {/* Load Replies Button */}
      {children && children.length > 0 && (
        <button
          onClick={loadReplies}
          className="text-dark-grey hover:text-black text-sm font-medium flex items-center gap-2 ml-12 mt-2"
        >
          <i className={`fi fi-rr-arrow-small-${commentData.isReplyLoaded ? 'up' : 'down'}`}></i>
          {commentData.isReplyLoaded ? 'Hide' : 'View'} {children.length} {children.length > 1 ? 'Replies' : 'Reply'}
        </button>
      )}
    </div>
  );
};

export default CommentCard;
