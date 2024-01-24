const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Kết nối đến MongoDB
mongoose.connect('mongodb+srv://yuizang:123@cluster0.ahxudwp.mongodb.net/user', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Đã kết nối thành công đến MongoDB');
    })
    .catch((error) => {
        console.error('Lỗi kết nối đến MongoDB:', error);
    });

// Middleware cho CORS
app.use(cors());

// Middleware để xử lý JSON và URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đường dẫn tới các tài nguyên tĩnh
app.use(express.static(path.join(__dirname, './')));

// Định nghĩa Schema và Model cho User
const UserSchema = new mongoose.Schema({
    username: String,
    phone: String,
    address: String,
    location: String
});

const User = mongoose.model('User', UserSchema);

// Route cho trang chủ
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

// Route lấy danh sách người dùng
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu từ MongoDB' });
    }
});

// Route thêm người dùng mới
app.post('/api/users', async (req, res) => {
    try {
        const { username, phone, address, location } = req.body;
        const newUser = new User({ username, phone, address, location });
        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi thêm người dùng vào MongoDB' });
    }
});

// Route xoá người dùng
app.delete('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const deletedUser = await User.findOneAndDelete({ username });

        if (!deletedUser) {
            return res.status(404).json({ error: `Không tìm thấy người dùng với username: ${username}` });
        }

        res.json({ message: `Người dùng ${username} đã bị xoá.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi xoá người dùng từ MongoDB' });
    }
});

// Route cập nhật thông tin người dùng
app.put('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { phone, address, location } = req.body;

        const existingUser = await User.findOne({ username });

        if (!existingUser) {
            return res.status(404).json({ error: `Không tìm thấy người dùng với username: ${username}` });
        }

        existingUser.phone = phone;
        existingUser.address = address;
        existingUser.location = location;

        const updatedUser = await existingUser.save();
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi cập nhật người dùng trong MongoDB' });
    }
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}/`);
});
