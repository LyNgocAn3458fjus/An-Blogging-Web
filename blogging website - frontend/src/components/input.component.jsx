import { useState } from "react";

const InputBox = ({ name, type, placeholder, defaultValue, id, icon }) => {

    const [passWordVisible, setPassWordVisible] = useState(false);// dùng useState để quản lí trạng thái ẩn hiện

    return (
        <div className="relative w-[100%] mb-4">
            <input
                name={name}
                // nếu type là kiểu mật khẩu thì kiểm tra passWordVisible đúng thì là text còn sai thì là password, nếu ngày từ đầu không phải password thì dùng type gốc phái cuối
                type={type =="password" ? passWordVisible ? "text" : "password" : type}
                placeholder={placeholder}
                defaultValue={defaultValue}
                id={id}
                className="input-box"
            />
            <i className={"fi " + icon + " input-icon"}></i>
            {
                // !passWordVisible tức đang ở trạng thái true(mật khẩu đang bị ẩn) thì là icon ẩn còn không thì nó là icon hiện
                type == "password" ? <i className={"fi fi-rr-eye" +(!passWordVisible ? "-crossed":"" )+" input-icon left-[auto] right-4 cursor-pointer"} onClick={()=> setPassWordVisible(currentVal => !currentVal )}></i> : ""
            }
        </div>
    )

}
export default InputBox;
