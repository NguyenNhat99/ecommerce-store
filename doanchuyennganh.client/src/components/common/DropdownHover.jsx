import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DropdownHover({ title, items }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="nav-item dropdown"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <Link className="nav-link dropdown-toggle" to="#" role="button">
                {title}
            </Link>
            {open && (
                <div className="dropdown-menu rounded-0 m-0 show">
                    {items.map((item, i) => (
                        <Link key={i} className="dropdown-item" to={item.to}>
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}