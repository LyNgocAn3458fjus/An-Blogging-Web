// Hàm dùng để xử lý dữ liệu phân trang:
// - Gộp dữ liệu cũ + mới khi load thêm
// - Reset dữ liệu khi đổi filter
// - Lấy tổng số document (totalDocs) từ server

import axios from "axios";

export const filterPaginationData = async ({
  create_new_arr = false, // true khi đổi filter, false khi load thêm
  state,                  // state hiện tại (results, page, totalDocs)
  data,                   // dữ liệu mới lấy từ server
  page,                   // page hiện tại
  counteRoute,            // API đếm tổng số document
  data_to_send = {},      // data gửi lên API count
  user = undefined        // token đăng nhập (nếu có)
}) => {

  let obj; // object state mới trả về
  let headers = {};

  // Nếu có user → gắn JWT vào header
  if (user) {
    headers.headers = {
      Authorization: `Bearer ${user}`
    };
  }

  // ===============================
  // TRƯỜNG HỢP 1: LOAD THÊM DỮ LIỆU
  // ===============================
  if (state !== null && !create_new_arr) {

    obj = {
      ...state,                               // giữ nguyên state cũ
      results: [...state.results, ...data],   // gộp data cũ + mới
      page: page                              // cập nhật page hiện tại
    };

  } 
  // ===============================
  // TRƯỜNG HỢP 2: RESET (ĐỔI FILTER / LOAD LẦN ĐẦU)
  // ===============================
  else {

    try {
      // Gọi API để lấy tổng số document
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + counteRoute,
        data_to_send,
        headers
      )

      const { totalDocs } = response.data;

      // Tạo state mới hoàn toàn
      obj = {
        results: data,   // dữ liệu mới
        page: 1,         // reset về trang 1
        totalDocs        // tổng số document
      };

    } catch (err) {
      console.log(err);
    }
  }

  // Trả state mới cho component sử dụng
  return obj;
};
