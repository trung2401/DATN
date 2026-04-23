const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const VocabularyList = require('../models/VocabularyList');
const UserDTO = require('../dtos/UserDTO');

const hashMD5 = (value) => crypto.createHash('md5').update(String(value)).digest('hex');

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.UserID, role: user.Role ? user.Role.RoleName : null, roleId: user.RoleID },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE }
    );
};

const login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        const user = await User.findOne({
            where: { UserName: userName },
            include: [{ model: Role, as: 'Role' }]
        });

        if (!user) {
            return res.status(404).json({ message: 'Account not found!' });
        }

        if (Number(user.status) === 0) {
            return res.status(403).json({ message: 'Account is locked!' });
        }

        const isMatch = hashMD5(password) === user.Password;
        console.log("Input:", password);
        console.log("MD5 Input:", hashMD5(password));
        console.log("DB Password:", user.Password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password!' });
            
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(
            { id: user.UserID },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE }
        );

        // LƯU REFRESH TOKEN VÀO DATABASE
        await user.update({ RefreshToken: refreshToken });

        return res.json({
            message: 'Login successful!',
            accessToken,
            refreshToken,
            user: new UserDTO(user)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const handleRefreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Không tìm thấy Refresh Token!' });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Refresh token expired!' });
            }

            const user = await User.findByPk(decoded.id, {
                include: [{ model: Role, as: 'Role' }]
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found!' });
            }

            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = jwt.sign(
                { id: user.UserID },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRE }
            );
                
            return res.json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const register = async (req, res) => {
    try {
        const { userName, password, gmail, phone, name } = req.body;

        const userExists = await User.findOne({ where: { UserName: userName } });
        if (userExists) {
            return res.status(400).json({ message: 'Account already exists!' });
        }

        const newUser = await User.create({
            UserName: userName,
            Password: hashMD5(password),
            Gmail: gmail || null,
            Phone: phone || null,
            Name: name || null,
            RoleID: 3 // Default role is "User"
        });

        // Tự tạo VocabularyList mặc định cho user mới đăng ký
        await VocabularyList.create({
            UserID: newUser.UserID,
            NameList: null,
            Description: null
        });

        const userWithRole = await User.findByPk(newUser.UserID, {
            include: [{ model: Role, as: 'Role' }]
        });

        return res.status(201).json({
            message: 'Registration successful!',
            user: new UserDTO(userWithRole)
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error during registration!', error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ middleware verifyToken

        // Xóa RefreshToken trong database
        await User.update(
            { RefreshToken: null },
            { where: { UserID: userId } }
        );

        return res.json({
            success: true,
            message: 'Đăng xuất thành công!'
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id; // Lấy từ middleware verifyToken

        // 1. Tìm user trong database
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        // 2. Kiểm tra mật khẩu cũ (Sử dụng hàm hashMD5 bạn đã viết)
        const isMatch = hashMD5(oldPassword) === user.Password;
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
        }

        // 3. Cập nhật mật khẩu mới (đã hash) và xóa luôn RefreshToken để yêu cầu login lại (tùy chọn)
        await user.update({
            Password: hashMD5(newPassword),
            RefreshToken: null // Ép người dùng đăng nhập lại trên mọi thiết bị để bảo mật
        });

        return res.json({
            success: true,
            message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.'
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { login, register, handleRefreshToken, logout, changePassword };
