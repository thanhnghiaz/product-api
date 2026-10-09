
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();

// Cho phép API đọc dữ liệu JSON từ request body
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Da ket noi MongoDB thanh cong');

        app.listen(process.env.PORT || 3000, () => {
            console.log(
                `Server dang chay tai http://localhost:${process.env.PORT || 3000}`
            );
        });
    })
    .catch((error) => {
        console.error('Loi ket noi MongoDB:', error.message);
        process.exit(1);
    });

// CREATE: Thêm sản phẩm
app.post('/api/products', async (req, res) => {
    try {
        const { pid, pname, price, quantity } = req.body;

        const product = await Product.create({
            pid,
            pname,
            price,
            quantity
        });

        res.status(201).json({
            message: 'Them san pham thanh cong',
            data: product
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Ma san pham pid da ton tai'
            });
        }

        if (error.name === 'ValidationError' ||
            error.name === 'CastError') {
            return res.status(400).json({
                message: 'Du lieu khong hop le',
                error: error.message
            });
        }

        res.status(500).json({
            message: 'Loi server',
            error: error.message
        });
    }
});

// READ ALL: Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            message: 'Loi server',
            error: error.message
        });
    }
});

// READ ONE: Lấy sản phẩm theo pid
app.get('/api/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOne({
            pid: req.params.pid
        });

        if (!product) {
            return res.status(404).json({
                message: 'Khong tim thay san pham'
            });
        }

        res.status(200).json({ data: product });
    } catch (error) {
        res.status(500).json({
            message: 'Loi server',
            error: error.message
        });
    }
});

// UPDATE: Cập nhật sản phẩm theo pid
app.put('/api/products/:pid', async (req, res) => {
    try {
        const { pid, pname, price, quantity } = req.body;

        const updates = {};

        if (pid !== undefined) updates.pid = pid;
        if (pname !== undefined) updates.pname = pname;
        if (price !== undefined) updates.price = price;
        if (quantity !== undefined) updates.quantity = quantity;

        const product = await Product.findOneAndUpdate(
            { pid: req.params.pid },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: 'Khong tim thay san pham'
            });
        }

        res.status(200).json({
            message: 'Cap nhat san pham thanh cong',
            data: product
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Ma san pham pid da ton tai'
            });
        }

        if (error.name === 'ValidationError' ||
            error.name === 'CastError') {
            return res.status(400).json({
                message: 'Du lieu khong hop le',
                error: error.message
            });
        }

        res.status(500).json({
            message: 'Loi server',
            error: error.message
        });
    }
});

// DELETE: Xóa sản phẩm theo pid
app.delete('/api/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            pid: req.params.pid
        });

        if (!product) {
            return res.status(404).json({
                message: 'Khong tim thay san pham'
            });
        }

        res.status(200).json({
            message: 'Xoa san pham thanh cong',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: 'Loi server',
            error: error.message
        });
    }
});