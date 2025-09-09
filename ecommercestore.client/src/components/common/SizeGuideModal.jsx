export default function SizeGuideModal({ type, onClose }) {
    const renderTable = () => {
        switch (type) {
            case "Áo":
                return (
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Ngực (cm)</th>
                                <th>Eo (cm)</th>
                                <th>Dài áo (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>S</td><td>84-88</td><td>68-72</td><td>60</td></tr>
                            <tr><td>M</td><td>88-92</td><td>72-76</td><td>62</td></tr>
                            <tr><td>L</td><td>92-96</td><td>76-80</td><td>64</td></tr>
                            <tr><td>XL</td><td>96-100</td><td>80-84</td><td>66</td></tr>
                        </tbody>
                    </table>
                );

            case "Quần":
                return (
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Eo (cm)</th>
                                <th>Mông (cm)</th>
                                <th>Dài quần (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>S</td><td>68-72</td><td>88-92</td><td>95</td></tr>
                            <tr><td>M</td><td>72-76</td><td>92-96</td><td>97</td></tr>
                            <tr><td>L</td><td>76-80</td><td>96-100</td><td>99</td></tr>
                            <tr><td>XL</td><td>80-84</td><td>100-104</td><td>101</td></tr>
                        </tbody>
                    </table>
                );

            case "Đầm váy":
                return (
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Ngực (cm)</th>
                                <th>Eo (cm)</th>
                                <th>Mông (cm)</th>
                                <th>Dài váy (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>S</td><td>84-88</td><td>66-70</td><td>90-94</td><td>95</td></tr>
                            <tr><td>M</td><td>88-92</td><td>70-74</td><td>94-98</td><td>97</td></tr>
                            <tr><td>L</td><td>92-96</td><td>74-78</td><td>98-102</td><td>99</td></tr>
                            <tr><td>XL</td><td>96-100</td><td>78-82</td><td>102-106</td><td>101</td></tr>
                        </tbody>
                    </table>
                );

            case "Giày":
                return (
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Size VN</th>
                                <th>Size US</th>
                                <th>Size EU</th>
                                <th>Chiều dài bàn chân (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>38</td><td>6</td><td>39</td><td>24</td></tr>
                            <tr><td>39</td><td>7</td><td>40</td><td>25</td></tr>
                            <tr><td>40</td><td>8</td><td>41</td><td>25.5</td></tr>
                            <tr><td>41</td><td>9</td><td>42</td><td>26</td></tr>
                            <tr><td>42</td><td>10</td><td>43</td><td>27</td></tr>
                        </tbody>
                    </table>
                );

            default:
                return <p>Chưa có bảng hướng dẫn cho sản phẩm này.</p>;
        }
    };

    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Hướng dẫn chọn size</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">{renderTable()}</div>
                </div>
            </div>
        </div>
    );
}