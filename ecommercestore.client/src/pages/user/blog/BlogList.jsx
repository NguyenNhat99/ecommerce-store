import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import blogService from "../../../services/blogService";
import "./blog_style.css";

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const data = await blogService.getAllEnable();
                setBlogs(data);
                console.log(data)
            } catch (err) {
                console.error("Lỗi fetch blog:", err);
            }
        })();
    }, []);

    return (
        <>
            {/* Page Header */}
            <div className="container-fluid bg-secondary mb-5">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "300px" }}>
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">Blog</h1>
                    <div className="d-inline-flex">
                        <p className="m-0"><a href="/">Trang chủ</a></p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Blog</p>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                <div className="row">
                    {blogs.map((blog) => (
                        <div className="col-md-4 mb-4" key={blog.id}>
                            <div className="card h-100 shadow-sm border-0 blog-card">
                                {blog.thumbnail && (
                                    <img
                                        src={blog.thumbnail}
                                        className="card-img-top"
                                        alt={blog.title}
                                        style={{ height: "220px", objectFit: "cover" }}
                                    />
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title text-truncate">{blog.title}</h5>
                                    <p className="text-muted small mb-2">
                                        {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                    <p className="card-text text-muted flex-grow-1">
                                        {blog.content.replace(/<[^>]+>/g, "").slice(0, 100)}...
                                    </p>
                                    <Link
                                        to={`/chi-tiet-bai-viet/${blog.id}`}
                                        className="stretched-link text-primary font-weight-bold mt-2"
                                    >
                                        Đọc thêm →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}