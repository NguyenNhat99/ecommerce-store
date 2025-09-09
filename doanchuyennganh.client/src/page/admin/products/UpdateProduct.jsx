import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    TextField, Button, Box, Typography, MenuItem, Select, InputLabel, FormControl,
    FormHelperText, Breadcrumbs, Link, Snackbar, Alert, CircularProgress
} from "@mui/material";
import { ChromePicker } from "react-color";
import categoryService from "../../../service/categoryService";
import brandService from "../../../service/brandService";
import productService from "../../../service/productService";

const UpdateProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [productSizes, setProductSizes] = useState([]);
    const [productColors, setProductColors] = useState([]);
    const [previewProductImage, setPreviewProductImage] = useState(null);
    const [previewProductImages, setPreviewProductImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [errors, setErrors] = useState({});
    const [categoryId, setCategoryId] = useState("");
    const [brandId, setBrandId] = useState("");
    const [notification, setNotification] = useState({ open: false, severity: "success", message: "" });
    const [loading, setLoading] = useState({ categories: true, brands: true, submitting: false });

    // Refs
    const nameRef = useRef();
    const descriptionRef = useRef();
    const priceRef = useRef();
    const originPriceRef = useRef();
    const stockRef = useRef();
    const mainImageRef = useRef();
    const additionalImagesRef = useRef();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesData, brandsData, productData] = await Promise.all([
                    categoryService.getAll(),
                    brandService.getAll(),
                    productService.getOne(id),
                ]);

                setCategories(categoriesData);
                setBrands(brandsData);
                console.log(productData)
                // Gán dữ liệu sản phẩm
                nameRef.current.value = productData.name;
                descriptionRef.current.value = productData.description;
                priceRef.current.value = productData.price;
                originPriceRef.current.value = productData.originalPrice;
                stockRef.current.value = productData.stock;
                setCategoryId(productData.categoryId);
                setBrandId(productData.brandId);
                setPreviewProductImage(productData.avatar);
                setProductColors(productData.productColors.map(p => p.codeColor));
                setProductSizes(productData.productSizes.map(s => ({
                    sizeName: s.sizeName,
                    stock: s.stock
                })));
                setPreviewProductImages(productData.images.map(img => img.imageUrl));
            } catch (error) {
                console.log(error)
                setNotification({
                    open: true,
                    severity: "error",
                    message: "Lỗi tải dữ liệu: " + error.toString(),
                });
            } finally {
                setLoading({ categories: false, brands: false, submitting: false });
            }
        };

        fetchInitialData();
    }, [id]);

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!nameRef.current?.value) {
            newErrors.name = "Vui lòng nhập tên sản phẩm";
        }

        if (!descriptionRef.current?.value) {
            newErrors.description = "Vui lòng nhập mô tả";
        }

        if (!priceRef.current?.value || Number(priceRef.current.value) <= 0) {
            newErrors.price = "Giá sản phẩm phải lớn hơn 0";
        }

        if (!originPriceRef.current?.value || Number(originPriceRef.current.value) <= 0) {
            newErrors.originprice = "Giá gốc phải lớn hơn 0";
        }

        if (!stockRef.current?.value || Number(stockRef.current.value) < 0) {
            newErrors.stock = "Số lượng không hợp lệ";
        }

        if (!categoryId) {
            newErrors.categoryid = "Vui lòng chọn danh mục";
        }

        if (!brandId) {
            newErrors.brandid = "Vui lòng chọn thương hiệu";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const handleColorChange = (index, newColor) => {
        setProductColors(prev => {
            const updated = [...prev];
            updated[index] = newColor;
            return updated;
        });
    };

    const handleAddColor = () => {
        setProductColors(prev => [...prev, "#000000"]);
    };

    const handleRemoveColor = (index) => {
        setProductColors(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewProductImage(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, mainImage: undefined }));
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const previewsUrl = files.map((file) => URL.createObjectURL(file));
            setPreviewProductImages(previewsUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(prev => ({ ...prev, submitting: true }));
            const formData = new FormData();
            formData.append("name", nameRef.current.value);
            formData.append("description", descriptionRef.current.value);
            formData.append("price", priceRef.current.value);
            formData.append("originalPrice", originPriceRef.current.value);
            formData.append("stock", stockRef.current.value);
            formData.append("categoryId", categoryId);
            formData.append("brandId", brandId);
            if (mainImageRef.current?.files[0]) {
                formData.append("avatar", mainImageRef.current.files[0]);
            }
            Array.from(additionalImagesRef.current?.files || []).forEach(file => 
                formData.append("images", file)
            );
            productColors.forEach(color => formData.append("colorCodes", color));
            productSizes.forEach((size, i) => {
                if (size.sizeName) formData.append(`ProductSizes[${i}].SizeName`, size.sizeName);
                formData.append(`ProductSizes[${i}].Stock`, size.stock);
            });

            await productService.updateOne(id, formData);

            setNotification({
                open: true,
                severity: "success",
                message: "Cập nhật sản phẩm thành công!",
            });

            setTimeout(() => navigate("/admin/san-pham"), 1500);
        } catch (error) {
            setNotification({
                open: true,
                severity: "error",
                message: "Lỗi cập nhật sản phẩm: " + error,
            });
        } finally {
            setLoading(prev => ({ ...prev, submitting: false }));
        }
    };

    const handleCancel = () => {
        navigate("/admin/san-pham");
    };

    return (
        <Box>
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
                    {notification.message}
                </Alert>
            </Snackbar>

            <Breadcrumbs aria-placeholder="breadcrumb" sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" href="/admin/dashboard">
                    Dashboard
                </Link>
                <Link underline="hover" color="inherit" href="/admin/san-pham">
                    Sản phẩm
                </Link>
                <Typography sx={{ color: 'text.primary' }}>Cập nhật sản phẩm</Typography>
            </Breadcrumbs>

            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Cập nhật sản phẩm</Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
                <TextField
                    placeholder="Tên sản phẩm"
                    inputRef={nameRef}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    fullWidth
                    margin="normal"
                />
                <TextField
                    placeholder="Mô tả"
                    inputRef={descriptionRef}
                    error={!!errors.description}
                    helperText={errors.description}
                    rows={3}
                    required
                    multiline
                    fullWidth
                    margin="normal"
                />

                <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
                    <TextField
                        placeholder="Giá hiện tại"
                        type="number"
                        inputRef={priceRef}
                        error={!!errors.price}
                        helperText={errors.price}
                        fullWidth
                        required
                        InputProps={{
                            inputProps: { min: 0 }
                        }}
                    />
                    <TextField
                        placeholder="Giá gốc"
                        type="number"
                        inputRef={originPriceRef}
                        error={!!errors.originprice}
                        helperText={errors.originprice}
                        fullWidth
                        required
                        InputProps={{
                            inputProps: { min: 0 }
                        }}
                    />
                    <TextField
                        placeholder="Số lượng tổng"
                        type="number"
                        inputRef={stockRef}
                        error={!!errors.stock}
                        helperText={errors.stock}
                        fullWidth
                        required
                        InputProps={{
                            inputProps: { min: 0 }
                        }}
                    />
                </Box>

                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <FormControl fullWidth required error={!!errors.categoryid}>
                        <InputLabel id="category-label">Danh mục</InputLabel>
                        <Select
                            labelId="category-label"
                            placeholder="Danh mục"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            disabled={loading.categories}
                        >
                            <MenuItem value="">Chọn danh mục</MenuItem>
                            {loading.categories ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} />
                                </MenuItem>
                            ) : (
                                categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.categoryName}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                        <FormHelperText sx={{ color: "red" }}>{errors.categoryid}</FormHelperText>
                    </FormControl>

                    <FormControl fullWidth required error={!!errors.brandid}>
                        <InputLabel id="brand-label">Thương hiệu</InputLabel>
                        <Select
                            labelId="brand-label"
                            placeholder="Thương hiệu"
                            value={brandId}
                            onChange={(e) => setBrandId(e.target.value)}
                            disabled={loading.brands}
                        >
                            <MenuItem value="">Chọn thương hiệu</MenuItem>
                            {loading.brands ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} />
                                </MenuItem>
                            ) : (
                                brands.map((brand) => (
                                    <MenuItem key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                        <FormHelperText sx={{ color: "red" }}>{errors.brandid}</FormHelperText>
                    </FormControl>
                </Box>

                {/* Ảnh đại diện */}
                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        component="label"
                        color="secondary"
                        fullWidth
                    >
                        Tải ảnh đại diện mới
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={mainImageRef}
                        />
                    </Button>
                    {previewProductImage && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Ảnh hiện tại:</Typography>
                            <img
                                src={`https://localhost:7097/assets/products/${previewProductImage}`}
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
                </Box>

                {/* Ảnh sản phẩm */}
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                        color="secondary"
                        fullWidth
                    >
                        Thêm ảnh sản phẩm mới (nhiều ảnh)
                        <input
                            type="file"
                            multiple
                            hidden
                            accept="image/*"
                            onChange={handleImagesChange}
                            ref={additionalImagesRef}
                        />
                    </Button>
                    {previewProductImages.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Ảnh hiện tại:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {previewProductImages.map((urlImg, index) => (
                                    <img
                                        key={index}
                                        src={`https://localhost:7097/assets/products/${urlImg}`}
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
                        </Box>
                    )}
                </Box>

                {/* Kích thước sản phẩm */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Kích thước và số lượng tồn</Typography>
                    {productSizes.map((size, index) => (
                        <Box key={index} sx={{ display: "flex", gap: 2, marginBottom: 2, mt: 2 }}>
                            <TextField
                                label={`Tên kích thước ${index + 1}`}
                                value={size.sizeName}
                                onChange={handleSizeChange(index, "sizeName")}
                                fullWidth
                            />
                            <TextField
                                placeholder="Số lượng tồn"
                                type="number"
                                value={size.stock}
                                onChange={handleSizeChange(index, "stock")}
                                fullWidth
                                InputProps={{
                                    inputProps: { min: 0 }
                                }}
                            />
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleRemoveSize(index)}
                                sx={{ alignSelf: 'center' }}
                            >
                                Xóa
                            </Button>
                        </Box>
                    ))}
                    <Button
                        variant="contained"
                        sx={{ display: "block", margin: "auto", mt: 1 }}
                        onClick={handleAddSize}
                    >
                        + Thêm kích thước
                    </Button>
                </Box>

                {/* Màu sắc sản phẩm */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Màu sắc sản phẩm</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {productColors.map((color, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    border: "1px solid #ccc",
                                    p: 2,
                                    borderRadius: 2,
                                }}
                            >
                                <ChromePicker
                                    color={color}
                                    onChangeComplete={(newColor) => handleColorChange(index, newColor.hex)}
                                    disableAlpha
                                    width="100%"
                                />
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                    <Typography fontSize={14}>Mã màu: <strong>{color.toUpperCase()}</strong></Typography>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => handleRemoveColor(index)}
                                    >
                                        Xóa
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleAddColor}
                        sx={{ display: "block", mx: "auto", mt: 2 }}
                    >
                        + Thêm màu
                    </Button>
                </Box>

                {/* Submit + Cancel */}
                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading.submitting}
                        startIcon={loading.submitting ? <CircularProgress size={20} /> : null}
                    >
                        {loading.submitting ? "Đang xử lý..." : "Cập nhật sản phẩm"}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancel}
                        disabled={loading.submitting}
                    >
                        Hủy
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default UpdateProductPage;