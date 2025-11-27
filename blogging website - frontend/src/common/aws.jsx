// src/common/imageUploader.js
import axios from "axios";

// Nén ảnh
export const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const maxWidth = 1024;
                let scale = img.width > maxWidth ? maxWidth / img.width : 1;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: "image/jpeg" }));
                }, "image/jpeg", 0.7);
            };
        };
    });
};

// Upload ảnh lên Cloudinary
export const uploadImage = async (file) => {
    try {
        const compressedFile = await compressImage(file);
        const { data: { uploadConfig } } = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/get-upload-url`);

        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("folder", uploadConfig.folder);
        formData.append("timestamp", uploadConfig.timestamp);
        formData.append("signature", uploadConfig.signature);
        formData.append("api_key", uploadConfig.apiKey);
        formData.append("upload_preset", uploadConfig.upload_preset);

        const res = await axios.post(`https://api.cloudinary.com/v1_1/${uploadConfig.cloudName}/image/upload`, formData);

        // Update banner backend nếu có userId
        const userId = localStorage.getItem("userId");
        if (userId) {
            await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/update-banner`, {
                userId,
                bannerUrl: res.data.secure_url
            });
        }

        return res.data.secure_url;
    } catch (err) {
        console.error("Upload failed:", err);
        return null;
    }
};
