import { useContext, useState } from "react";
import { BlogContext } from "../pages/blog.page";
import { UserContext } from "../App";
import { toast } from "react-hot-toast";
import CommentField from "./comment-field.component";
import { getDay } from "../common/date";
import axios from "axios";

// Component hiển thị 1 comment (cha hoặc con)
const CommentCard = ({ index, leftVal, commentData }) => {

  /* ===================== COMMENT DATA ===================== */
  let {
    commented_by: {
      personal_info: {
        fullname,
        username: commented_by_username,
        profile_img
      }
    },
    commentedAt,
    comment,
    _id,
    children
  } = commentData;
  /* ===================== BLOG CONTEXT ===================== */
  // let { blog,
  //   blog: { comments, activity: { total_parent_comments }, comments: { results: commentsArr }, author: { personal_info: { username: blog_author } } }, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext);

let {
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


  /* ===================== USER CONTEXT ===================== */
  let { userAuth: { access_token, username } } = useContext(UserContext);
  /* ===================== LOCAL STATE ===================== */
  const [isReplying, setReplying] = useState(false);
  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
        startingPoint--;
      }
    }
    catch {
      startingPoint = undefined;
    }
    return startingPoint;
  }

  /* ===================== REPLY ===================== */
  const removeCommentsCard = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
        commentsArr.splice(startingPoint, 1);
        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();
      if (parentIndex !== undefined) {
        commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child !== _id)
        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }
      commentsArr.splice(index, 1);
    }
    if (commentData.childrenLevel == 0 && isDelete) {
      setTotalParentCommentsLoaded(preVal => preVal - 1)
    }
    setBlog({
  ...blog,
  comments: { results: commentsArr },
  activity: {
    ...activity,
    total_comments: activity.total_comments - 1,
    total_parent_comments:
      total_parent_comments -
      (commentData.childrenLevel === 0 && isDelete ? 1 : 0)
  }
})

  }

  const loadReplies = ({ skip = 0 }) => {
    if (children.length) {
      hideReplies();
      axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`, { _id, skip })
        .then(({ data: { replies } }) => {
          commentData.isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = commentData.childrenLevel + 1;
            commentsArr.splice(index + 1 + i + skip, 0, replies[i])
          }
          setBlog({ ...blog, comments: { ...comments, results: commentsArr } })
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCard(index + 1)
  }


  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("Please log in to reply");
    }
    setReplying(preVal => !preVal);
  };

  const deleteComment = (e) => {
    e.target.setAttribute("disabled", true);
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment", { _id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentsCard(index + 1, true);// mới thêm vô có thể sai 
      })
      .catch(err => {
        console.log(err)
      })
  };
  /* ===================== RENDER ===================== */
  return (
    <div
      className="border-l-2 border-gray-100"
      style={{ paddingLeft: `${leftVal * 10}px` }}
    >
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

          <p className="text-gray-700 text-sm leading-relaxed">
            {comment}
          </p>

          {/* nút reply */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <button
              onClick={handleReplyClick}
              className="text-gray-500 hover:text-purple transition"
            >
              <i className="fi fi-rr-comment-dots mr-1"></i>
              Reply
            </button>

            {(username === commented_by_username ||
              username === blog_author) && (
                <button
                  onClick={deleteComment}
                  className="text-gray-500 hover:text-red transition"
                >
                  <i className="fi fi-rr-trash mr-1"></i>
                  Delete
                </button>
              )}
          </div>
          {/* nếu là reply thì bật chế độ reply */}
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

      {
        commentData.isReplyLoaded ?
          <button
            // Click để ẩn / hiện replies
            onClick={hideReplies}
            className="text-dark-grey hover:text-black text-sm font-medium flex items-center gap-2 ml-12 mt-2"
          >
            <i className="fi fi-rs-comment-dots"></i>Hide reply
          </button> : <button
            // Click để ẩn / hiện replies
            onClick={loadReplies}
            className="text-dark-grey hover:text-black text-sm font-medium flex items-center gap-2 ml-12 mt-2"
          >
            <i className="fi fi-rs-comment-dots"></i>{children.length} Reply
          </button>
      }

    </div>
  );
};

export default CommentCard;