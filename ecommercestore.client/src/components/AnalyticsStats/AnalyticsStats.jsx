import { Fragment, useState } from "react";
import Card from "@/components/Card/Card";
import { CardBody, CardFooter, Col, ProgressBar, Row } from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import styles from "@/assets/scss/AnalyticsStats.module.scss";

const AnalyticsStats = () => {
    const [close, setClose] = useState(false);
    const [state, setState] = useState({
        series: [
            {
                name: "NEW USERS",
                data: [13, 23, 20, 8, 13, 27],
            },
            {
                name: "PAGEVIEWS",
                data: [13, 23, 20, 8, 13, 27],
            },
        ],
        options: {
            chart: {
                type: "bar",
                height: 350,
                stacked: true,
                toolbar: {
                    show: true,
                },
                zoom: {
                    enabled: true,
                },
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: "bottom",
                            offsetX: -10,
                            offsetY: 0,
                        },
                    },
                },
            ],
            plotOptions: {
                bar: {
                    horizontal: false,
                    borderRadius: 10,
                    dataLabels: {
                        total: {
                            enabled: false,
                            style: {
                                fontSize: "13px",
                                fontWeight: 900,
                            },
                        },
                    },
                },
            },
            xaxis: {
                type: "datetime",
                categories: [
                    "01/01/2011 GMT",
                    "01/02/2011 GMT",
                    "01/03/2011 GMT",
                    "01/04/2011 GMT",
                    "01/05/2011 GMT",
                    "01/06/2011 GMT",
                ],
            },
            legend: {
                position: "top",
                offsetY: 20,
            },
            fill: {
                opacity: 1,
            },
        },
    });
    return (
        <Fragment>
            {!close ? (
                <Card
                    title="Analytics Stats"
                    icons={[
                        {
                            icon: "fa fa-cog",
                            dropdown: [
                                {
                                    label: "Edit",
                                    icon: "fa fa-cog",
                                    method: () => alert("Cog"),
                                },
                                {
                                    label: "Delete",
                                    icon: "fa-solid fa-trash",
                                    method: () => alert("Delete"),
                                },
                                {
                                    label: "Update",
                                    icon: "fa-solid fa-recycle",
                                    method: () => alert("Update"),
                                },
                            ],
                        },
                        { icon: "fa fa-angle-down" },
                    ]}
                    dismissible={true}
                    onClose={() => setClose(!close)}
                >
                    <CardBody>
                        <div className="d-flex justify-content-center align-items-center overflow-hidden">
                            <ReactApexChart
                                options={state.options}
                                series={state.series}
                                type="bar"
                                height={300}
                                style={{ width: "100%" }}
                            />
                        </div>
                    </CardBody>
                    <CardFooter className={styles.card_footer}>
                        <Row className="gy-5 gx-5">
                            <Col sm={12} md={6} className="col-md-4">
                                <div className={styles.analyticProgress}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className={styles.title}>
                                            NEW USERS
                                        </span>
                                        <div
                                            className={`${styles.stats} d-flex align-items-center justify-content-between`}
                                        >
                                            <span className={styles.icon}>
                                                <svg
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 10 10"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5"
                                                        stroke="#12B76A"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </span>
                                            <span className={styles.counter}>
                                                80%
                                            </span>
                                        </div>
                                    </div>
                                    <ProgressBar
                                        className={styles.progress}
                                        variant="primary"
                                        now={80}
                                    />
                                </div>
                            </Col>
                            <Col sm={12} md={6} className="col-md-4">
                                <div className={styles.analyticProgress}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className={styles.title}>
                                            PAGEVIEWS
                                        </span>
                                        <div
                                            className={`${styles.stats} d-flex align-items-center justify-content-between`}
                                        >
                                            <span className={styles.icon}>
                                                <svg
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 10 10"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5"
                                                        stroke="#12B76A"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </span>
                                            <span className={styles.counter}>
                                                60%
                                            </span>
                                        </div>
                                    </div>
                                    <ProgressBar
                                        className={styles.progress}
                                        variant="primary"
                                        now={60}
                                    />
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

