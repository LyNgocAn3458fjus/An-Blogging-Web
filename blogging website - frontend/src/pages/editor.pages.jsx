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
    const [blog, setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState("editor");

    const access_token = useContext(UserContext)?.userAuth?.access_token ?? null;

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState }}>
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
