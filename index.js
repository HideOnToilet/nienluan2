const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

mongoose.connect('mongodb+srv://yuizang:123@cluster0.ahxudwp.mongodb.net/user', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    username: String,
    phone: String,
    address: String,
    location: String
});

const User = mongoose.model('User', UserSchema);

app.use(express.static(path.join(__dirname, './')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu từ MongoDB' });
    }
});

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

app.put('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { phone, address, location } = req.body;

        // Tìm kiếm người dùng theo username
        const existingUser = await User.findOne({ username });

        if (!existingUser) {
            return res.status(404).json({ error: `Không tìm thấy người dùng với username: ${username}` });
        }

        // Cập nhật thông tin người dùng
        existingUser.phone = phone;
        existingUser.address = address;
        existingUser.location = location;

        const updatedUser = await existingUser.save();
        res.json(updatedUser);

        // Gửi thông báo hoặc làm bất kỳ thứ gì khác nếu cần thiết
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi cập nhật người dùng trong MongoDB' });
    }
});


const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}/`);
});
