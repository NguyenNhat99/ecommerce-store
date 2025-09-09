import { useEffect } from "react";

export default function ToastMessage({ message, onClose }) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // tự ẩn sau 3s
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div
            className={`toast show position-fixed top-0 end-0 m-3 bg-${message.type === "success" ? "success" : "danger"
                } text-white`}
            role="alert"
            style={{ zIndex: 9999, minWidth: "250px" }}
        >
            <div className="d-flex justify-content-between align-items-center px-3 py-2">
                <span>{message.text}</span>
                {message.showGoCart && (
                    <a href="/gio-hang" className="btn btn-sm btn-light ms-2">
                        Xem giỏ
                    </a>
                )}
            </div>
        </div>
    );
}