// import { useState, useRef, useEffect } from "react";
// export let activeTabLineRef;
// export let activeTabRef;
// /*
//   Component này tạo thanh chuyển tab.
//   - routes: danh sách tên tab
//   - defaultActiveIndex: tab nào active lúc mới vào (mặc định là 0)
// */
// //children props đặc biệt dùng để truyền component con vào component cha
// const InPageNavigation = ({
//   routes,
//   defaultHidden = [],
//   defaultActiveIndex = 0,
//   children,
// }) => {
//   // Ref của cái thanh gạch dưới
//   activeTabLineRef = useRef();

//   // Ref của cái tab đang được chọn mặc định
//   activeTabRef = useRef();

//   // Lưu tab nào đang active để đổi màu chữ
//   let [InPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);
//   let [isResizeEventAdded, setIsResizeEventAdded] = useState(false);
//   let [width, setWidth] = useState(window.innerWidth);
//   // Hàm đổi tab:
//   // - btn: cái nút được bấm
//   // - i: index của nó
//   const changePageState = (btn, i) => {
//     let { offsetWidth, offsetLeft } = btn;

//     // Di chuyển thanh gạch dưới cho trùng với nút
//     activeTabLineRef.current.style.width = offsetWidth + "px";
//     activeTabLineRef.current.style.left = offsetLeft + "px";

//     // Đổi màu tab
//     setInPageNavIndex(i);
//   };

//   // Chạy 1 lần khi component mới load lên
//   // → đặt thanh gạch dưới đúng tab mặc định
//   useEffect(() => {
//     if (width > 766 && InPageNavIndex !== defaultActiveIndex) {
//       changePageState(activeTabRef.current, defaultActiveIndex);
//     }
//     if (!isResizeEventAdded) {
//       window.addEventListener("resize", () => {
//         if (isResizeEventAdded) {
//           setIsResizeEventAdded(true);
//         }
//         setWidth(window.innerWidth)
//       });
//     }
//   }, [width]);

//   return (
//     <>
//       <div className="relative mb-8 border-grey flex flex-nowrap overflow-x-auto">
//         {/* Render từng tab */}
//         {routes.map((route, i) => {
//           return (
//             <button
//               // Tab mặc định thì gán ref để useEffect còn biết nó
//               ref={i == defaultActiveIndex ? activeTabRef : null}
//               key={i}
//               // Tab đang active thì chữ đen, còn lại chữ xám
//               className={
//                 "p-4 px-5 capitalize " +
//                 (InPageNavIndex == i ? "text-black " : "text-dark-grey ") + // thêm dấu cách cuối
//                 (defaultHidden.includes(route) ? "md:hidden" : "")
//               }
//               // Khi bấm thì đổi tab + di chuyển thanh gạch dưới
//               onClick={(e) => {
//                 changePageState(e.target, i);
//               }}
//             >
//               {route}
//             </button>
//           );
//         })}

//         {/* Thanh gạch dưới */}
//         <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
//       </div>
//       {/* Nếu childen là mảng thì hiển thị chiếu chidren theo index children[0] hoặc[1] */}
//       {Array.isArray(children) ? children[InPageNavIndex] : children}
//     </>
//   );
// };

// export default InPageNavigation;



import { useState, useRef, useEffect } from "react";

const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {
  const activeTabRef = useRef(null);
  const underlineRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

  // Di chuyển underline
  const moveUnderline = (el) => {
    if (!el || !underlineRef.current) return;

    underlineRef.current.style.transform = `translateX(${el.offsetLeft}px)`;
    underlineRef.current.style.width = `${el.offsetWidth}px`;
  };

  // Init underline + resize
  useEffect(() => {
    const init = () => {
      if (activeTabRef.current) {
        moveUnderline(activeTabRef.current);
      }
    };

    init();

    window.addEventListener("resize", init);
    return () => window.removeEventListener("resize", init);
  }, []);

  return (
    <>
      <div className="relative mb-8 border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, i) => (
          <button
            key={route}
            ref={i === defaultActiveIndex ? activeTabRef : null}
            onClick={(e) => {
              moveUnderline(e.currentTarget);
              setActiveIndex(i);
            }}
            className={
              "p-4 px-5 capitalize transition-colors " +
              (activeIndex === i ? "text-black " : "text-dark-grey ") +
              (defaultHidden.includes(route) ? "md:hidden" : "")
            }
          >
            {route}
          </button>
        ))}

        <hr
          ref={underlineRef}
          className="absolute bottom-0 h-[2px] bg-black transition-all duration-300"
        />
      </div>

      {Array.isArray(children) ? children[activeIndex] : children}
    </>
  );
};

export default InPageNavigation;
