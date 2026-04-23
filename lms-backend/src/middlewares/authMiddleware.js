const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Bạn cần đăng nhập!' });
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token expired', error: err.message });
        }

        req.user = decoded;
        next();
    });
};

const optionalVerifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null; // Khách vãng lai
        return next();
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) {
            req.user = null; // Token lỗi hoặc hết hạn thì coi như khách vãng lai
        } else {
            req.user = decoded;
        }
        next();
    });
};

const hasRole = (req, roleNames, roleIds) => {
    if (!req.user) return false;

    const normalizedRole = (req.user.role || '').trim().toLowerCase();
    const normalizedRoles = roleNames.map(role => role.trim().toLowerCase());

    return normalizedRoles.includes(normalizedRole) || roleIds.includes(req.user.roleId);
};

const isAdmin = (req, res, next) => {
    if (hasRole(req, ['Quản Trị Viên', 'Admin'], [1])) {
        return next();
    }

    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho Admin!' });
};

const isTeacher = (req, res, next) => {
    if (hasRole(req, ['Giáo Viên', 'GiaoVien', 'Teacher'], [2])) {
        return next();
    }

    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này!' });
};

module.exports = { verifyToken, optionalVerifyToken, isAdmin, isTeacher };
