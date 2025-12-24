// Import các plugin (tools) của EditorJS
import Embed from "@editorjs/embed";         // Dùng để nhúng video, tweet, link...
import List from "@editorjs/list";           // Dùng để tạo danh sách (bullet hoặc numbered)
import Image from "@editorjs/image";         // Dùng để chèn / upload hình ảnh
import Header from "@editorjs/header";       // Dùng để tạo tiêu đề (H1–H6)
import Quote from "@editorjs/quote";         // Dùng để tạo block trích dẫn
import Marker from "@editorjs/marker";       // Dùng để highlight chữ
import InlineCode from "@editorjs/inline-code"; // Dùng để tạo inline code (ký tự code trong dòng)
import { uploadImage } from "../common/aws";


const uploadImageByURL = async (e) => {
    let link = new Promise((resolve, reject) => {
        try {
            resolve(e)
        }
        catch {
            reject(err)
        }
    })
    const url = await link;
    return {
        success: 1,
        file: { url }
    };
}
const uploadImageByFile = async (e) => {
    const url = await uploadImage(e);
    if (url) {
        return {
            success: 1,
            file: { url }
        };
    }
}
// Đây là object chứa danh sách tất cả các công cụ bạn muốn bật trong EditorJS
export const tools = {
    embed: Embed,        // Cho phép dùng block Embed
    list: {
        class: List,
        inlineToolbar: true//bât toolbar khi chọn văn bản
    },       // Cho phép tạo danh sách
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByURL,
                uploadByFile: uploadImageByFile,
            }
        }
    },        // Cho phép upload / chèn ảnh
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading...",
            levels: [2, 3],
            defaultLevel: 2

        }
    },      // Cho phép tạo tiêu đề
    quote: {
        class: Quote,
        inlineToolbar: true
    },        // Cho phép tạo block quote
    marker: Marker,      // Cho phép highlight chữ
    inlineCode: InlineCode // Cho phép viết code inline
};

// Object này sẽ được truyền vào EditorJS khi bạn init, ví dụ:
// new EditorJS({ holder: "editorjs", tools: tools })
