const Lession = require('../models/Lession');
const Part = require('../models/Part');
const Course = require('../models/Course');
const { normalizeDataPath } = require('../utils/assetPath');

const isTeacherUser = (user) => Number(user?.roleId) === 2 || String(user?.role || '').toLowerCase().includes('giáo viên') || String(user?.role || '').toLowerCase().includes('teacher');

const ensureTeacherOwnsCourse = async (courseId, user) => {
    const course = await Course.findByPk(courseId);
    if (!course) {
        return { error: { code: 404, message: 'Course not found!' } };
    }

    if (isTeacherUser(user) && Number(course.TeacherID) !== Number(user?.id)) {
        return { error: { code: 403, message: 'Bạn không có quyền thao tác với khóa học này!' } };
    }

    return { course };
};

const serializeLession = (lession) => ({
    lessionId: lession.lessionID,
    courseId: lession.CourseID,
    lessionName: lession.lessionname,
    video: lession.Video,
    orderNumber: lession.OrderNumber,
    partId: lession.PartID,
    listId: lession.ListID,
    exercise: lession.Exercise,
    part: lession.Part ? {
        partId: lession.Part.PartID,
        partName: lession.Part.PartName
    } : null
});

const getAllLessions = async (req, res) => {
    try {
        const { courseId, partId } = req.query;
        

        // KIỂM TRA BẮT BUỘC: Nếu không có courseId thì không xử lý tiếp
        if (!courseId) {
            return res.status(400).json({ 
                success: false,
                message: 'Thiếu courseId! Vui lòng chọn một khóa học để xem danh sách bài học.' 
            });
        }
        const where = { CourseID: courseId };
        if (partId) {
            where.PartID = partId;
        }

        if (req.user && isTeacherUser(req.user)) {
            const course = await Course.findByPk(courseId);
            if (!course) {
                return res.status(404).json({ success: false, message: 'Course not found!' });
            }
            if (Number(course.TeacherID) !== Number(req.user.id)) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền xem khóa học này!' });
            }
        }
        
        const lessions = await Lession.findAll({
            where,
            include: [{
                model: Part,
                as: 'Part',
                attributes: ['PartID', 'PartName']
            }],
            order: [['OrderNumber', 'ASC'], ['lessionID', 'ASC']]
        });

        return res.json({
            success: true,
            count: lessions.length,
            data: lessions.map(serializeLession)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const createLession = async (req, res) => {
    try {
        const { courseId, lessionName, video, orderNumber, partId, listId, exercise } = req.body;

        if (!courseId || !partId) {
            return res.status(400).json({ message: 'Missing required fields: courseId, partId' });
        }

        const ownership = await ensureTeacherOwnsCourse(courseId, req.user.id);
        if (ownership.error) {
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        const created = await Lession.create({
            CourseID: courseId,
            lessionname: lessionName || null,
            Video: normalizeDataPath(video),
            OrderNumber: orderNumber || null,
            PartID: partId,
            ListID: listId || null,
            Exercise: normalizeDataPath(exercise)
        });

        const data = await Lession.findByPk(created.lessionID, {
            include: [{ model: Part, as: 'Part', attributes: ['PartID', 'PartName'] }]
        });

        return res.status(201).json({
            message: 'Lession created successfully!',
            data: serializeLession(data)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateLession = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseId, lessionName, video, orderNumber, partId, listId, exercise } = req.body;

        const lession = await Lession.findByPk(id);
        if (!lession) {
            return res.status(404).json({ message: 'Lession not found!' });
        }

        const ownership = await ensureTeacherOwnsCourse(courseId ?? lession.CourseID, req.user.id);
        if (ownership.error) {
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        await lession.update({
            CourseID: courseId ?? lession.CourseID,
            lessionname: lessionName ?? lession.lessionname,
            Video: video !== undefined ? normalizeDataPath(video) : lession.getDataValue('Video'),
            OrderNumber: orderNumber ?? lession.OrderNumber,
            PartID: partId ?? lession.PartID,
            ListID: listId ?? lession.ListID,
            Exercise: exercise !== undefined ? normalizeDataPath(exercise) : lession.getDataValue('Exercise')
        });

        const updated = await Lession.findByPk(id, {
            include: [{ model: Part, as: 'Part', attributes: ['PartID', 'PartName'] }]
        });

        return res.json({
            message: 'Lession updated successfully!',
            data: serializeLession(updated)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteLession = async (req, res) => {
    try {
        const { id } = req.params;

        const lession = await Lession.findByPk(id);
        if (!lession) {
            return res.status(404).json({ message: 'Lession not found to delete' });
        }

        const ownership = await ensureTeacherOwnsCourse(lession.CourseID, req.user.id);
        if (ownership.error) {
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        const deletedRows = await Lession.destroy({ where: { lessionID: id } });
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Lession not found to delete' });
        }

        return res.json({ message: 'Lession deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const uploadLessionFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded!' });
        }

        return res.status(200).json({
            success: true,
            message: 'Upload successful!',
            url: normalizeDataPath(req.file.filename)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllLessions, createLession, updateLession, deleteLession, uploadLessionFile };
