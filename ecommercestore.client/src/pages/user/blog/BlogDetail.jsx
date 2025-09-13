import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import blogService from "../../../services/blogService";

export default function BlogDetail() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await blogService.getOne(id);
                setBlog(data);
            } catch (err) {
                console.error("Lỗi fetch chi tiết blog:", err);
            }
        })();
    }, [id]);

    if (!blog) {
        return (
            <div className="container py-5 text-center">
                <p>Đang tải bài viết...</p>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <div className="container-fluid bg-secondary mb-5">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "300px" }}>
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">Blog</h1>
                    <div className="d-inline-flex">
                        <p className="m-0"><a href="/">Trang chủ</a></p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0"><a href="/bai-viet">Blog</a></p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">{blog.title}</p>
                    </div>
                </div>
            </div>

            <div className="container py-5 blog-detail">
                <h1 className="mb-3">{blog.title}</h1>
                <p className="text-muted mb-4">
                    Ngày đăng: {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                </p>
                {blog.thumbnail && (
                    <img
                        src={blog.thumbnail}
                        alt={blog.title}
                        className="img-fluid rounded mb-4"
                        style={{ maxHeight: "450px", objectFit: "cover", width: "100%" }}
                    />
                )}
                <div
                    className="blog-content mb-5"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />
                <button
                    className="btn btn-outline-primary"
                    onClick={() => window.history.back()}
                >
                    ← Quay lại
                </button>
            </div>
        </>
    );
}