import { useEffect, useState } from 'react';

export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 100);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return visible && (
        <button
            className="btn btn-primary back-to-top"
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 99 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
            <i className="fa fa-angle-double-up"></i>
        </button>
    );
}