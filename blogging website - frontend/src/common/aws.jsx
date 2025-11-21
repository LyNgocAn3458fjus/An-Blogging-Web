import axios from "axios";

export const uploadImage = async (img) => {
    let imgUrl = null;
    try {
        // Lấy cấu hình upload từ backend (folder, timestamp, signature, cloudName, ...)
        const { data: { uploadConfig } } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url");

        // Tạo formData để gửi file lên Cloudinary
        const formData = new FormData();
        formData.append('file', img);               // file hình
        formData.append('folder', uploadConfig.folder);        // thư mục lưu trên Cloudinary
        formData.append('timestamp', uploadConfig.timestamp);  // thời gian ký upload
        formData.append('signature', uploadConfig.signature);  // chữ ký bảo mật
        formData.append('api_key', uploadConfig.apiKey);       // API key (có thể dư nếu dùng signed upload)
        formData.append('upload_preset', uploadConfig.upload_preset); // chỉ cần với unsigned upload

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${uploadConfig.cloudName}/image/upload`;

        // Upload file lên Cloudinary
        const res = await axios.post(cloudinaryUrl, formData);
        imgUrl = res.data.secure_url; // URL hình sau khi upload

        // Nếu có userId, gửi URL banner lên backend
        const userId = localStorage.getItem("userId");
        if(userId){
            await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-banner", {
                userId,
                bannerUrl: imgUrl
            });
        }

    } catch (err) {
        console.error("Upload failed:", err); // log lỗi nếu upload thất bại
    }
    return imgUrl; // trả về URL hình hoặc null nếu thất bại
};
