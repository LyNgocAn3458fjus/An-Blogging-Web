import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const Tag = ({ tag }) => {
    let { blog, blog: { tags }, setBlog } = useContext(EditorContext); // Lấy state và setState từ context
    //cách xóa một phân tử x1x`
    const handleTagDelete = () => {
        // Lọc bỏ tag đang click
        tags = tags.filter(t => t !== tag); //filter lọc các phần tử của màng theo điều kiện và trả về một mảng mới(trong tường hợp này nó lọc phần tử vừa click khỏi mảng tags)

        // Cập nhật lại state blog
        setBlog({ ...blog, tags });
    }
    const addEditable =(e)=>{
        e.target.setAttribute("contentEditable",true)// bật chết độ cho phép chỉnh sửa 
        e.target.focus();// đăt dấu nháu nháy vào ô để tiếp tục gõ
    }
    // cách edit một phần tử 
    const handleTagEdit =(e)=>{
        if(e.keyCode ==13 || e.keyCode == 188){
            e.preventDefault();
            let currentTag = e.target.innerText;//  nội dùng client nhập
            tags[tagIndex] = currentTag;//cập nhật nội dung client nhập vào tag tương ứng
            setBlog({...blog, tags});// cập nhật state  blog
            e.target.setAttribute("contentEditable",false);// tắt chế độ cho phép chỉnh sữa
        }
    }

    return (
        <div className="bg-dark-grey inline-flex w-fit items-center px-4 py-1 rounded-full">
            <p className=" text-white inline-block" onKeyDown={handleTagEdit} onClick={addEditable}>{tag}</p>
            <button
                onClick={handleTagDelete}
                className="ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-600"
            >
                <i className="fi fi-br-cross text-sm pointer-events-none"></i>
            </button>
        </div>
    )
}

export default Tag;
