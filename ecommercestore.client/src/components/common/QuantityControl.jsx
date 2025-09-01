import { useState } from 'react';

export default function QuantityControl({ initial = 1, onChange }) {
    const [qty, setQty] = useState(initial);

    const update = (val) => {
        const newVal = Math.max(0, val);
        setQty(newVal);
        onChange?.(newVal);
    };

    return (
        <div className="input-group quantity mx-auto" style={{ width: '100px' }}>
            <div className="input-group-prepend">
                <button
                    className="btn btn-sm btn-primary btn-minus"
                    onClick={() => update(qty - 1)}
                >
                    <i className="fa fa-minus"></i>
                </button>
            </div>
            <input
                type="text"
                className="form-control form-control-sm bg-secondary text-center"
                value={qty}
                readOnly
            />
            <div className="input-group-append">
                <button
                    className="btn btn-sm btn-primary btn-plus"
                    onClick={() => update(qty + 1)}
                >
                    <i className="fa fa-plus"></i>
                </button>
            </div>
        </div>
    );
}