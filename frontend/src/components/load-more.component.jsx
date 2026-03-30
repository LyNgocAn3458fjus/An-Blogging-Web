const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam }) => {
    //nếu có dự liệu, và tổng số bài viết lớn hơn các bài đã hiển thị trên màng hình thì hiển thị nút
    if (state !== null && state.totalDocs > state.results.length) {
        return (
            <button onClick={() => fetchDataFun({ ...additionalParam, page: state.page + 1 })} className="text-dark-grey p-2 rounded-md flex items-center gap-2">
                Load More
            </button>

        )
    }
}
export default LoadMoreDataBtn