//file hỗ trợ uploadImage, hảm tải hình ảnh uploadImage
import axios from "axios";
export const uploadImage = async (img) =>{
    let imgUrl = null;
    await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")//Gửi request GET tới server (ví dụ localhost:3000/get-upload-url) để lấy signed URL upload file từ Backblaze B2.
    .then(async ({data:{uploadURL}}) =>{
        await axios({
            method:"PUT",
            url:uploadURL,
            headers: { "Content-Type": img.type },
            data:img
        })
        .then(()=>{
            imgUrl = uploadURL.split("?")[0]//lấy đường dẫn trước dấu ? ,nếu 1 là phía sau
        })

    })
 
    return imgUrl
}   