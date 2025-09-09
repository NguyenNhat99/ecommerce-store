// PageMeta.jsx
const PageMeta = ({ title, description }) => (
    <>
        <title>{title}</title>
        {description ? (
            <meta name="description" content={description} />
        ) : null}
    </>
);

// AppWrapper không cần HelmetProvider nữa, chỉ passthrough:
export const AppWrapper = ({ children }) => <>{children}</>;

// export default
export default PageMeta;
