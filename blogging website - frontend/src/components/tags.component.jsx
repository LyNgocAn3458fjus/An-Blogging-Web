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

    return (
        <div className="bg-dark-grey inline-flex w-fit items-center px-4 py-1 rounded-full">
            <p className="inline-block" contentEditable="true">{tag}</p>
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
