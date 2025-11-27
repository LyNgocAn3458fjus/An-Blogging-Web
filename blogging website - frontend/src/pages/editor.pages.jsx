import { useContext, useState, createContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../App";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";

const blogStructure = {
    title: "",
    banner: "",
    content: [],
    tags: [],
    des: "",
    author: { personal_info: {} }
};

export const EditorContext = createContext({});

const Editor = () => {
    // State chứa thông tin bài blog đang tạo
    const [blog, setBlog] = useState(blogStructure);

    // State để điều hướng giữa Editor và Publish Form
    // "editor" → trang soạn bài
    // "publish" → trang điền thông tin để đăng bài
    const [editorState, setEditorState] = useState("editor");

    // State kiểm tra xem text editor (quill/ckeditor...) đã load xong chưa
    const [textEditor, setTextEditor] = useState({isReady: false})

    // Lấy access_token của người dùng từ UserContext
    const access_token = useContext(UserContext)?.userAuth?.access_token ?? null;

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor ,setTextEditor}}>
            {access_token === null ? ( 
                <Navigate to="/signin" />
            ) : editorState === "editor" ? (
                <BlogEditor />
            ) : (
                <PublishForm />
            )}
        </EditorContext.Provider>
    );
};

export default Editor;
