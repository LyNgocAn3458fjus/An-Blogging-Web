import { useState, useRef, useEffect } from "react";

/*
  Component này tạo thanh chuyển tab.
  - routes: danh sách tên tab
  - defautActiveIndex: tab nào active lúc mới vào (mặc định là 0)
*/
//children props đặc biệt dùng để truyền component con vào component cha
const InPageNavigation = ({ routes, defaultHidden = [], defautActiveIndex = 0,children}) => {

    // Ref của cái thanh gạch dưới
    let activeTabLineRef = useRef();

    // Ref của cái tab đang được chọn mặc định
    let activeTabRef = useRef();

    // Lưu tab nào đang active để đổi màu chữ
    let [InPageNavIndex, setInPageNavIndex] = useState(defautActiveIndex);

    // Hàm đổi tab:
    // - btn: cái nút được bấm
    // - i: index của nó
    const changePageState = (btn, i) => {
        let { offsetWidth, offsetLeft } = btn;

        // Di chuyển thanh gạch dưới cho trùng với nút
        activeTabLineRef.current.style.width = offsetWidth + "px";
        activeTabLineRef.current.style.left = offsetLeft + "px";

        // Đổi màu tab
        setInPageNavIndex(i);
    };

    // Chạy 1 lần khi component mới load lên
    // → đặt thanh gạch dưới đúng tab mặc định
    useEffect(() => {
        changePageState(activeTabRef.current, defautActiveIndex);
    }, []);

    return (
        <>
            <div className="relative mb-8 bg-white border-grey flex flex-nowrap overflow-x-auto">

                {/* Render từng tab */}
                {routes.map((route, i) => {
                    return (
                        <button
                            // Tab mặc định thì gán ref để useEffect còn biết nó
                            ref={i == defautActiveIndex ? activeTabRef : null}

                            key={i}

                            // Tab đang active thì chữ đen, còn lại chữ xám
                            className={
                                "p-4 px-5 capitalize " +
                                (InPageNavIndex == i ? "text-black " : "text-dark-grey ") + // thêm dấu cách cuối
                                (defaultHidden.includes(route) ? "md:hidden" : "")
                            }

                            // Khi bấm thì đổi tab + di chuyển thanh gạch dưới
                            onClick={(e) => { changePageState(e.target, i) }}
                        >
                            {route}
                        </button>
                    );
                })}

                {/* Thanh gạch dưới */}
                <hr
                    ref={activeTabLineRef}
                    className="absolute bottom-0 duration-300"
                />

            </div>
            {/* Nếu childen là mảng thì hiển thị chiếu chidren theo index children[0] hoặc[1] */}
            {Array.isArray(children) ? children[InPageNavIndex]: children}
        </>
    );
};

export default InPageNavigation;
