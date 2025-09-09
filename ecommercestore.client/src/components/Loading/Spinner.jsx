export default function Spinner({
    size = 20,
    thickness = 2,
    className = "",
    srText = "Đang tải...",
}) {
    const style = { width: size, height: size, borderWidth: thickness };
    return (
        <span
            role="status"
            aria-live="polite"
            className={`inline-block rounded-full border-current border-t-transparent animate-spin ${className}`}
            style={style}
        >
            <span className="sr-only">{srText}</span>
        </span>
    );
}
