import React, { useState, useRef } from "react";
import {
    TextField,
    Button,
    Box,
    Typography,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormHelperText,
    Breadcrumbs,
    Link,
    Snackbar,
    Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AddProductForm = () => {
    const navigate = useNavigate();
    const [productSizes, setProductSizes] = useState([]);
    const [previewProductImage, setPreviewProductImage] = useState(null);
    const [previewProductImages, setPreviewProductImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({
        open: false,
        severity: "success",
        message: ""
    });
    const [categoryId, setCategoryId] = useState("");
    const [brandId, setBrandId] = useState("");

    // Uncontrolled refs
    const nameRef = useRef();
    const descriptionRef = useRef();
    const priceRef = useRef();
    const originPriceRef = useRef();
    const stockRef = useRef();

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handleSizeChange = (index, field) => (e) => {
        const { value } = e.target;
        setProductSizes(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAddSize = () => {
        setProductSizes(prev => [...prev, { sizeName: "", stock: "" }]);
    };

    const handleRemoveSize = (index) => {
        setProductSizes(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewProductImage(URL.createObjectURL(file));
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const previewsUrl = files.map((file) => URL.createObjectURL(file));
            setPreviewProductImages(previewsUrl);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit logic would go here
    };

    const handleCancel = () => {
        navigate("/admin/san-pham");
    };

    return (
        <div>
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: "100%" }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
            <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit" href="/admin/dashboard">
                    Dashboard
                </Link>
                <Link underline="hover" color="inherit" href="/admin/san-pham">
                    Sản phẩm
                </Link>
                <Typography sx={{ color: 'text.primary' }}>Thêm sản phẩm</Typography>
            </Breadcrumbs>

            <Typography variant="h4">Thêm sản phẩm</Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
                <TextField
                    label="Tên sản phẩm"
                    inputRef={nameRef}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Mô tả"
                    name="description"
                    inputRef={descriptionRef}
                    error={!!errors.description}
                    helperText={errors.description}
                    rows={3}
                    required
                    multiline
                    fullWidth
                    margin="normal"
                />

                <Box sx={{ display: "flex", gap: 3 }}>
                    <TextField
                        label="Giá hiện tại"
                        name="price"
                        type="number"
                        inputRef={priceRef}
                        error={!!errors.price}
                        helperText={errors.price}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Giá gốc"
                        name="originprice"
                        type="number"
                        inputRef={originPriceRef}
                        error={!!errors.originprice}
                        helperText={errors.originprice}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Số lượng"
                        name="stock"
                        type="number"
                        inputRef={stockRef}
                        error={!!errors.stock}
                        helperText={errors.stock}
                        fullWidth
                        required
                    />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="category-label">Danh mục</InputLabel>
                        <Select
                            labelId="category-label"
                            label="Danh mục"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            error={!!errors.categoryid}
                        >
                            <MenuItem value="">Chọn danh mục</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.categoryName}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText sx={{ color: "red" }}>{errors.categoryid}</FormHelperText>
                    </FormControl>

                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="brand-label">Thương hiệu</InputLabel>
                        <Select
                            labelId="brand-label"
                            label="Thương hiệu"
                            value={brandId}
                            onChange={(e) => setBrandId(e.target.value)}
                            error={!!errors.brandid}
                        >
                            <MenuItem value="">Chọn thương hiệu</MenuItem>
                            {brands.map((brand) => (
                                <MenuItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText sx={{ color: "red" }}>{errors.brandid}</FormHelperText>
                    </FormControl>
                </Box>

                <Box sx={{ gap: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                        color="secondary"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Tải ảnh đại diện
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>

                    {previewProductImage && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Ảnh xem trước:</Typography>
                            <img
                                src={previewProductImage}
                                alt="preview"
                                style={{
                                    width: "20%",
                                    maxHeight: 250,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                }}
                            />
                        </Box>
                    )}

                    <Button
                        variant="contained"
                        component="label"
                        color="secondary"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Tải ảnh sản phẩm
                        <input
                            type="file"
                            multiple
                            hidden
                            accept="image/*"
                            onChange={handleImagesChange}
                        />
                    </Button>

                    {previewProductImages.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Ảnh xem trước:</Typography>
                            {previewProductImages.map((urlImg, index) => (
                                <img
                                    key={index}
                                    src={urlImg}
                                    alt="preview"
                                    style={{
                                        width: "20%",
                                        maxHeight: 250,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Kích thước và số lượng tồn</Typography>
                    {productSizes.map((size, index) => (
                        <Box key={index} sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
                            <TextField
                                label={`Tên kích thước ${index + 1}`}
                                value={size.sizeName}
                                onChange={handleSizeChange(index, "sizeName")}
                                fullWidth
                            />
                            <TextField
                                label="Số lượng tồn"
                                type="number"
                                value={size.stock}
                                onChange={handleSizeChange(index, "stock")}
                                fullWidth
                            />
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleRemoveSize(index)}
                            >
                                Xóa
                            </Button>
                        </Box>
                    ))}
                    <Button
                        variant="contained"
                        sx={{ display: "block", margin: "auto" }}
                        onClick={handleAddSize}
                    >
                        +
                    </Button>
                </Box>
                <FormHelperText sx={{ color: "red" }}></FormHelperText>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                    >
                        Thêm sản phẩm
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ mt: 2 }}
                        onClick={handleCancel}
                    >
                        Hủy
                    </Button>
                </Box>
            </Box>
        </div>
    );
};

export default AddProductForm;