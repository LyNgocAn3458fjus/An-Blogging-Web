import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../App";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";

const Editor = () => {
    const [editorState, setEditorState] = useState("editor"); // trạng thái editor/publish

    // 🩹 Sửa nhẹ: thêm kiểm tra an toàn để tránh lỗi "undefined"
    const userContext = useContext(UserContext);
    const access_token = userContext?.userAuth?.access_token ?? null;

    return (
        access_token === null 
            ? <Navigate to="/signin" /> // chưa đăng nhập -> chuyển sang signin
            : editorState === "editor" 
                ? <BlogEditor/> // hiển thị editor
                : <PublishForm/> // hiển thị publish form
    );
}

export default Editor;
