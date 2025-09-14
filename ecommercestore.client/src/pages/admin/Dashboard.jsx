// src/pages/admin/Dashboard.jsx
import { Col, Container, Row, Card, Badge } from "react-bootstrap";
import { Bar, BarChart, Line, LineChart } from "recharts";
import StatsCard from "@/components/StatsCard/StatsCard";
import AnalyticsStats from "@/components/AnalyticsStats/AnalyticsStats";
import { ROUTERS } from "../../utils/router";
import authService from "../../services/authService";
import productService from "../../services/productService";
import orderService from "../../services/orderService";
import revenueService from "../../services/revenueService";
import { useCallback, useEffect, useState } from "react";

// ===== Helpers =====
const toVnd = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0));

function parseDateSafe(v) {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v) ? null : v;
    if (typeof v === "number") return new Date(v);
    if (typeof v === "string") {
        const s = v.trim();
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        const d2 = new Date(s);
        return isNaN(d2.getTime()) ? null : d2;
    }
    return null;
}

function ymd(d) {
    return d.toISOString().slice(0, 10);
}
function lastNLabels(n = 7) {
    const out = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        out.push(d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })); // dd/MM
    }
    return out;
}
const sum = (arr) => arr.reduce((s, n) => s + (Number(n) || 0), 0);

const PAYMENT_BADGE = {
    vnp: { text: "VNPAY", variant: "primary" },
    cod: { text: "COD", variant: "secondary" },
    paypal: { text: "PayPal", variant: "info" },
};

