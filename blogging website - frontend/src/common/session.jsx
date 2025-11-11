//Dùng để thao tác với bộ nhớ tạm thường dùng trong đăng nhập và giỏ hàng

// Lưu dữ liệu vào sessionStorage
const storeInSession = (key, value) => {
  sessionStorage.setItem(key, value);
};

// Lấy dữ liệu từ sessionStorage
const lookInSession = (key) => {
  return sessionStorage.getItem(key);
};

// Xóa 1 mục theo key
const removeFromSession = (key) => {
  sessionStorage.removeItem(key);
};

// Xóa toàn bộ dữ liệu (ví dụ khi đăng xuất)
const logOutUser = () => {
  sessionStorage.clear();
};
export {storeInSession, lookInSession,removeFromSession, logOutUser}
