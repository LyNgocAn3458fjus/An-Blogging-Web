const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// ` ` dấu này cho phép chèn biến hoặc biểu thức
//timestamp là định dạng thời danh
export const getDay =(timestamp) =>{
 let date = new Date(timestamp);
 return `${date.getDate()} ${months[date.getMonth()]}`
}