import axios from "axios"
import { BlogContext } from "../pages/blog.page"
import { useContext, useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { UserContext } from "../App"
import { Toaster, toast } from 'react-hot-toast'  // <-- import toast


const BlogInteraction = () => {

    let { blog,
        blog: {
            _id,
            title,
            blog_id,
            activity,
            activity: { total_likes, total_comments },
            author: { personal_info: { username: author_username } }

        }, setBlog, isLikeByUser, setLikeByUser, setCommentsWrapper
    } = useContext(BlogContext)

    let { userAuth: { username, access_token } } = useContext(UserContext);

    useEffect(() => {
        if (access_token) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user", { _id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data: { result } }) => {
                    //ép kiểu true or false
                    setLikeByUser(Boolean(result))
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }, [])


    // xử lí sự kiện like
    const handleLike = () => {
        //nếu đăng nhập
        if (access_token) {
            //toggle(chuyển qua 2 trạng thái) mỗi lần click
            setLikeByUser(preVal => !preVal);
            //nếu user chưa like thì cho phép tăng lại, nếu đã like thì cho phép giảm 1
            //đây là cấu trúc đặc biệt của toggle mong muốn chưa like bấm nút tặng like, và ngược lại 
            !isLikeByUser ? total_likes++ : total_likes--;
            //cập nhập total_likes
            setBlog({ ...blog, activity: { ...activity, total_likes } });
            //gọi hàm lấy dử liệu từ server
            //headers là phần xác thực người dùng bằng access_token(mã đăng nhập)
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", { _id, isLikeByUser }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data }) => {
                    console.log(data);
                })
                .catch(err => {
                    console.log(err);
                })

        } else {
            //chưa dăng nhập
            toast.error("Please log in to like this blog post")

        }
    }
    // on/off popup share(Fallback)
    const [showShare, setShowShare] = useState(false)
    //ref phát hiện khi click ngoài
    const shareRef = useRef(null)
    //encode URL & title để dùng trong link share (tránh lỗi ký tự)
    const blogUrl = encodeURIComponent(window.location.href)
    const blogTitle = encodeURIComponent(title)
    // đóng popup share khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (shareRef.current && !shareRef.current.contains(e.target)) {
                setShowShare(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleShareClick = async () => {

        // Web Share API: mở native share của trình duyệt (mobile/modern browser)
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: title,
                    url: window.location.href
                })
            } catch {
                toast.error("Share cancelled")
            }
        } else {
            // fallback: hiển thị popup share custom
            setShowShare(prev => !prev)
        }
    }
    // share Instagram: copy link + mở Instagram (workaround)
    const handleInstagramShare = async () => {
        try {
            // Clipboard API: copy link bài viết
            await navigator.clipboard.writeText(window.location.href)

            // Instagram không hỗ trợ share link trực tiếp từ web
            window.open("https://www.instagram.com/", "_blank")

            toast.success("I've copied the article link. Paste it into your bio or Instagram story!")
            setShowShare(false)
        } catch {
            toast.error("The link cannot be copied. Please copy it manually.")
        }
    }

    return (
        <>
            <Toaster />
            <hr className="border-gray-200 my-2" />

            <div className="flex items-center justify-between">

                <div className="flex items-center gap-6">
                    <button className={"group flex items-center gap-2 text-dark-grey hover:text-rose-700 transition" + (isLikeByUser ? "bg-red/20 text-red" : "bg-white")}
                        onClick={handleLike}>
                        <span className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 group-hover:bg-red-100 transition">
                            <i className={"fi " + (isLikeByUser ? "fi-sr-heart" : "fi-rr-heart") + " text-lg"}></i>
                        </span>
                        <span className="text-base font-medium">{total_likes}</span>
                    </button>

                    <button className="group flex items-center gap-2 text-dark-grey hover:text-blue-500 transition" onClick={() => { setCommentsWrapper(preVal => !preVal) }}>
                        <span className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition">
                            <i className="fi fi-rr-comment-dots text-lg"></i>
                        </span>
                        <span className="text-base font-medium">{total_comments}</span>
                    </button>
                </div>

                <div className="relative" ref={shareRef}>
                    <div className="flex items-center gap-3">
                        {username === author_username && (
                            <Link
                                to={`/editor/${blog_id}`}
                                className="text-sm underline hover:text-purple"
                            >
                                Edit
                            </Link>
                        )}

                        <button
                            onClick={handleShareClick}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
                        >
                            <i className="fi fi-rr-share-square text-lg"></i>
                        </button>
                    </div>

                    {showShare && (
                        <div className="absolute right-0 bottom-full mb-3 w-44 bg-white rounded-xl shadow-lg border p-2 z-50">

                            <a
                                onClick={() => setShowShare(false)}
                                href={`https://www.facebook.com/sharer/sharer.php?u=${blogUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <i className="fi fi-brands-facebook text-blue-600"></i>
                                <span>Facebook</span>
                            </a>

                            <a
                                onClick={() => setShowShare(false)}
                                href={`https://twitter.com/intent/tweet?text=${blogTitle}&url=${blogUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <i className="fi fi-brands-twitter text-sky-500"></i>
                                <span>Twitter</span>
                            </a>

                            <button
                                onClick={handleInstagramShare}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <i className="fi fi-brands-instagram text-pink-500"></i>
                                <span>Instagram</span>
                            </button>

                        </div>
                    )}
                </div>
            </div>

            <hr className="border-gray-200 my-2" />
        </>
    )
}

export default BlogInteraction
