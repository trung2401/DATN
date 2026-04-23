const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const UserDTO = require('../dtos/UserDTO');

const hashMD5 = (value) => crypto.createHash('md5').update(String(value)).digest('hex');

const getMe = async (req, res) => {
    try {
        const userId = req.user.id; 

        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'Role' }]
        });

        if (!user) return res.status(404).json({ message: 'User not found!' });

        res.json(new UserDTO(user));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, gmail, phone } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.Name = name || user.Name;
        user.Gmail = gmail || user.Gmail;
        user.Phone = phone || user.Phone;

        await user.save();

        const updatedUser = await User.findByPk(userId, { include: [{ model: Role, as: 'Role' }] });
        res.json({
            message: 'Profile updated successfully!',
            user: new UserDTO(updatedUser)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMe, updateProfile };

// Admin: Create a user (Admin can create Admin or GiaoVien accounts)
const createUserByAdmin = async (req, res) => {
    try {
        const { userName, password, gmail, phone, name, roleId } = req.body;
        const normalizedRoleId = Number(roleId);

        if (!userName || !password || !roleId) {
            return res.status(400).json({ message: 'Missing required fields: userName, password or roleId!' });
        }

        if (![1, 2].includes(normalizedRoleId)) {
            return res.status(400).json({ message: 'RoleID chỉ được là 1 hoặc 2!' });
        }

        const [userExists, emailExists] = await Promise.all([
            User.findOne({ where: { UserName: userName } }),
            gmail ? User.findOne({ where: { Gmail: gmail } }) : Promise.resolve(null)
        ]);

        if (userExists) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
        if (emailExists) return res.status(400).json({ message: 'Email đã tồn tại!' });

        const role = await Role.findByPk(normalizedRoleId);
        if (!role) {
            return res.status(400).json({ message: 'RoleID không hợp lệ!' });
        }

        const hashed = hashMD5(password);

        const newUser = await User.create({
            UserName: userName,
            Password: hashed,
            Gmail: gmail || null,
            Phone: phone || null,
            Name: name || null,
            RoleID: normalizedRoleId
        });

        const created = await User.findByPk(newUser.UserID, { include: [{ model: Role, as: 'Role' }] });
        res.status(201).json({ message: 'User created successfully!', user: new UserDTO(created) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Lock/Unlock account by setting `status` (1 = active, 0 = locked)
const lockAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { lock } = req.body; // boolean: true => lock, false => unlock

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = lock ? 0 : 1;
        await user.save();

        res.json({ message: lock ? 'Account locked' : 'Account unlocked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.Name = name ?? user.Name;
        user.Phone = phone ?? user.Phone;
        await user.save();

        const updated = await User.findByPk(id, { include: [{ model: Role, as: 'Role' }] });

        return res.json({
            message: 'User updated successfully!',
            user: new UserDTO(updated)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Lấy tham số phân trang và tìm kiếm từ Query String (ví dụ: ?page=1&limit=10&search=trung)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const { Op } = require('sequelize');

        // Truy vấn có điều kiện tìm kiếm và phân trang
        const { count, rows } = await User.findAndCountAll({
            where: {
                [Op.or]: [
                    { UserName: { [Op.like]: `%${search}%` } },
                    { Name: { [Op.like]: `%${search}%` } }
                ]
            },
            include: [{ model: Role, as: 'Role' }],
            limit: limit,
            offset: offset,
            order: [['UserID', 'DESC']]
        });

        // Chuyển đổi sang DTO để bảo mật
        const usersDTO = rows.map(user => new UserDTO(user));

        res.json({
            success: true,
            data: usersDTO,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            attributes: ['RoleID', 'RoleName'],
            order: [['RoleID', 'ASC']]
        });

        return res.json({
            success: true,
            data: roles.map((role) => ({
                roleId: role.RoleID,
                roleName: role.RoleName
            }))
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTotalUsersCount = async (req, res) => {
    try {
        const totalUsers = await User.count();

        return res.json({
            success: true,
            totalUsers
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getMe, updateProfile, createUserByAdmin, lockAccount, updateUserByAdmin, getAllUsers, getAllRoles, getTotalUsersCount };


