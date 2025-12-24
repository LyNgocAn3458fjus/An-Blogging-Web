import { BlogContext } from "../pages/blog.page"
import { useContext, useState, useRef, useEffect } from "react"

// Component xử lý tương tác với blog: like, comment, share
const BlogInteraction = () => {

    // Lấy dữ liệu blog từ context
    let {
        blog: {
            title,
            activity: { total_likes, total_comments }
        }
    } = useContext(BlogContext)

    // State điều khiển hiển thị dropdown share (desktop)
    const [showShare, setShowShare] = useState(false)

    // Ref dùng để detect click ngoài dropdown share
    const shareRef = useRef()

    // Encode URL & title để dùng cho link share
    const blogUrl = encodeURIComponent(window.location.href)
    const blogTitle = encodeURIComponent(title)

    // Đóng dropdown share khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (shareRef.current && !shareRef.current.contains(e.target)) {
                setShowShare(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Xử lý click nút share:
    // - Mobile: dùng Web Share API
    // - Desktop: hiển thị dropdown share
    const handleShareClick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: title,
                    url: window.location.href
                })
            } catch (err) {
                console.log("Share cancelled")
            }
        } else {
            setShowShare(prev => !prev)
        }
    }

    // Instagram (desktop):
    // - Copy link bài viết
    // - Mở Instagram để người dùng dán link
    const handleInstagramShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            window.open("https://www.instagram.com/", "_blank")
            alert("I've copied the article link. Paste it into your bio or Instagram story!")
            setShowShare(false)
        } catch {
            alert("The link cannot be copied. Please copy it manually.")
        }
    }

    return (
        <>
            <hr className="border-gray-200 my-8" />

            <div className="flex items-center justify-between">

                {/* Khu vực Like & Comment */}
                <div className="flex items-center gap-6">

                    {/* Like */}
                    <button className="group flex items-center gap-2 text-dark-grey hover:text-rose-700 transition">
                        <span className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 group-hover:bg-red-100 transition">
                            <i className="fi fi-rr-heart text-lg"></i>
                        </span>
                        <span className="text-base font-medium">{total_likes}</span>
                    </button>

                    {/* Comment */}
                    <button className="group flex items-center gap-2 text-dark-grey hover:text-blue-500 transition">
                        <span className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition">
                            <i className="fi fi-rr-comment-dots text-lg"></i>
                        </span>
                        <span className="text-base font-medium">{total_comments}</span>
                    </button>

                </div>

                {/* Khu vực Share */}
                <div className="relative" ref={shareRef}>

                    {/* Nút Share chính */}
                    <button
                        onClick={handleShareClick}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <i className="fi fi-rr-share-square text-lg"></i>
                    </button>

                    {/* Dropdown share (chỉ dùng cho desktop) */}
                    {showShare && (
                        <div className="absolute right-0 bottom-full mb-3 w-44 bg-white rounded-xl shadow-lg border p-2 z-50">

                            {/* Share Facebook */}
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

                            {/* Share Twitter */}
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

                            {/* Share Instagram */}
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
        </>
    )
}

export default BlogInteraction
