import { useState, useContext, useEffect } from "react"
import { UserContext } from "../App";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";

const Notification = () => {
    let { userAuth: { access_token } } = useContext(UserContext)
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState(null)


    let filters = ['all', 'like', 'comment', 'reply'];
    const fetchNotification = ({ page, deletedDocCount = 0 }) => {
        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/notifications`, { page, filter, deletedDocCount }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            // phân trang cho thông báo
            .then(async ({ data: { notifications: data } }) => {
                let formatedData = await filterPaginationData({
                    state: notifications,
                    data, page,
                    counteRoute: "/all-notification-count",
                    data_to_send: { filter },
                    user: access_token
                })
                setNotifications(formatedData)
            })
            .catch(err => { console.log(err) })
    }
    useEffect(() => {
        if (access_token) {
            fetchNotification({ page: 1 })
        }
    }, [access_token, filter])
    const handleFilter = (e) => {
        let btn = e.target;
        setFilter(btn.innerHTML);// lấy nội dung bên trong button vừa chọn
        setNotifications(null)
    }
    return (
        <div>
            <h1 className="max-md:hidden text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Recent Notification</h1>
            <div className="flex gap-6 mx-8">
                {
                    filters.map((filterName, i) => {
                        return <button onClick={handleFilter} className={"py-2 text-light " + (filter === filterName ? "btn-dark bg-dark-grey/20" : "btn-light")} key={i}>{filterName}</button>
                    })
                }
            </div>
            {
                notifications == null ? <Loader /> :
                    <>
                        {
                            notifications.results.length ?
                                notifications.results.map((notification, i) => {
                                    return <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                                        <NotificationCard  data={notification} index={i} notificationState={{notifications,setNotifications}}/>
                                    </AnimationWrapper>
                                })
                                : <NoDataMessage message="Nothing available" />
                        }
                    </>
            }
        </div>

    )
}
export default Notification
