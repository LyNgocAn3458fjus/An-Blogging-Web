import { useContext, useState, createContext, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { UserContext } from "../App";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import Loader from "../components/loader.component";
import axios from "axios";

const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: '',
    author: { personal_info: {} }
};

export const EditorContext = createContext({});
const Editor = () => {
    let { blog_id } = useParams();
    // State chứa thông tin bài blog đang tạo
    const [blog, setBlog] = useState(blogStructure);

    // State để điều hướng giữa Editor và Publish Form
    // "editor" → trang soạn bài
    // "publish" → trang điền thông tin để đăng bài
    const [editorState, setEditorState] = useState("editor");

    // State kiểm tra xem text editor (quill/ckeditor...) đã load xong chưa
    const [textEditor, setTextEditor] = useState({ isReady: false })

    // Lấy access_token của người dùng từ UserContext
    // const access_token = useContext(UserContext)?.userAuth?.access_token ?? null;
    const { access_token, isAdmin } = useContext(UserContext)?.userAuth ?? {};

    //loading lại trang
    const [loading, setLoading] = useState(true);
    //kiểm tra blog trước khi chỉnh sửa
    useEffect(() => {
        if (!blog_id) {
            return setLoading(false)// không cần load dữ liệu blog
        }
        //nếu có blog_id thì axios get_blgo
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id, draft: true, mode: 'edit' })
            .then(({ data: { blog } }) => {
                setBlog(blog);
                setLoading(false);
            })
            .catch(err => {
                setBlog(blogStructure) // object an toàn
                setLoading(false)
            })

    }, [blog_id])
    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
            {/* nếu chưa access thì signin, rồi thì sang loader, loading và login xong thì sang editor */}
            {
                !isAdmin ? <Navigate to="/404"/> : 
                access_token === null ?
                <Navigate to="/signin" />
                : loading ? <Loader /> : editorState === "editor" ? (
                    <BlogEditor />
                ) : (
                    <PublishForm />
                )
            
            }
        </EditorContext.Provider>
    );
};

export default Editor;
