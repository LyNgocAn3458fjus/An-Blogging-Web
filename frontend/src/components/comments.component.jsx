import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";


/// Hàm lấy dữ liệu bình luận từ server
export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array = null }) => {
    let res; 
    await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get_blog_comments`, { blog_id, skip })
        .then(({ data }) => {
            data.map(comment => {
                comment.childrenLevel = 0;
            })
            setParentCommentCountFun(preVal => preVal + data.length);
            if (comment_array == null) {
                res = { results: data }; // kết quả chỉ gồm bình luận mới
            } else {
                // Nếu đã có bình luận cũ, nối thêm bình luận mới vào
                res = { results: [...comment_array, ...data] };
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res = { results: comment_array || [] };
        });

    return res;
}


const CommentsContainer = () => {
    //lấy các thành phần này từ BlogConText.provider
    let { blog, blog: { _id, title, comments: { results: commentsArr }, activity: { total_parent_comments } }, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded, setBlog } = useContext(BlogContext)
    //Tạo loadmore
    const LoadMoreComments = async () => {
        // gọi biến này chưa toàn bộ comment vưa lấy từ server
        let newcommentsArr = await fetchComments({ skip: totalParentCommentsLoaded, blog_id: _id, setParentCommentCountFun: setTotalParentCommentsLoaded, comment_array: commentsArr })
        // cập nhật thêm comments
        setBlog({ ...blog, comments: newcommentsArr })

    }
    return (
        <div className={`max-sm:w-full fixed ${commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"} duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-bg-soft shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden`}>
            <div className="relative">
                <h1 className="text-2xl text-blue-500 font-bold">Comments</h1>
                <p className="text-lg mt-2 w-[70%] text-black line-clamp-1">{title}</p>
            </div>
            <button onClick={() => setCommentsWrapper(preVal => !preVal)} className="absolute top-11 right-8 flex justify-center items-center w-12 h-12"><i className="fi fi-br-cross text-2xl mt-1"></i></button>
            <hr className="border-grey my-8 w-[120%] -ml-10" />
            <CommentField action="comment" />
            {
                commentsArr && commentsArr.length ?
                    commentsArr.map((comment, i) => {
                        return <AnimationWrapper key={i}>
                            <CommentCard
                                index={i}
                                leftVal={comment.childrenLevel * 4}
                                commentData={comment}
                            />

                        </AnimationWrapper>
                    })
                    : <NoDataMessage message="No Comments" />
            }


            {
                total_parent_comments > totalParentCommentsLoaded ?
                    <button className="text-black p-2 px-3 hover:font-bold rounded-md flex items-center gap-2" onClick={LoadMoreComments}>LoadMore</button> : ""
            }
        </div>

    )
}
export default CommentsContainer;