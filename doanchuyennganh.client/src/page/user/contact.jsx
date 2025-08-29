export default function ContactPage() {
    return (
        <>
            {/* Page Header */}
            <div className="container-fluid bg-secondary mb-3" >
                <div
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: "300px" }}
                >
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">
                        Liên hệ
                    </h1>
                    <div className="d-inline-flex">
                        <p className="m-0">
                            <a href="/">Trang chủ</a>
                        </p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Liên hệ</p>
                    </div>
                </div>
            </div >

            <div className="container-fluid pt-5">
                <div className="text-center mb-4">
                    <h2 className="section-title px-5">
                        <span className="px-2">Liên hệ với chúng tôi</span>
                    </h2>
                </div>
                <div className="row px-xl-5">
                    {/* Form liên hệ */}
                    <div className="col-lg-7 mb-5">
                        <div className="contact-form">
                            <form id="contactForm">
                                <div className="control-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        placeholder="Họ và tên"
                                        required
                                    />
                                </div>
                                <div className="control-group mb-3">
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        placeholder="Email"
                                        required
                                    />
                                </div>
                                <div className="control-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="subject"
                                        placeholder="Chủ đề"
                                        required
                                    />
                                </div>
                                <div className="control-group mb-3">
                                    <textarea
                                        className="form-control"
                                        rows="6"
                                        id="message"
                                        placeholder="Nội dung tin nhắn"
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <button
                                        className="btn btn-primary py-2 px-4"
                                        type="submit"
                                    >
                                        Gửi tin nhắn
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div className="col-lg-5 mb-5">
                        <h5 className="font-weight-semi-bold mb-3">Thông tin liên hệ</h5>
                        <p>
                            Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi
                            qua thông tin dưới đây hoặc gửi tin nhắn trực tiếp.
                        </p>

                        <div className="d-flex flex-column mb-3">
                            <h5 className="font-weight-semi-bold mb-3">Cửa hàng 1</h5>
                            <p className="mb-2">
                                <i className="fa fa-map-marker-alt text-primary mr-3"></i>
                                123 Đường ABC, Hà Nội, Việt Nam
                            </p>
                            <p className="mb-2">
                                <i className="fa fa-envelope text-primary mr-3"></i>
                                info@example.com
                            </p>
                            <p className="mb-2">
                                <i className="fa fa-phone-alt text-primary mr-3"></i>
                                0123 456 789
                            </p>
                        </div>

                        <div className="d-flex flex-column">
                            <h5 className="font-weight-semi-bold mb-3">Cửa hàng 2</h5>
                            <p className="mb-2">
                                <i className="fa fa-map-marker-alt text-primary mr-3"></i>
                                456 Đường XYZ, TP. Hồ Chí Minh, Việt Nam
                            </p>
                            <p className="mb-2">
                                <i className="fa fa-envelope text-primary mr-3"></i>
                                support@example.com
                            </p>
                            <p className="mb-0">
                                <i className="fa fa-phone-alt text-primary mr-3"></i>
                                0987 654 321
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}