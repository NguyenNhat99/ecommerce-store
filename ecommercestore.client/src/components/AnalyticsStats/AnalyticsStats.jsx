// src/components/AnalyticsStats/AnalyticsStats.jsx
import { Fragment, useMemo, useState } from "react";
import Card from "@/components/Card/Card";
import { CardBody, CardFooter, Col, ProgressBar, Row } from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import styles from "@/assets/scss/AnalyticsStats.module.scss";

const AnalyticsStats = ({
    title = "Analytics Stats",
    categories = [],   // mảng nhãn (dd/MM)
    series = [],       // [{ name, data }]
    kpis = [],         // [{label, percent}, {label, percent}]
}) => {
    const [close, setClose] = useState(false);

    // options cố định + nhận categories qua props
    const options = useMemo(() => ({
        chart: {
            type: "bar",
            height: 350,
            stacked: true,
            toolbar: { show: true },
            zoom: { enabled: true },
            animations: { enabled: false },      // giảm cảm giác "nháy"
        },
        responsive: [
            { breakpoint: 480, options: { legend: { position: "bottom", offsetX: -10, offsetY: 0 } } },
        ],
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 10,
                dataLabels: { total: { enabled: false, style: { fontSize: "13px", fontWeight: 900 } } },
            },
        },
        xaxis: { type: "category", categories: categories ?? [] },
        legend: { position: "top", offsetY: 20 },
        fill: { opacity: 1 },
        noData: { text: "Đang tải dữ liệu…" }, // khi chưa có series/categories
    }), [categories]);

    // series dùng trực tiếp từ props (không dùng state default)
    const chartSeries = useMemo(() => Array.isArray(series) ? series : [], [series]);

    const k0 = kpis?.[0] ?? { label: "KPI #1", percent: 0 };
    const k1 = kpis?.[1] ?? { label: "KPI #2", percent: 0 };

    // Option 2 (nếu vẫn muốn chắc chắn không render trước khi ready):
    const ready = (chartSeries.length > 0) && (options.xaxis.categories?.length > 0);

    // Optional: force remount khi dữ liệu đổi mạnh để tránh giữ lại state nội bộ của ApexCharts
    const chartKey = useMemo(() => JSON.stringify({
        c: options.xaxis.categories,
        s: chartSeries.map(s => ({ n: s.name, l: s.data?.length })),
    }), [options, chartSeries]);

    return (
        <Fragment>
            {!close ? (
                <Card
                    title={title}
                    icons={[
                        {
                            icon: "fa fa-cog", dropdown: [
                                { label: "Edit", icon: "fa fa-cog", method: () => { } },
                                { label: "Delete", icon: "fa-solid fa-trash", method: () => { } },
                                { label: "Update", icon: "fa-solid fa-recycle", method: () => { } },
                            ]
                        },
                        { icon: "fa fa-angle-down" },
                    ]}
                    dismissible={true}
                    onClose={() => setClose(!close)}
                >
                    <CardBody>
                        <div className="d-flex justify-content-center align-items-center overflow-hidden" style={{ minHeight: 320 }}>
                            {ready ? (
                                <ReactApexChart
                                    key={chartKey}
                                    options={options}
                                    series={chartSeries}
                                    type="bar"
                                    height={300}
                                    style={{ width: "100%" }}
                                />
                            ) : (
                                // có thể để trống, skeleton, hoặc rely on options.noData
                                <ReactApexChart options={options} series={[]} type="bar" height={300} style={{ width: "100%" }} />
                            )}
                        </div>
                    </CardBody>

                    <CardFooter className={styles.card_footer}>
                        <Row className="gy-5 gx-5">
                            <Col sm={12} md={6} className="col-md-4">
                                <div className={styles.analyticProgress}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className={styles.title}>{k0.label}</span>
                                        <div className={`${styles.stats} d-flex align-items-center justify-content-between`}>
                                            <span className={styles.icon}>
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5" stroke="#12B76A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                            <span className={styles.counter}>{`${k0.percent}%`}</span>
                                        </div>
                                    </div>
                                    <ProgressBar className={styles.progress} variant="primary" now={k0.percent} />
                                </div>
                            </Col>
                            <Col sm={12} md={6} className="col-md-4">
                                <div className={styles.analyticProgress}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className={styles.title}>{k1.label}</span>
                                        <div className={`${styles.stats} d-flex align-items-center justify-content-between`}>
                                            <span className={styles.icon}>
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5" stroke="#12B76A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                            <span className={styles.counter}>{`${k1.percent}%`}</span>
                                        </div>
                                    </div>
                                    <ProgressBar className={styles.progress} variant="primary" now={k1.percent} />
                                </div>
                            </Col>
                        </Row>
                    </CardFooter>
                </Card>
            ) : null}
        </Fragment>
    );
};

export default AnalyticsStats;