const Dashboard = () => {
    // KPI cards
    const [numberOfOrder, setNumberOfOrder] = useState(0);
    const [numberOfAccount, setNumberOfAccount] = useState(0);
    const [numberOfProduct, setNumberOfProduct] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    // Recent orders
    const [recentOrders, setRecentOrders] = useState([]);

    // Analytics
    const [anaCategories, setAnaCategories] = useState([]);
    const [anaSeries, setAnaSeries] = useState([]);
    const [anaKpis, setAnaKpis] = useState([]);

    // UI
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    // Tiny charts data (giữ mock để trang đẹp)
    const data1 = [
        { name: "A", uv: 2000 }, { name: "B", uv: 6000 }, { name: "C", uv: 4000 },
        { name: "D", uv: 8000 }, { name: "E", uv: 4000 }, { name: "F", uv: 6000 },
    ];
    const data2 = [
        { name: "A", pv: 400 }, { name: "B", pv: 25000 },
        { name: "C", pv: 10500 }, { name: "D", pv: 50000 },
    ];

    const fetchKpisAndRecent = useCallback(async () => {
        setErr("");
        setLoading(true);
        try {
            const [numberProduct, numberAccount, numberOrder, total, recent] = await Promise.all([
                productService.countProducts(),
                authService.countAccount(),
                orderService.countOrderPending(),
                revenueService.total(),
                orderService.recent(6),
            ]);
            setNumberOfProduct(numberProduct ?? 0);
            setNumberOfAccount(numberAccount ?? 0);
            setNumberOfOrder(numberOrder ?? 0);
            setTotalRevenue(total ?? 0);
            setRecentOrders(Array.isArray(recent) ? recent : []);
        } catch (e) {
            console.error(e);
            setErr(e?.response?.data?.message || e.message || "Không tải được dữ liệu dashboard");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAnalytics = useCallback(async () => {
        try {
            const end = new Date();
            const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
            const from = ymd(start), to = ymd(end);

            // Doanh thu theo ngày + summary trong 7 ngày
            const [revByDay, summary] = await Promise.all([
                revenueService.byDay(from, to),     // [{ day: 'yyyy-MM-dd', amount: number }]
                revenueService.summary(from, to),   // { totalRevenue, totalOrders, refunds, aov, ... }
            ]);

            const labels = lastNLabels(7);
            const mapRev = Object.create(null);
            (revByDay || []).forEach(r => {
                const d = parseDateSafe(r?.day);
                if (!d) return;
                const key = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
                mapRev[key] = (mapRev[key] || 0) + (Number(r.amount) || 0);
            });
            const revenueData = labels.map(l => mapRev[l] || 0);

            setAnaCategories(labels);
            setAnaSeries([{ name: "REVENUE (₫)", data: revenueData }]);

            const total7 = sum(revenueData);
            const refundRate = summary?.totalOrders > 0
                ? Math.round((summary.refunds / summary.totalOrders) * 100)
                : 0;

            setAnaKpis([
                { label: `Tổng doanh thu 7 ngày: ${toVnd(total7)} ₫`, percent: 100 }, // dùng progress như info line
                { label: "Tỉ lệ hoàn 7 ngày", percent: refundRate },
            ]);
        } catch (e) {
            console.error(e);
            // Không chặn toàn trang nếu analytics lỗi
        }
    }, []);

    useEffect(() => {
        fetchKpisAndRecent();
        fetchAnalytics();
    }, [fetchKpisAndRecent, fetchAnalytics]);

    return (
        <Container fluid className="p-0">
            {err && <div className="alert alert-danger py-2 mb-3">{err}</div>}
            {loading && <div className="alert alert-info py-2 mb-3">Đang tải dữ liệu…</div>}

            {/* ===== KPI Row ===== */}
            <Row className="gy-4 gx-4 mb-4">
                <Col sm={12} md={6} lg={3} xl={3}>
                    <StatsCard
                        bgColor="#5c6bc0"
                        counter={numberOfOrder}
                        isCounter={true}
                        title="Đơn hàng chờ xử lý"
                        icon="fa-solid fa-cart-shopping"
                        link={ROUTERS.ADMIN.ORDERS}
                    />
                </Col>

                <Col sm={12} md={6} lg={3} xl={3}>
                    <StatsCard
                        type="revenue-counter"
                        bgColor="#66bb6a"
                        symbolPosition="right"
                        counter={numberOfProduct}
                        isCounter={true}
                        title="Số lượng sản phẩm"
                        icon={
                            <BarChart width={100} height={80} data={data1}>
                                <Bar dataKey="uv" fill="#fff" />
                            </BarChart>
                        }
                        link={ROUTERS.ADMIN.PRODUCTS}
                    />
                </Col>

                <Col sm={12} md={6} lg={3} xl={3}>
                    <StatsCard
                        type="revenue-counter"
                        bgColor="#ffa726"
                        counter={numberOfAccount}
                        isCounter={true}
                        title="Tài khoản"
                        icon="fa-solid fa-user-group"
                        link={ROUTERS.ADMIN.USERS}
                    />
                </Col>

                {/* Doanh thu tổng từ API /revenue/total */}
                <Col sm={12} md={6} lg={3} xl={3}>
                    <StatsCard
                        type="revenue-counter"
                        bgColor="#42a5f5"
                        counter={totalRevenue}
                        isCounter={true}
                        title="Tổng doanh thu"
                        symbolPosition="left"
                        symbol="₫"
                        icon={
                            <LineChart width={100} height={67} data={data2}>
                                <Line type="monotone" dataKey="pv" stroke="#fff" strokeWidth={2} />
                            </LineChart>
                        }
                        link={ROUTERS.ADMIN.REVENUE}
                    />
                </Col>
            </Row>

            {/* ===== Recent Orders + Analytics ===== */}
            <Row className="gy-4 gx-4 mb-4">
                {/* Recent Orders */}
                <Col lg={6} xl={6}>
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <strong>Đơn hàng gần đây</strong>
                            <a href={ROUTERS.ADMIN.ORDERS} className="small text-decoration-none">Xem tất cả</a>
                        </Card.Header>
                        <Card.Body className="pt-2">
                            {recentOrders.length === 0 && <div className="text-muted">Chưa có đơn hàng.</div>}
                            <div className="d-flex flex-column gap-3">
                                {recentOrders.slice(0, 6).map((o) => {
                                    const pm = (o.paymentMethod || "").toLowerCase();
                                    const pay = PAYMENT_BADGE[pm] || { text: o.paymentMethod, variant: "secondary" };
                                    const d = parseDateSafe(o.date ?? o.orderDate ?? o.paymentDate ?? o.createdAt);
                                    const dateStr = d ? d.toLocaleDateString("vi-VN") : "—";
                                    const total = o.totalAmount ?? o.revenue ?? 0;
                                    const refunded = !!(o.refunded || (typeof o.paymentStatus === "string" && o.paymentStatus.toLowerCase() === "refunded"));

                                    return (
                                        <div key={o.id} className="d-flex justify-content-between align-items-start border rounded p-2">
                                            <div>
                                                <div className="fw-semibold">{o.id}</div>
                                                <div className="small text-muted">{dateStr}</div>
                                                {(o.items?.length > 0) && (
                                                    <div className="small text-muted">
                                                        {o.items.slice(0, 2).map((it, idx) => (
                                                            <span key={idx}>
                                                                {it.name}{idx === 0 && o.items.length > 1 ? ", " : ""}
                                                            </span>
                                                        ))}
                                                        {o.items.length > 2 && <em> ...</em>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-semibold">{toVnd(total)} ₫</div>
                                                <div className="mt-1">
                                                    <Badge bg={pay.variant} className="me-1">{pay.text}</Badge>
                                                    {refunded ? <Badge bg="danger">Refunded</Badge> : <Badge bg="success">Paid</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Analytics 7 ngày gần đây */}
                <Col lg={6} xl={6}>
                    <AnalyticsStats
                        title="Phân tích 7 ngày gần đây"
                        categories={anaCategories}
                        series={anaSeries}
                        kpis={anaKpis}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
