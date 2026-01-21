import { useContext, useState, useCallback } from "react";
import { BlogContext } from "../pages/blog.page";
import { UserContext } from "../App";
import { toast } from "react-hot-toast";
import CommentField from "./comment-field.component";
import { getDay } from "../common/date";
import axios from "axios";

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
    blog,
    blog: {
      comments: { results },
      activity,
      author: { personal_info: { username: blog_author } }
    },
    setBlog
  } = useContext(BlogContext);

  const { userAuth: { access_token, username } } = useContext(UserContext);

  /* ===================== LOCAL STATE ===================== */
  const [isReplying, setReplying] = useState(false);
  const [isReplyLoaded, setIsReplyLoaded] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ======================================================
     UI ONLY – HIDE REPLIES (NO COUNTER CHANGE)
  ====================================================== */
  const hideReplies = useCallback(() => {
    setBlog(prev => {
      const list = [...prev.comments.results];
      let ptr = index + 1;

      while (list[ptr] && list[ptr].childrenLevel > childrenLevel) {
        list.splice(ptr, 1);
      }

      return {
        ...prev,
        comments: { ...prev.comments, results: list }
      };
    });

    setIsReplyLoaded(false);
  }, [setBlog, index, childrenLevel]);

  /* ======================================================
     DELETE COMMENT – FULL LOGIC + COUNTERS
  ====================================================== */
  const deleteFromState = useCallback(() => {
    setBlog(prev => {
      const list = [...prev.comments.results];
      let deleteCount = 0;
      let ptr = index + 1;

      /* 1️⃣ Remove all child replies */
      while (list[ptr] && list[ptr].childrenLevel > childrenLevel) {
        list.splice(ptr, 1);
        deleteCount++;
      }

      /* 2️⃣ Remove the comment itself */
      list.splice(index, 1);
      deleteCount++;

      /* 3️⃣ Update parent.children if this is a reply */
      if (childrenLevel > 0) {
        const parentIndex = list.findIndex(c =>
          c.children?.includes(_id)
        );

        if (parentIndex !== -1) {
          list[parentIndex] = {
            ...list[parentIndex],
            children: list[parentIndex].children.filter(id => id !== _id)
          };
        }
      }

      return {
        ...prev,
        comments: { ...prev.comments, results: list },
        activity: {
          ...prev.activity,
          total_comments: prev.activity.total_comments - deleteCount,
          total_parent_comments:
            prev.activity.total_parent_comments -
            (childrenLevel === 0 ? 1 : 0)
        }
      };
    });
  }, [setBlog, index, childrenLevel, _id]);

  /* ======================================================
     LOAD REPLIES
  ====================================================== */
  const loadReplies = async () => {
    if (!children.length) return;

    if (isReplyLoaded) {
      hideReplies();
      return;
    }

    setIsLoadingReplies(true);

    try {
      const { data: { replies } } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`,
        { _id }
      );

      setBlog(prev => {
        const list = [...prev.comments.results];
        const withLevel = replies.map(r => ({
          ...r,
          childrenLevel: childrenLevel + 1
        }));

        list.splice(index + 1, 0, ...withLevel);

        return {
          ...prev,
          comments: { ...prev.comments, results: list }
        };
      });

      setIsReplyLoaded(true);
    } catch {
      toast.error("Failed to load replies");
    } finally {
      setIsLoadingReplies(false);
    }
  };

  /* ======================================================
     DELETE COMMENT (API)
  ====================================================== */
  const deleteComment = async () => {
    if (isDeleting) return;
    if (!window.confirm("Delete this comment?")) return;

    setIsDeleting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`,
        { _id },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      deleteFromState();
      toast.success("Comment deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ===================== RENDER ===================== */
  const canDelete =
    username === commented_by_username || username === blog_author;

  return (
    <div
      className="border-l-2 border-gray-100"
      style={{ paddingLeft: `${leftVal * 10}px` }}
    >
      <div className="flex gap-3 mb-3">
        <img
          src={profile_img}
          className="w-10 h-10 rounded-full"
          alt={fullname}
        />

        <div className="flex-1">
          <div className="flex gap-2 text-sm text-gray-500">
            <b className="text-gray-900">{fullname}</b>
            @{commented_by_username}
            <span>{getDay(commentedAt)}</span>
          </div>

          <p className="text-sm text-gray-700 mt-1">{comment}</p>

          <div className="flex gap-4 mt-2 text-sm">
            <button onClick={() => setReplying(v => !v)}>Reply</button>

            {canDelete && (
              <button
                onClick={deleteComment}
                disabled={isDeleting}
                className="text-red-500"
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

      {children.length > 0 && (
        <button
          onClick={loadReplies}
          disabled={isLoadingReplies}
          className="ml-12 text-sm text-gray-500"
        >
          {isLoadingReplies
            ? "Loading…"
            : isReplyLoaded
              ? "Hide replies"
              : `${children.length} replies`}
        </button>
      )}
    </div>
  );
};

export default CommentCard;
