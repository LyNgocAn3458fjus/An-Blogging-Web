import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter} from "react-router-dom"
// công dụng của browserRouter là giúp reload lại trang web
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> //là component đặc biệt nghiêm ngặc phát hiện lõi tiềm ẩn, ảnh hướng đến useEffect vì khiến nó chạy 2 lần
    <BrowserRouter>
    <App />
    </BrowserRouter>
  // {/* </React.StrictMode>, */}
)