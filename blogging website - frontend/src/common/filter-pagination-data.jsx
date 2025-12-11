// ➤ Hàm filterPaginationData dùng để gộp dữ liệu phân trang cũ + mới hoặc reset lại dữ liệu khi đổi bộ lọc, đồng thời lấy tổng số tài liệu (totalDocs) từ server.
import axios from "axios";

export const filterPaginationData = async ({ create_new_arr = false, state, data, page, counteRoute, data_to_send ={ }}) => {
    let obj;// là đổi tượng mới được tạo từ đổi tượng cũ state
    if (state !== null && !create_new_arr) {
        obj = { ...state, results: [...state.results, ...data], page: page }//coppy state cũ, giữ nguyên dữ liệu state cũ,nói thêm dữ liệu data 
        // mới ghi đèn page vào page
    }
    else {
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + counteRoute, data_to_send)
            .then(({ data: { totalDocs } }) => {
                obj = { results: data, page: 1, totalDocs }
            })
            .catch(err=>{
                console.log(err)
            })
    }
    return obj
}