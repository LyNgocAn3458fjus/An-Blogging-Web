import { useContext, useState, useCallback } from "react";
import { BlogContext } from "../pages/blog.page";
import { UserContext } from "../App";
import { toast } from "react-hot-toast";
import CommentField from "./comment-field.component";
import { getDay } from "../common/date";
import axios from "axios";

/* ======================================================
   PURE HELPERS – KHÔNG SIDE EFFECT
====================================================== */

/** Lấy range replies con dựa trên childrenLevel */
const getChildRange = (list, index, level) => {
  let end = index + 1;
  while (list[end] && list[end].childrenLevel > level) end++;
  return { from: index + 1, to: end };
};

/** Đếm số reply trực tiếp (level + 1) đã load */
const countLoadedReplies = (list, index, level) => {
  let count = 0;
  let ptr = index + 1;
  while (list[ptr] && list[ptr].childrenLevel > level) {
    if (list[ptr].childrenLevel === level + 1) count++;
    ptr++;
  }
  return count;
};

const CommentCard = ({ index, leftVal, commentData }) => {
  /* ===================== DATA ===================== */
  const {
    commented_by: {
      personal_info: { fullname, username: commented_by_username, profile_img }
    },
    commentedAt,
    comment,
    _id,
    children = [],
    childrenLevel = 0
  } = commentData;

  const {
    blog: {
      comments: { results },
      activity,
      author: { personal_info: { username: blog_author } }
    },
    setBlog
  } = useContext(BlogContext);

  const { userAuth: { access_token, username } } = useContext(UserContext);

  /* ===================== STATE ===================== */
  const [isReplying, setReplying] = useState(false);
  const [isRepliesVisible, setRepliesVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  /* ======================================================
     HIDE REPLIES – UI ONLY
  ====================================================== */
  const hideReplies = useCallback(() => {
    setBlog(prev => {
      const list = [...prev.comments.results];
      const { from, to } = getChildRange(list, index, childrenLevel);
      list.splice(from, to - from);

      return {
        ...prev,
        comments: { ...prev.comments, results: list }
      };
    });
    setRepliesVisible(false);
  }, [index, childrenLevel, setBlog]);

  /* ======================================================
     LOAD REPLIES (FIRST + LOAD MORE)
  ====================================================== */
  const loadReplies = async () => {
    if (isLoading) return;

    const loaded = countLoadedReplies(results, index, childrenLevel);

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`,
        { _id, skip: loaded } // 🔥 MATCH SERVER
      );

      setBlog(prev => {
        const list = [...prev.comments.results];

        const withLevel = data.replies.map(r => ({
          ...r,
          childrenLevel: childrenLevel + 1
        }));

        list.splice(index + 1 + loaded, 0, ...withLevel);

        return {
          ...prev,
          comments: { ...prev.comments, results: list }
        };
      });

      setRepliesVisible(true);
    } catch {
      toast.error("Failed to load replies");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     DELETE COMMENT
  ====================================================== */
  const deleteComment = async () => {
    if (isDeleting) return;
    if (!window.confirm("Delete this comment?")) return;

    setDeleting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`,
        { _id },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      setBlog(prev => {
        const list = [...prev.comments.results];
        const { from, to } = getChildRange(list, index, childrenLevel);
        const deletedReplies = to - from;

        list.splice(from, deletedReplies);
        list.splice(index, 1);

        return {
          ...prev,
          comments: { ...prev.comments, results: list },
          activity: {
            ...prev.activity,
            total_comments:
              prev.activity.total_comments - (deletedReplies + 1),
            total_parent_comments:
              prev.activity.total_parent_comments -
              (childrenLevel === 0 ? 1 : 0)
          }
        };
      });

      toast.success("Comment deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ===================== DERIVED ===================== */
  const canDelete =
    username === commented_by_username ||
    username === blog_author;

  const loadedReplies = countLoadedReplies(
    results,
    index,
    childrenLevel
  );

  const remainingReplies = children.length - loadedReplies;

  /* ===================== RENDER ===================== */
  return (
    <div
      className="border-l-2 border-gray-100"
      style={{ paddingLeft: `${leftVal * 10}px` }}
    >
      <div className="flex gap-3 mb-3">
        <img src={profile_img} className="w-10 h-10 rounded-full" />

        <div className="flex-1">
          <div className="flex gap-2 text-sm text-dark-grey">
            <b className="text-black">{fullname}</b>
            @{commented_by_username}
            <span>{getDay(commentedAt)}</span>
          </div>

          <p className="text-black text-sm mt-1">{comment}</p>

          <div className="flex gap-4 mt-2 text-sm text-black">
            <button onClick={() => setReplying(v => !v)}>Reply</button>

            {canDelete && (
              <button
                onClick={deleteComment}
                disabled={isDeleting}
                className="text-rose-600 font-bold underline"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>

          {isReplying && (
            <CommentField
              action="Reply"
              index={index}
              replyingTo={_id}
              setReplying={setReplying}
            />
          )}
        </div>
      </div>

      {/* TOGGLE LOAD / HIDE */}
      {children.length > 0 && (
        <button
          onClick={isRepliesVisible ? hideReplies : loadReplies}
          disabled={isLoading}
          className="ml-12 text-sm text-dark-grey"
        >
          {isLoading
            ? "Loading…"
            : isRepliesVisible
            ? "Hide replies"
            : `${children.length} replies`}
        </button>
      )}

      {/* LOAD MORE */}
      {isRepliesVisible && remainingReplies > 0 && (
        <button
          onClick={loadReplies}
          disabled={isLoading}
          className="ml-12 mt-1 text-sm text-gray-500 hover:text-black"
        >
          {isLoading
            ? "Loading…"
            : `Load more replies (${remainingReplies})`}
        </button>
      )}
    </div>
  );
};

export default CommentCard;
