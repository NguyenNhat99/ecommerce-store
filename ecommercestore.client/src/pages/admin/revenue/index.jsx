// src/pages/admin/revenue/RevenueDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Container, Row, Col, Card, Button, ButtonGroup, Form,
    Badge, Table, ProgressBar, Alert, Spinner
} from "react-bootstrap";
import revenueService from "../../../services/revenueService";

// ========= HELPERS =========
const toVnd = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0)) + " ₫";

const daysBetween = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const arr = [];
    const oneDay = 24 * 60 * 60 * 1000;
    for (let t = start.getTime(); t <= end.getTime(); t += oneDay) {
        const d = new Date(t);
        arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
};

export default function RevenueDashboard() {
    // Filter state
    const todayIso = new Date().toISOString().slice(0, 10);
    const start30Iso = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const [dateFrom, setDateFrom] = useState(start30Iso);
    const [dateTo, setDateTo] = useState(todayIso);

    const setQuick = (type) => {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        if (type === "7d") {
            setDateFrom(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
            setDateTo(todayIso);
        } else if (type === "30d") {
            setDateFrom(start30Iso); setDateTo(todayIso);
        } else if (type === "qtd") {
            const qStartMonth = [0, 3, 6, 9][Math.floor(m / 3)];
            setDateFrom(new Date(y, qStartMonth, 1).toISOString().slice(0, 10));
            setDateTo(todayIso);
        } else if (type === "ytd") {
            setDateFrom(new Date(y, 0, 1).toISOString().slice(0, 10));
            setDateTo(todayIso);
        }
    };

    // ====== DATA FROM API ======
    const [summary, setSummary] = useState(null);             // { totalRevenue, totalOrders, refunds, refundAmount, vnpCount, codCount, aov }
    const [byDay, setByDay] = useState([]);                   // [{ day, amount }]
    const [topProducts, setTopProducts] = useState([]);       // [{ name, category, qty, revenue }]
    const [categoryRows, setCategoryRows] = useState([]);     // [{ category, revenue, pct }]
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        const run = async () => {
            setLoading(true);
            setError("");
            try {
                const [s, d, t, c] = await Promise.all([
                    revenueService.summary(dateFrom, dateTo),
                    revenueService.byDay(dateFrom, dateTo),
                    revenueService.topProducts(dateFrom, dateTo, 5),
                    revenueService.categoryRevenue(dateFrom, dateTo),
                ]);
                if (!mounted) return;
                setSummary(s);
                console.log(s);
                setByDay(d);
                console.log(d);
                setTopProducts(t);
                console.log(t);
                setCategoryRows(c);
                console.log(c);
            } catch {
                if (!mounted) return;
                setError("Không tải được dữ liệu từ máy chủ.");
                setSummary(null);
                setByDay([]);
                setTopProducts([]);
                setCategoryRows([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        run();
        return () => { mounted = false; };
    }, [dateFrom, dateTo]);

    // Tổng hợp cho Category
    const categoryRevenue = useMemo(() => {
        const total = categoryRows.reduce((s, r) => s + Number(r.revenue || 0), 0);
        return { total, rows: categoryRows };
    }, [categoryRows]);

    // ===== Chart scaffolding =====
    const chartData = byDay;
    const maxY = Math.max(1, ...chartData.map((d) => Number(d.amount || 0)));
    const svgWidth = Math.max(320, chartData.length * 32);
    const svgHeight = 180;
    const pad = 16;
    const points = chartData
        .map((d, i) => {
            const x = pad + (i * (svgWidth - pad * 2)) / Math.max(1, chartData.length - 1);
            const y = svgHeight - pad - ((Number(d.amount || 0) / maxY) * (svgHeight - pad * 2));
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <Container fluid className="py-3">
            {/* Header + Filters */}
            <Row className="mb-3">
                <Col>
                    <h4 className="mb-1">Quản lý doanh thu</h4>
                    <div className="text-muted">Báo cáo tổng quan theo thời gian</div>
                </Col>
            </Row>

            <Card className="mb-3">
                <Card.Body className="d-flex flex-wrap align-items-end gap-3">
                    <div>
                        <Form.Label className="mb-1">Từ ngày</Form.Label>
                        <Form.Control type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div>
                        <Form.Label className="mb-1">Đến ngày</Form.Label>
                        <Form.Control type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                    <div className="ms-auto">
                        <Form.Label className="mb-1 d-block">Khoảng nhanh</Form.Label>
                        <ButtonGroup>
                            <Button variant="outline-secondary" onClick={() => setQuick("7d")}>7 ngày</Button>
                            <Button variant="outline-secondary" onClick={() => setQuick("30d")}>30 ngày</Button>
                            <Button variant="outline-secondary" onClick={() => setQuick("qtd")}>Quý này</Button>
                            <Button variant="outline-secondary" onClick={() => setQuick("ytd")}>Năm nay</Button>
                        </ButtonGroup>
                    </div>
                </Card.Body>
            </Card>

            {error && (
                <Alert variant="warning" className="mb-3">
                    {error}
                </Alert>
            )}

            {/* KPI Cards */}
            <Row className="g-3">
                <Col md={6} lg={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="text-muted">Doanh thu</div>
                            <h4 className="mb-0">{toVnd(summary?.totalRevenue || 0)}</h4>
                            <div className="small text-muted mt-1">Đã lọc theo khoảng thời gian</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="text-muted">Đơn hàng</div>
                            <h4 className="mb-0">{summary?.totalOrders ?? 0}</h4>
                            <div className="small text-muted mt-1">Trung bình: {toVnd(summary?.aov || 0)}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="text-muted">Hoàn tiền</div>
                            <h4 className="mb-0">
                                {summary?.refunds ?? 0} <Badge bg="secondary" className="ms-2">{toVnd(summary?.refundAmount || 0)}</Badge>
                            </h4>
                            <div className="small text-muted mt-1">Số đơn hoàn và giá trị</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="text-muted">Phương thức</div>
                            <div className="d-flex gap-3">
                                <div><Badge bg="light" text="dark">VNPay</Badge> <b>{summary?.vnpCount ?? 0}</b></div>
                                <div><Badge bg="light" text="dark">COD</Badge> <b>{summary?.codCount ?? 0}</b></div>
                            </div>
                            <div className="small text-muted mt-1">Số đơn theo phương thức</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Chart + Category + Payment */}
            <Row className="g-3 mt-1">
                <Col lg={8}>
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <strong>Doanh thu theo ngày</strong>
                            {loading && <span className="small text-muted d-inline-flex align-items-center"><Spinner size="sm" className="me-2" />đang tải…</span>}
                        </Card.Header>
                        <Card.Body>
                            {chartData.length === 0 ? (
                                <div className="text-muted">Không có dữ liệu trong khoảng đã chọn</div>
                            ) : (
                                <div className="w-100 overflow-auto">
                                    <svg width={svgWidth} height={svgHeight} style={{ display: "block" }}>
                                        {/* Axes */}
                                        <line x1={pad} y1={svgHeight - pad} x2={svgWidth - pad} y2={svgHeight - pad} stroke="#ddd" />
                                        <line x1={pad} y1={pad} x2={pad} y2={svgHeight - pad} stroke="#ddd" />
                                        {/* Area fill */}
                                        <polyline
                                            fill="rgba(13,110,253,0.12)"
                                            stroke="none"
                                            points={`${pad},${svgHeight - pad} ${points} ${svgWidth - pad},${svgHeight - pad}`}
                                        />
                                        {/* Line */}
                                        <polyline
                                            fill="none"
                                            stroke="#0d6efd"
                                            strokeWidth="2"
                                            points={points}
                                        />
                                        {/* Dots */}
                                        {chartData.map((d, i) => {
                                            const x = pad + (i * (svgWidth - pad * 2)) / Math.max(1, chartData.length - 1);
                                            const y = svgHeight - pad - (Number(d.amount || 0) / maxY) * (svgHeight - pad * 2);
                                            return <circle key={i} cx={x} cy={y} r="3" fill="#0d6efd" />;
                                        })}
                                    </svg>
                                    <div className="d-flex justify-content-between small text-muted mt-1">
                                        <div>{chartData[0]?.day}</div>
                                        <div>{chartData[chartData.length - 1]?.day}</div>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="mb-3">
                        <Card.Header><strong>Doanh thu theo danh mục</strong></Card.Header>
                        <Card.Body>
                            {categoryRevenue.rows.length === 0 ? (
                                <div className="text-muted">Chưa có dữ liệu</div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {categoryRevenue.rows.map((r) => (
                                        <div key={r.category}>
                                            <div className="d-flex justify-content-between">
                                                <div>{r.category}</div>
                                                <div className="text-muted small">{toVnd(r.revenue)}</div>
                                            </div>
                                            <ProgressBar now={r.pct} label={`${Number(r.pct).toFixed(0)}%`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header><strong>Phương thức thanh toán</strong></Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <div><Badge bg="primary">VNPay</Badge></div>
                                <div><b>{summary?.vnpCount ?? 0}</b> đơn</div>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div><Badge bg="secondary">COD</Badge></div>
                                <div><b>{summary?.codCount ?? 0}</b> đơn</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Top products */}
            <Row className="g-3 mt-1">
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <strong>Top sản phẩm</strong>
                            {loading && <span className="small text-muted d-inline-flex align-items-center"><Spinner size="sm" className="me-2" />đang tải…</span>}
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Sản phẩm</th>
                                        <th>Danh mục</th>
                                        <th className="text-center">Số lượng</th>
                                        <th className="text-end">Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((p, idx) => (
                                        <tr key={p.name + idx}>
                                            <td>{idx + 1}</td>
                                            <td>{p.name}</td>
                                            <td>{p.category || "-"}</td>
                                            <td className="text-center">{p.qty}</td>
                                            <td className="text-end">{toVnd(p.revenue)}</td>
                                        </tr>
                                    ))}
                                    {topProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted">Chưa có dữ liệu</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
