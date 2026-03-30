// import { useParams } from "react-router-dom";// hook dùng để lấy tham số động trong URL
// import InPageNavigation from "../components/inpage-navigation.component";
// import { useState } from "react";
// import Loader from "../components/loader.component"; // trang tải
// import AnimationWrapper from "../common/page-animation"; // giao diện card blog post
// import BlogPostCard from "../components/blog-post.component";
// import NoDataMessage from "../components/nodata.component"; // váo khi không có dữ liệu
// import LoadMoreDataBtn from "../components/load-more.component"; // nút load thêm dữ liệu
// import axios from "axios";
// import { filterPaginationData } from "../common/filter-pagination-data";//lọc dữ liệu phân trang 
// import { useEffect } from "react";
// import UserCard from "../components/usercard.component";



// const SearchPage = () => {

//     let { query } = useParams() // khai báo query là tham số động cần lấy trong URL 
//     let [blogs, setBlog] = useState(null)
//     let [users, setUsers] = useState(null)
//     const searchBlogs = ({ page = 1, create_new_arr = false }) => {
//         axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page })//query,page là body gửi lên server
//             .then(async ({ data }) => {
//                 // console.log(data.blogs);

//                 //hàm xử lí phân trang
//                 let formatedData = await filterPaginationData({
//                     state: blogs,
//                     data: data.blogs,
//                     page,
//                     counteRoute: "/search-blogs-count",//route để lấy tổng số lượng kết quả của search
//                     data_to_send: { query },//hổ trợ cho counteRoute biết là đếm số lượng cho kết quả nào
//                     create_new_arr//false gọp thêm dữ liệu phân trang vô hang, load more.True thì tạo mảng theo trang mới
//                 })
//                 // console.log(formatedData)
//                 setBlog(formatedData)
//             })
//             .catch(err => console.log(err));
//     }
//     //gửi yêu cấu lấy dữ liệu user lên server
//     const fetchUsers = () => {
//         axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })//aixos.post(URL of API, body gửi lên server)
//             .then(({ data: { users } }) => {
//                 setUsers(users)
//             })
//         // 2 code này giống nhau
//         // .then(response =>{
//         //     const users = response.data.users;
//         //     setUsers(users);
//         // })

//     }
//     //Kiểm tra, khi thây người dùng nhập query khác thì useEffect sẽ chạy lại function để có thể lấy đc kết quả mới theo query của người dùng. phân trang mới
//     useEffect(() => {
//         resetState();
//         searchBlogs({ page: 1, create_new_arr: true });
//         fetchUsers();
//     }, [query])
//     //xóa bõ dữ liệu tìm kiếm cũ tránh bị trộn dữ liệu 
//     const resetState = () => {
//         setBlog(null)// khi dữ liệu về null thì giao diện quay về trang <Loader/> 
//         setUsers(null)//load lại tìm kiếm để tránh bị cộng dồn dữ liệu
//     }

//     // giao diện userCard
//     const UserCardWrapper = () => {
//         console.log(users)
//         return (
//             <>
//                 {
//                     users == null ? <Loader />
//                         : users.length ? users.map((user, i) => {
//                             return <AnimationWrapper key={i} transition={{duration:1,delay:i*0.08}}>
//                                 <UserCard user={user}/>
//                             </AnimationWrapper>
//                         })
//                             : <NoDataMessage message="No user found" />
//                 }
//             </>
//         )
//     }
//     return (
//         <section className="h-cover flex justify-center gap-10">
//             <div className="w-full">
//                 <InPageNavigation routes={[`Search Results from ${query}`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]}>
//                     {/* nơi in danh sach cac blog */}
//                     <>
//                         {
//                             blogs == null ?
//                                 (<Loader />) :
//                                 (
//                                     blogs.results.length ?
//                                         blogs.results.map((blog, i) => {
//                                             return (
//                                                 <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
//                                                     <BlogPostCard content={blog} author={blog.author.personal_info} />
//                                                 </AnimationWrapper>
//                                             );

//                                         })
//                                         : <NoDataMessage message="No blog published" />
//                                 )
//                         }
//                         {/* tải thêm blog mới */}
//                         <LoadMoreDataBtn
//                             state={blogs}
//                             fetchDataFun={searchBlogs}
//                         />
//                     </>
//                     <UserCardWrapper/>
//                 </InPageNavigation>
//             </div>
//             <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
//             <h1 className="font-medium text-xl mb-8"><i className="fi fi-rr-user mt-1"></i>  User related to search</h1>
//             <UserCardWrapper/>
//             </div>

//         </section>
//     )
// }
// export default SearchPage;


import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";

const SearchPage = () => {
    const { query } = useParams();

    const [blogs, setBlogs] = useState(null);
    const [users, setUsers] = useState(null);

    // -------------------- SEARCH BLOGS --------------------
    const searchBlogs = ({ page = 1, create_new_arr = false }) => {
        axios
            .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
                query,
                page,
            })
            .then(async ({ data }) => {
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    counteRoute: "/search-blogs-count",
                    data_to_send: { query },
                    create_new_arr,
                });

                setBlogs(formattedData);
            })
            .catch(console.error);
    };

    // -------------------- SEARCH USERS --------------------
    const fetchUsers = () => {
        axios
            .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-users`, { query })
            .then(({ data: { users } }) => setUsers(users))
            .catch(console.error);
    };

    // -------------------- RESET --------------------
    const resetState = () => {
        setBlogs(null);
        setUsers(null);
    };

    // -------------------- EFFECT --------------------
    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, create_new_arr: true });
        fetchUsers();
    }, [query]);

    // -------------------- USER LIST --------------------
    const UserList = () => (
        <>
            {users === null ? (
                <Loader />
            ) : users.length ? (
                users.map((user, i) => (
                    <AnimationWrapper
                        key={i}
                        transition={{ duration: 1, delay: i * 0.08 }}
                    >
                        <UserCard user={user} />
                    </AnimationWrapper>
                ))
            ) : (
                <NoDataMessage message="No user found" />
            )}
        </>
    );

    return (
        <section className="h-cover flex justify-center gap-10">
            {/* MAIN CONTENT */}
            <div className="w-full">
                <InPageNavigation
                    routes={[`Search results for "${query}"`, "Accounts Matched"]}
                    defaultHidden={["Accounts Matched"]}
                >
                    {/* BLOGS TAB */}
                    <>
                        {blogs === null ? (
                            <Loader />
                        ) : blogs.results.length ? (
                            blogs.results.map((blog, i) => (
                                <AnimationWrapper
                                    key={i}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                >
                                    <BlogPostCard
                                        content={blog}
                                        author={blog.author.personal_info}
                                    />
                                </AnimationWrapper>
                            ))
                        ) : (
                            <NoDataMessage message="No blog found" />
                        )}

                        <LoadMoreDataBtn
                            state={blogs}
                            fetchDataFun={searchBlogs}
                        />
                    </>

                    {/* USERS TAB */}
                    <UserList />
                </InPageNavigation>
            </div>

            {/* RIGHT SIDEBAR (DESKTOP) */}
            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                <h1 className="font-medium text-xl mb-8">
                    <i className="fi fi-rr-user mt-1"></i> Users related to search
                </h1>
                <UserList />
            </div>
        </section>
    );
};

export default SearchPage;
