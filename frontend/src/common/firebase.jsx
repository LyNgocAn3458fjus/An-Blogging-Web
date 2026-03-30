// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZSyxMloyZCvaGjv639zQFg3W9QBAb78k",
  authDomain: "react-js-blog-website-946b4.firebaseapp.com",
  projectId: "react-js-blog-website-946b4",
  storageBucket: "react-js-blog-website-946b4.firebasestorage.app",
  messagingSenderId: "1092349921565",
  appId: "1:1092349921565:web:a91c1563b5d823017d39f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Google Auth tạo provider xác thực người dùng bằng dịch vụ xác thực của google
const provider = new GoogleAuthProvider(); // Tạo provider để đăng nhập bằng Google(tức dùng google để đăng nhập)
const auth = getAuth();                     // Lấy đối tượng auth của Firebase

export const authWithGoogle = async () => {        // Hàm async để đăng nhập Google
    let user = null;                        // Khởi tạo biến lưu thông tin user
    await signInWithPopup(auth, provider)   // Mở popup đăng nhập Google
        .then((result) => {                 
            user = result.user;             // Nếu thành công, gán thông tin user
        })
        .catch((err) => {                   
            console.log(err);               // Nếu thất bại, in lỗi ra console
        });
    return user;                             // Trả về user hoặc null
};
