const Question = require('../models/Question');
const TypeOneQuestion = require('../models/TypeOneQuestion');
const TypeTwoQuestion = require('../models/TypeTwoQuestion');
const DataQuestion = require('../models/DataQuestion');
const Test = require('../models/Test');
const User = require('../models/User');
const HistoryOfTest = require('../models/HistoryOfTest');
const sequelize = require('../config/db');
const { normalizeDataPath } = require('../utils/assetPath');
const { Op } = require('sequelize');

const SINGLE_PARTS = [1, 2, 5];
const GROUP_PARTS = [3, 4, 6, 7];

const toDbDataPath = (value) => {
    if (!value) return null;
    const normalized = String(value).replace(/\\/g, '/').trim();
    if (/^https?:\/\//i.test(normalized)) return normalized;

    const withoutLeadingSlash = normalized.replace(/^\/+/, '');
    if (withoutLeadingSlash.startsWith('data/')) {
        return withoutLeadingSlash;
    }

    return `data/${withoutLeadingSlash.replace(/^data\/+/, '')}`;
};

const isLikelyMediaPath = (value) => {
    const normalized = String(value || '').trim();
    if (!normalized) return false;
    return /^(https?:\/\/|\/?data\/)/i.test(normalized)
        || /\.(mp3|wav|m4a|ogg|flac|aac|jpg|jpeg|png|gif|webp|avif|svg)$/i.test(normalized);
};

const normalizeOptionalMediaOrText = (value) => {
    if (value === undefined || value === null) return null;
    const normalized = String(value).trim();
    if (!normalized) return null;
    return isLikelyMediaPath(normalized) ? toDbDataPath(normalized) : normalized;
};

const getOwnedTestOrThrow = async (testId, userId) => {
    const test = await Test.findByPk(testId);
    if (!test) {
        return { error: { code: 404, message: 'Test not found!' } };
    }
    if (Number(test.teacherID) !== Number(userId)) {
        return { error: { code: 403, message: 'Forbidden: You are not the owner of this test.' } };
    }
    return { test };
};

const normalizePartId = (value) => Number(value);

const normalizeAnswer = (value) => {
    const normalized = String(value || '').trim().toUpperCase();
    return normalized || null;
};

const serializeTest = (test) => ({
    testId: test.TestID,
    testName: test.TestName,
    audio: test.audio,
    status: test.status,
    teacherId: test.teacherID,
    teacher: test.Teacher ? {
        userId: test.Teacher.UserID,
        userName: test.Teacher.UserName,
        name: test.Teacher.Name
    } : null
});

const getAllTest = async (req, res) => {
    try {
        const { search } = req.query;

        const where = {};

        if (search) {
            where.TestName = {
                [Op.like]: `%${search}%`
            };
        }

        const tests = await Test.findAll({
            where,
            include: [{ model: User, as: 'Teacher', attributes: ['UserID', 'UserName', 'Name'] }],
            order: [['TestID', 'DESC']]
        });

        return res.json({
            success: true,
            count: tests.length,
            data: tests.map(serializeTest)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTestByUserID = async (req, res) => {
    try {
        const { userId } = req.params;

        const tests = await Test.findAll({
            where: { teacherID: userId },
            include: [{ model: User, as: 'Teacher', attributes: ['UserID', 'UserName', 'Name'] }],
            order: [['TestID', 'DESC']]
        });

        return res.json({
            success: true,
            count: tests.length,
            data: tests.map(serializeTest)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTotalAttemptsByUser = async (req, res) => {
    try {
        const userId = req.params.userId || req.query.userId || req.user?.id;

        if (!userId || Number.isNaN(Number(userId))) {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const totalAttempts = await HistoryOfTest.count({
            where: { UserID: Number(userId) }
        });

        return res.json({
            success: true,
            userId: Number(userId),
            totalAttempts
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTotalTestsCount = async (req, res) => {
    try {
        const totalTests = await Test.count();

        return res.json({
            success: true,
            totalTests
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const createTest = async (req, res) => {
    try {
        const { testName, audio } = req.body;

        if (!testName) {
            return res.status(400).json({ message: 'Missing required field: testName' });
        }

        const created = await Test.create({
            TestName: testName,
            audio: toDbDataPath(audio),
            teacherID: req.user.id,
            status: 0
        });

        const data = await Test.findByPk(created.TestID, {
            include: [{ model: User, as: 'Teacher', attributes: ['UserID', 'UserName', 'Name'] }]
        });

        return res.status(201).json({
            message: 'Test created successfully!',
            data: serializeTest(data)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { testName, audio } = req.body;

        const test = await Test.findByPk(id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found!' });
        }

        if (Number(test.teacherID) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this test.' });
        }

        await test.update({
            TestName: testName ?? test.TestName,
            audio: audio !== undefined ? toDbDataPath(audio) : test.getDataValue('audio')
        });

        const updated = await Test.findByPk(id, {
            include: [{ model: User, as: 'Teacher', attributes: ['UserID', 'UserName', 'Name'] }]
        });

        return res.json({
            message: 'Test updated successfully!',
            data: serializeTest(updated)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không tìm thấy file audio!' });
        }

        const filePath = `data/${req.file.filename}`;

        return res.status(201).json({
            success: true,
            message: 'Upload audio thành công!',
            data: {
                url: filePath,
                filename: req.file.filename
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không tìm thấy file hình ảnh!' });
        }

        const filePath = `data/${req.file.filename}`;

        return res.status(201).json({
            success: true,
            message: 'Upload hình ảnh thành công!',
            data: {
                url: filePath,
                filename: req.file.filename
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const createQuestionGroup = async (req, res) => {
    try {
        const testId = Number(req.params.testId);
        const partId = normalizePartId(req.body.partId);
        const { dataQuestion, transcript, orderNumberPart } = req.body;

        const ownership = await getOwnedTestOrThrow(testId, req.user.id);
        if (ownership.error) {
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        if (!GROUP_PARTS.includes(partId)) {
            return res.status(400).json({ message: 'partId must be one of 3,4,6,7 for grouped question.' });
        }

        const maxOrder = await DataQuestion.max('OrderNumber', {
            where: {
                TestsID: testId,
                OrderNumberPart: partId
            }
        });

        const created = await DataQuestion.create({
            DataQuestion: normalizeOptionalMediaOrText(dataQuestion),
            Transcript: transcript ?? null,
            TestsID: testId,
            OrderNumberPart: partId,
            OrderNumber: Number(orderNumberPart) || (Number(maxOrder || 0) + 1)
        });

        return res.status(201).json({
            success: true,
            message: 'Question group created successfully!',
            data: created
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getGroupsByPart = async (req, res) => {
    try {
        const testId = Number(req.params.testId);
        const partId = normalizePartId(req.query.partId);

        const ownership = await getOwnedTestOrThrow(testId, req.user.id);
        if (ownership.error) {
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        if (!GROUP_PARTS.includes(partId)) {
            return res.status(400).json({ message: 'partId must be one of 3,4,6,7.' });
        }

        const groups = await DataQuestion.findAll({
            where: {
                TestsID: testId,
                OrderNumberPart: partId
            },
            include: [{
                model: Question,
                as: 'Questions',
                include: [
                    { model: TypeOneQuestion, as: 'TypeOneQuestion', required: false },
                    { model: TypeTwoQuestion, as: 'TypeTwoQuestion', required: false }
                ],
                order: [['OrderNumber', 'ASC'], ['QuestionID', 'ASC']]
            }],
            order: [['OrderNumber', 'ASC'], ['DataQuestionID', 'ASC']]
        });

        return res.json({
            success: true,
            count: groups.length,
            data: groups
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const addSingleQuestion = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const testId = Number(req.params.testId);
        const partId = normalizePartId(req.body.partId);
        const {
            answerCorrect,
            answerExplain,
            orderNumber,
            image,
            typeOne,
            typeTwo
        } = req.body;

        const ownership = await getOwnedTestOrThrow(testId, req.user.id);
        if (ownership.error) {
            await transaction.rollback();
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        if (!SINGLE_PARTS.includes(partId)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'partId must be one of 1,2,5 for single question.' });
        }

        const maxOrder = await Question.max('OrderNumber', {
            where: { TestID: testId },
            transaction
        });

        const question = await Question.create({
            PartID: partId,
            TestID: testId,
            AnswerCorrect: normalizeAnswer(answerCorrect),
            AnswerExplain: answerExplain ?? null,
            OrderNumber: Number(orderNumber) || (Number(maxOrder || 0) + 1),
            Image: normalizeOptionalMediaOrText(image),
            DataQuestionID: null
        }, { transaction });

        if ([1, 2].includes(partId)) {
            await TypeOneQuestion.create({
                QuestionID: question.QuestionID,
                Audio: normalizeOptionalMediaOrText(typeOne?.audio),
                Transcript: typeOne?.transcript ?? null
            }, { transaction });
        }

        if (partId === 5) {
            await TypeTwoQuestion.create({
                QuestionID: question.QuestionID,
                QuestionContent: typeTwo?.questionContent ?? null,
                ContentAnswerA: typeTwo?.contentAnswerA ?? null,
                ContentAnswerB: typeTwo?.contentAnswerB ?? null,
                ContentAnswerC: typeTwo?.contentAnswerC ?? null,
                ContentAnswerD: typeTwo?.contentAnswerD ?? null
            }, { transaction });
        }

        await transaction.commit();
        return res.status(201).json({
            success: true,
            message: 'Single question added successfully!',
            data: { questionId: question.QuestionID }
        });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ error: error.message });
    }
};

const addQuestionToGroup = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const testId = Number(req.params.testId);
        const dataQuestionId = Number(req.params.dataQuestionId);
        const {
            answerCorrect,
            answerExplain,
            orderNumber,
            image,
            typeOne,
            typeTwo
        } = req.body;

        const ownership = await getOwnedTestOrThrow(testId, req.user.id);
        if (ownership.error) {
            await transaction.rollback();
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        const group = await DataQuestion.findOne({
            where: {
                DataQuestionID: dataQuestionId,
                TestsID: testId
            },
            transaction
        });

        if (!group) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Question group not found!' });
        }

        const partId = Number(group.OrderNumberPart);
        if (!GROUP_PARTS.includes(partId)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Invalid grouped part.' });
        }

        const currentQuestionCount = await Question.count({
            where: { DataQuestionID: dataQuestionId },
            transaction
        });

        const maxByPart = {
            3: 3,
            4: 3,
            6: 4,
            7: 5
        };

        const maxAllowed = maxByPart[partId] || 999;
        if (currentQuestionCount >= maxAllowed) {
            await transaction.rollback();
            return res.status(400).json({
                message: `Part ${partId} chỉ cho phép tối đa ${maxAllowed} câu hỏi trong mỗi cụm.`
            });
        }

        const maxOrder = await Question.max('OrderNumber', {
            where: { TestID: testId },
            transaction
        });

        const question = await Question.create({
            PartID: partId,
            TestID: testId,
            AnswerCorrect: normalizeAnswer(answerCorrect),
            AnswerExplain: answerExplain ?? null,
            OrderNumber: Number(orderNumber) || (Number(maxOrder || 0) + 1),
            Image: normalizeOptionalMediaOrText(image),
            DataQuestionID: dataQuestionId
        }, { transaction });

        if ([3, 4, 6, 7].includes(partId)) {
            await TypeTwoQuestion.create({
                QuestionID: question.QuestionID,
                QuestionContent: typeTwo?.questionContent ?? null,
                ContentAnswerA: typeTwo?.contentAnswerA ?? null,
                ContentAnswerB: typeTwo?.contentAnswerB ?? null,
                ContentAnswerC: typeTwo?.contentAnswerC ?? null,
                ContentAnswerD: typeTwo?.contentAnswerD ?? null
            }, { transaction });
        }

        await transaction.commit();
        return res.status(201).json({
            success: true,
            message: 'Question added to group successfully!',
            data: { questionId: question.QuestionID, dataQuestionId }
        });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ error: error.message });
    }
};

const getQuestionsByPartForManage = async (req, res) => {
    try {
        const testId = Number(req.params.testId);
        const partId = normalizePartId(req.query.partId);

        const ownership = await getOwnedTestOrThrow(testId, req.user.id);
        if (ownership.error) {
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        if (SINGLE_PARTS.includes(partId)) {
            const questions = await Question.findAll({
                where: { TestID: testId, PartID: partId },
                include: [
                    { model: TypeOneQuestion, as: 'TypeOneQuestion', required: false },
                    { model: TypeTwoQuestion, as: 'TypeTwoQuestion', required: false },
                    { model: DataQuestion, as: 'DataQuestion', required: false }
                ],
                order: [['OrderNumber', 'ASC'], ['QuestionID', 'ASC']]
            });

            const data = questions.map((question) => ({
                questionId: question.QuestionID,
                partId: question.PartID,
                orderNumber: question.OrderNumber,
                answerCorrect: question.AnswerCorrect,
                answerExplain: question.AnswerExplain,
                image: normalizeDataPath(question.Image),
                dataQuestionId: question.DataQuestionID,
                dataQuestion: question.DataQuestion ? normalizeDataPath(question.DataQuestion.DataQuestion) : null,
                transcript: question.TypeOneQuestion ? question.TypeOneQuestion.Transcript : null,
                audio: question.TypeOneQuestion ? normalizeDataPath(question.TypeOneQuestion.Audio) : null,
                questionContent: question.TypeTwoQuestion ? question.TypeTwoQuestion.QuestionContent : null,
                contentAnswerA: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerA : null,
                contentAnswerB: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerB : null,
                contentAnswerC: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerC : null,
                contentAnswerD: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerD : null,
            }));

            return res.json({ success: true, partId, type: 'single', data });
        }

        if (GROUP_PARTS.includes(partId)) {
            const groups = await DataQuestion.findAll({
                where: {
                    TestsID: testId,
                    OrderNumberPart: partId
                },
                include: [{
                    model: Question,
                    as: 'Questions',
                    include: [
                        { model: TypeOneQuestion, as: 'TypeOneQuestion', required: false },
                        { model: TypeTwoQuestion, as: 'TypeTwoQuestion', required: false }
                    ],
                    order: [['OrderNumber', 'ASC'], ['QuestionID', 'ASC']]
                }],
                order: [['OrderNumber', 'ASC'], ['DataQuestionID', 'ASC']]
            });

            const data = groups.map((group) => ({
                dataQuestionId: group.DataQuestionID,
                partId,
                dataQuestion: normalizeDataPath(group.DataQuestion),
                transcript: group.Transcript,
                orderNumberPart: group.OrderNumber,
                questions: (group.Questions || []).map((question) => ({
                    questionId: question.QuestionID,
                    orderNumber: question.OrderNumber,
                    answerCorrect: question.AnswerCorrect,
                    answerExplain: question.AnswerExplain,
                    image: normalizeDataPath(question.Image),
                    questionContent: question.TypeTwoQuestion ? question.TypeTwoQuestion.QuestionContent : null,
                    contentAnswerA: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerA : null,
                    contentAnswerB: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerB : null,
                    contentAnswerC: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerC : null,
                    contentAnswerD: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerD : null,
                }))
            }));

            return res.json({ success: true, partId, type: 'group', data });
        }

        return res.status(400).json({ message: 'partId không hợp lệ.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateSingleQuestion = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const testId = Number(req.params.testId);
        const questionId = Number(req.params.questionId);
        const {
            orderNumber,
            answerCorrect,
            answerExplain,
            image,
            typeOne,
            typeTwo
        } = req.body;

        const ownership = await getOwnedTestOrThrow(testId, req.user.id);
        if (ownership.error) {
            await transaction.rollback();
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        const question = await Question.findOne({
            where: { QuestionID: questionId, TestID: testId },
            include: [
                { model: TypeOneQuestion, as: 'TypeOneQuestion', required: false },
                { model: TypeTwoQuestion, as: 'TypeTwoQuestion', required: false }
            ],
            transaction
        });

        if (!question) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Question not found!' });
        }

        await question.update({
            OrderNumber: orderNumber !== undefined ? Number(orderNumber) : question.OrderNumber,
            AnswerCorrect: answerCorrect !== undefined ? normalizeAnswer(answerCorrect) : question.AnswerCorrect,
            AnswerExplain: answerExplain !== undefined ? answerExplain : question.AnswerExplain,
            Image: image !== undefined ? normalizeOptionalMediaOrText(image) : question.getDataValue('Image')
        }, { transaction });

        if ([1, 2].includes(Number(question.PartID))) {
            const typeOnePayload = {
                Audio: typeOne?.audio !== undefined ? normalizeOptionalMediaOrText(typeOne.audio) : question.TypeOneQuestion?.Audio,
                Transcript: typeOne?.transcript !== undefined ? typeOne.transcript : question.TypeOneQuestion?.Transcript
            };

            if (question.TypeOneQuestion) {
                await question.TypeOneQuestion.update(typeOnePayload, { transaction });
            } else {
                await TypeOneQuestion.create({ QuestionID: question.QuestionID, ...typeOnePayload }, { transaction });
            }
        }

        if (Number(question.PartID) === 5 || GROUP_PARTS.includes(Number(question.PartID))) {
            const typeTwoPayload = {
                QuestionContent: typeTwo?.questionContent !== undefined ? typeTwo.questionContent : question.TypeTwoQuestion?.QuestionContent,
                ContentAnswerA: typeTwo?.contentAnswerA !== undefined ? typeTwo.contentAnswerA : question.TypeTwoQuestion?.ContentAnswerA,
                ContentAnswerB: typeTwo?.contentAnswerB !== undefined ? typeTwo.contentAnswerB : question.TypeTwoQuestion?.ContentAnswerB,
                ContentAnswerC: typeTwo?.contentAnswerC !== undefined ? typeTwo.contentAnswerC : question.TypeTwoQuestion?.ContentAnswerC,
                ContentAnswerD: typeTwo?.contentAnswerD !== undefined ? typeTwo.contentAnswerD : question.TypeTwoQuestion?.ContentAnswerD
            };

            if (question.TypeTwoQuestion) {
                await question.TypeTwoQuestion.update(typeTwoPayload, { transaction });
            } else {
                await TypeTwoQuestion.create({ QuestionID: question.QuestionID, ...typeTwoPayload }, { transaction });
            }
        }

        await transaction.commit();
        return res.json({
            success: true,
            message: 'Question updated successfully!'
        });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ error: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const testId = Number(req.params.testId);
        const questionId = Number(req.params.questionId);

        const ownership = await getOwnedTestOrThrow(testId, req.user.id);
        if (ownership.error) {
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        const deleted = await Question.destroy({
            where: { QuestionID: questionId, TestID: testId }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Question not found!' });
        }

        return res.json({ success: true, message: 'Question deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateQuestionGroup = async (req, res) => {
    try {
        const testId = Number(req.params.testId);
        const dataQuestionId = Number(req.params.dataQuestionId);
        const { dataQuestion, transcript, orderNumberPart } = req.body;

        const ownership = await getOwnedTestOrThrow(testId, req.user.id);
        if (ownership.error) {
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        const group = await DataQuestion.findOne({
            where: { DataQuestionID: dataQuestionId, TestsID: testId }
        });

        if (!group) {
            return res.status(404).json({ message: 'Question group not found!' });
        }

        await group.update({
            DataQuestion: dataQuestion !== undefined ? normalizeOptionalMediaOrText(dataQuestion) : group.DataQuestion,
            Transcript: transcript !== undefined ? transcript : group.Transcript,
            OrderNumber: orderNumberPart !== undefined ? Number(orderNumberPart) : group.OrderNumber
        });

        return res.json({ success: true, message: 'Question group updated successfully!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteQuestionGroup = async (req, res) => {
    try {
        const testId = Number(req.params.testId);
        const dataQuestionId = Number(req.params.dataQuestionId);

        const ownership = await getOwnedTestOrThrow(testId, req.user.id);
        if (ownership.error) {
            return res.status(ownership.error.code).json({ message: ownership.error.message });
        }

        const deleted = await DataQuestion.destroy({
            where: { DataQuestionID: dataQuestionId, TestsID: testId }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Question group not found!' });
        }

        return res.json({ success: true, message: 'Question group deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const setStatusTest = async (req, res) => {
    try {
        const { id } = req.params;

        const test = await Test.findByPk(id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found!' });
        }

        if (Number(test.teacherID) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this test.' });
        }

        const nextStatus = Number(test.status) === 1 ? 0 : 1;

        await test.update({ status: nextStatus });

        const updated = await Test.findByPk(id, {
            include: [{ model: User, as: 'Teacher', attributes: ['UserID', 'UserName', 'Name'] }]
        });

        return res.json({
            message: 'Test status updated successfully!',
            data: serializeTest(updated)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTestById = async (req, res) => {
    try {
        const { testId } = req.params;

        const questions = await Question.findAll({
            where: { TestID: testId },
            include: [
                {
                    model: TypeTwoQuestion,
                    as: 'TypeTwoQuestion',
                    required: false
                },
                {
                    model: DataQuestion,
                    as: 'DataQuestion',
                    required: false
                }
            ],
            order: [['OrderNumber', 'ASC'], ['QuestionID', 'ASC']]
        });

        const groupedItems = [];
        const groupMap = new Map();

        for (const question of questions) {
            if (question.DataQuestionID) {
                if (!groupMap.has(question.DataQuestionID)) {
                    const groupItem = {
                        partId: question.PartID,
                        type: 'group',
                        dataQuestionId: question.DataQuestionID,
                        content: question.DataQuestion ? question.DataQuestion.DataQuestion : null,
                        transcript: question.DataQuestion ? question.DataQuestion.Transcript : null,
                        order: question.DataQuestion ? question.DataQuestion.OrderNumberPart : null,
                        questions: []
                    };
                    groupMap.set(question.DataQuestionID, groupItem);
                    groupedItems.push(groupItem);
                }

                groupMap.get(question.DataQuestionID).questions.push({
                    questionId: question.QuestionID,
                    order: question.OrderNumber,
                    image: normalizeDataPath(question.Image),
                    answerCorrect: question.AnswerCorrect,
                    questionContent: question.TypeTwoQuestion ? question.TypeTwoQuestion.QuestionContent : null,
                    contentAnswerA: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerA : null,
                    contentAnswerB: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerB : null,
                    contentAnswerC: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerC : null,
                    contentAnswerD: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerD : null
                });
            } else {
                groupedItems.push({
                    partId: question.PartID,
                    type: 'single',
                    questionId: question.QuestionID,
                    order: question.OrderNumber,
                    image: normalizeDataPath(question.Image),
                    answerCorrect: question.AnswerCorrect,
                    questionContent: question.TypeTwoQuestion ? question.TypeTwoQuestion.QuestionContent : null,
                    contentAnswerA: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerA : null,
                    contentAnswerB: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerB : null,
                    contentAnswerC: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerC : null,
                    contentAnswerD: question.TypeTwoQuestion ? question.TypeTwoQuestion.ContentAnswerD : null
                });
            }
        }

        return res.json({
            success: true,
            testId: Number(testId),
            items: groupedItems
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const startTest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { testId } = req.params;

        const test = await Test.findByPk(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found!' });
        }

        const started = await HistoryOfTest.create({
            UserID: userId,
            TestID: testId,
            Date: new Date()
        });

        return res.status(201).json({ historyOfTestID: started.HistoryOfTestID });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const submitTest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { historyOfTestID, answers } = req.body;

        if (!historyOfTestID || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Missing required fields: historyOfTestID, answers' });
        }

        if (answers.length === 0) {
            return res.status(400).json({ message: 'Answers cannot be empty.' });
        }

        const history = await HistoryOfTest.findByPk(historyOfTestID);
        if (!history) {
            return res.status(404).json({ message: 'HistoryOfTest not found!' });
        }

        if (Number(history.UserID) !== Number(userId)) {
            return res.status(403).json({ message: 'Forbidden: This test attempt does not belong to current user.' });
        }

        const normalizedAnswers = answers.map((item) => ({
            questionId: item.questionId,
            selected: item.selected ? String(item.selected).toUpperCase() : null
        }));

        const hasInvalid = normalizedAnswers.some((item) => !item.questionId || !item.selected);
        if (hasInvalid) {
            return res.status(400).json({ message: 'Each answer must include questionId and selected.' });
        }

        const placeholders = normalizedAnswers.map(() => '(?, ?, ?)').join(', ');
        const replacementValues = normalizedAnswers.flatMap((item) => [
            historyOfTestID,
            item.questionId,
            item.selected
        ]);

        await sequelize.query(
            `INSERT INTO historyoftest_question (HistoryoftestID, QuestionID, Answer) VALUES ${placeholders}`,
            { replacements: replacementValues }
        );

        return res.json({
            success: true,
            message: 'Submit test successfully!',
            insertedCount: normalizedAnswers.length
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const { QueryTypes } = require('sequelize');

const TOEIC_SCORE_TABLE = [
    { correct: 0, listening: 5, reading: 5 },
    { correct: 1, listening: 5, reading: 5 },
    { correct: 2, listening: 5, reading: 5 },
    { correct: 3, listening: 5, reading: 5 },
    { correct: 4, listening: 5, reading: 5 },
    { correct: 5, listening: 5, reading: 5 },
    { correct: 6, listening: 5, reading: 5 },
    { correct: 7, listening: 10, reading: 5 },
    { correct: 8, listening: 15, reading: 5 },
    { correct: 9, listening: 20, reading: 5 },
    { correct: 10, listening: 25, reading: 5 },
    { correct: 11, listening: 30, reading: 5 },
    { correct: 12, listening: 35, reading: 5 },
    { correct: 13, listening: 40, reading: 5 },
    { correct: 14, listening: 45, reading: 5 },
    { correct: 15, listening: 50, reading: 5 },
    { correct: 16, listening: 55, reading: 10 },
    { correct: 17, listening: 60, reading: 15 },
    { correct: 18, listening: 65, reading: 20 },
    { correct: 19, listening: 70, reading: 25 },
    { correct: 20, listening: 75, reading: 30 },
    { correct: 21, listening: 80, reading: 35 },
    { correct: 22, listening: 85, reading: 40 },
    { correct: 23, listening: 90, reading: 45 },
    { correct: 24, listening: 95, reading: 50 },
    { correct: 25, listening: 100, reading: 60 },
    { correct: 26, listening: 110, reading: 65 },
    { correct: 27, listening: 115, reading: 70 },
    { correct: 28, listening: 120, reading: 80 },
    { correct: 29, listening: 125, reading: 85 },
    { correct: 30, listening: 130, reading: 90 },
    { correct: 31, listening: 135, reading: 95 },
    { correct: 32, listening: 140, reading: 100 },
    { correct: 33, listening: 145, reading: 110 },
    { correct: 34, listening: 150, reading: 115 },
    { correct: 35, listening: 160, reading: 120 },
    { correct: 36, listening: 165, reading: 125 },
    { correct: 37, listening: 170, reading: 130 },
    { correct: 38, listening: 175, reading: 140 },
    { correct: 39, listening: 180, reading: 145 },
    { correct: 40, listening: 185, reading: 150 },
    { correct: 41, listening: 190, reading: 160 },
    { correct: 42, listening: 195, reading: 165 },
    { correct: 43, listening: 200, reading: 170 },
    { correct: 44, listening: 210, reading: 175 },
    { correct: 45, listening: 215, reading: 180 },
    { correct: 46, listening: 220, reading: 190 },
    { correct: 47, listening: 230, reading: 195 },
    { correct: 48, listening: 240, reading: 200 },
    { correct: 49, listening: 245, reading: 210 },
    { correct: 50, listening: 250, reading: 215 },
    { correct: 51, listening: 255, reading: 220 },
    { correct: 52, listening: 260, reading: 225 },
    { correct: 53, listening: 270, reading: 230 },
    { correct: 54, listening: 275, reading: 235 },
    { correct: 55, listening: 280, reading: 240 },
    { correct: 56, listening: 290, reading: 250 },
    { correct: 57, listening: 295, reading: 255 },
    { correct: 58, listening: 300, reading: 260 },
    { correct: 59, listening: 310, reading: 265 },
    { correct: 60, listening: 315, reading: 270 },
    { correct: 61, listening: 320, reading: 280 },
    { correct: 62, listening: 325, reading: 285 },
    { correct: 63, listening: 330, reading: 290 },
    { correct: 64, listening: 340, reading: 300 },
    { correct: 65, listening: 345, reading: 305 },
    { correct: 66, listening: 350, reading: 310 },
    { correct: 67, listening: 360, reading: 320 },
    { correct: 68, listening: 365, reading: 325 },
    { correct: 69, listening: 370, reading: 330 },
    { correct: 70, listening: 380, reading: 335 },
    { correct: 71, listening: 385, reading: 340 },
    { correct: 72, listening: 390, reading: 350 },
    { correct: 73, listening: 395, reading: 355 },
    { correct: 74, listening: 400, reading: 360 },
    { correct: 75, listening: 405, reading: 365 },
    { correct: 76, listening: 410, reading: 370 },
    { correct: 77, listening: 420, reading: 380 },
    { correct: 78, listening: 425, reading: 385 },
    { correct: 79, listening: 430, reading: 390 },
    { correct: 80, listening: 440, reading: 395 },
    { correct: 81, listening: 445, reading: 400 },
    { correct: 82, listening: 450, reading: 405 },
    { correct: 83, listening: 460, reading: 410 },
    { correct: 84, listening: 465, reading: 415 },
    { correct: 85, listening: 470, reading: 420 },
    { correct: 86, listening: 475, reading: 425 },
    { correct: 87, listening: 480, reading: 430 },
    { correct: 88, listening: 485, reading: 435 },
    { correct: 89, listening: 490, reading: 445 },
    { correct: 90, listening: 495, reading: 450 },
    { correct: 91, listening: 495, reading: 455 },
    { correct: 92, listening: 495, reading: 465 },
    { correct: 93, listening: 495, reading: 470 },
    { correct: 94, listening: 495, reading: 480 },
    { correct: 95, listening: 495, reading: 485 },
    { correct: 96, listening: 495, reading: 490 },
    { correct: 97, listening: 495, reading: 495 },
    { correct: 98, listening: 495, reading: 495 },
    { correct: 99, listening: 495, reading: 495 },
    { correct: 100, listening: 495, reading: 495 }
];

const getToeicSectionScore = (correctCount, section) => {
    const normalizedCorrectCount = Math.max(0, Math.min(100, Number(correctCount) || 0));

    const matched = TOEIC_SCORE_TABLE.find((row) => row.correct === normalizedCorrectCount);
    if (matched) {
        return matched[section] || 5;
    }

    return 5;
};

const isAudioPath = (value) => /\.(mp3|wav|m4a|ogg)$/i.test(String(value || '').trim());
const isImagePath = (value) => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(String(value || '').trim());

const parseOptionsFromTranscript = (transcript) => {
    const lines = String(transcript || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const optionLines = lines.filter((line) => /^\(?[A-D]\)|^[A-D]\./i.test(line));

    return optionLines.map((line) => {
        const normalized = line
            .replace(/^\(([A-D])\)\s*/i, '$1. ')
            .replace(/^([A-D])\.\s*/i, '$1. ');
        return normalized;
    });
};

const extractQuestionTextFromTypeOneTranscript = (transcript) => {
    const lines = String(transcript || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const questionLine = lines.find((line) => !/^\(?[A-D]\)|^[A-D]\./i.test(line));
    return questionLine || '';
};

const getTest = async (req, res) => {
    try {
        const rawTestId = req.query.testId || req.params.testId;
        const testId = Number(rawTestId);

        if (!testId || Number.isNaN(testId)) {
            return res.status(400).json({ message: 'Invalid testId' });
        }

        const test = await Test.findByPk(testId, {
            attributes: ['TestID', 'TestName', 'audio']
        });

        if (!test) {
            return res.status(404).json({ message: 'Test not found!' });
        }

        const mediaBaseUrl = `${req.protocol}://${req.get('host')}`;
        const toAbsoluteMediaUrl = (value) => {
            if (!value) return null;
            if (/^https?:\/\//i.test(String(value))) return value;
            return `${mediaBaseUrl}${String(value).startsWith('/') ? '' : '/'}${value}`;
        };

        const mainTestAudio = toAbsoluteMediaUrl(normalizeDataPath(test.audio));

        const questionRows = await sequelize.query(`
            SELECT
                q.QuestionID,
                q.PartID,
                q.OrderNumber,
                q.Image,
                q.DataQuestionID,
                ttq.QuestionContent,
                ttq.ContentAnswerA,
                ttq.ContentAnswerB,
                ttq.ContentAnswerC,
                ttq.ContentAnswerD,
                toq.Transcript AS TypeOneTranscript,
                dq.DataQuestion
            FROM question q
            LEFT JOIN typetwoquestion ttq ON ttq.QuestionID = q.QuestionID
            LEFT JOIN typeonequestion toq ON toq.QuestionID = q.QuestionID
            LEFT JOIN dataquestion dq ON dq.DataQuestionID = q.DataQuestionID
            WHERE q.TestID = :testId
            ORDER BY q.OrderNumber ASC, q.QuestionID ASC
        `, {
            replacements: { testId },
            type: QueryTypes.SELECT
        });

        const questionsByPart = {
            '1': [],
            '2': [],
            '3': [],
            '4': [],
            '5': [],
            '6': [],
            '7': []
        };

        for (const row of questionRows) {
            const partNumber = Number(row.PartID);
            if (!questionsByPart[String(partNumber)]) continue;

            const dataQuestionValue = String(row.DataQuestion || '').trim();
            const dataQuestionImage = isImagePath(dataQuestionValue)
                ? toAbsoluteMediaUrl(normalizeDataPath(dataQuestionValue))
                : null;
            const dataQuestionText = !isAudioPath(dataQuestionValue) && !isImagePath(dataQuestionValue)
                ? (dataQuestionValue || null)
                : null;

            const optionsForPart12 = partNumber === 1
                ? ['A', 'B', 'C', 'D']
                : partNumber === 2
                    ? ['A', 'B', 'C']
                    : [];

            const optionsFromTypeTwo = [
                row.ContentAnswerA,
                row.ContentAnswerB,
                row.ContentAnswerC,
                row.ContentAnswerD
            ].filter((opt) => opt !== null && opt !== undefined && String(opt).trim() !== '');

            const options = optionsForPart12.length > 0
                ? optionsForPart12
                : optionsFromTypeTwo;

            const questionText = (partNumber === 1 || partNumber === 2)
                ? ''
                : (row.QuestionContent || extractQuestionTextFromTypeOneTranscript(row.TypeOneTranscript) || '');

            const questionImage = toAbsoluteMediaUrl(normalizeDataPath(row.Image));
            const sharedImageForReading = [5, 6, 7].includes(partNumber) ? dataQuestionImage : null;

            questionsByPart[String(partNumber)].push({
                id: Number(row.QuestionID),
                partNumber,
                questionNumber: Number(row.OrderNumber) - 1,
                groupId: row.DataQuestionID ? Number(row.DataQuestionID) : null,
                questionText,
                options,
                mediaFiles: {
                    audio: [1, 2, 3, 4].includes(partNumber) ? mainTestAudio : null,
                    image: questionImage || sharedImageForReading,
                    text: [5, 6, 7].includes(partNumber) ? dataQuestionText : null
                }
            });
        }

        return res.json({
            success: true,
            testId: test.TestID,
            testName: test.TestName,
            audio: mainTestAudio,
            questionsByPart
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTestResult = async (req, res) => {
    try {
        const { historyOfTestID } = req.params;
        const mediaBaseUrl = `${req.protocol}://${req.get('host')}`;
        const toAbsoluteMediaUrl = (value) => {
            if (!value) return null;
            if (/^https?:\/\//i.test(String(value))) return value;
            return `${mediaBaseUrl}${String(value).startsWith('/') ? '' : '/'}${value}`;
        };

        // 1. Lấy thông tin History để xác định TestID
        const history = await HistoryOfTest.findByPk(historyOfTestID, {
            include: [
                { model: Test, as: 'Test', attributes: ['TestID', 'TestName'] },
                { model: User, as: 'User', attributes: ['UserID', 'Name'] }
            ]
        });
        if (!history) {
            return res.status(404).json({ message: 'Không tìm thấy lượt thi này!' });
        }

        // 2. Query tổng hợp (Tổng quát + Chi tiết Listening/Reading)
        const result = await sequelize.query(`
            SELECT 
                -- TỔNG QUÁT
                SUM(CASE WHEN hq.Answer = q.AnswerCorrect THEN 1 ELSE 0 END) AS totalCorrect,
                SUM(CASE WHEN hq.Answer IS NOT NULL AND hq.Answer != q.AnswerCorrect THEN 1 ELSE 0 END) AS totalWrong,
                (COUNT(q.QuestionID) - COUNT(hq.QuestionID)) AS totalSkipped,
                COUNT(q.QuestionID) AS totalQuestions,

                -- CHI TIẾT PHẦN NGHE (Part 1, 2, 3, 4)
                SUM(CASE WHEN q.PartID IN (1, 2, 3, 4) AND hq.Answer = q.AnswerCorrect THEN 1 ELSE 0 END) AS correctListening,

                -- CHI TIẾT PHẦN ĐỌC (Part 5, 6, 7)
                SUM(CASE WHEN q.PartID IN (5, 6, 7) AND hq.Answer = q.AnswerCorrect THEN 1 ELSE 0 END) AS correctReading
            FROM question q
            LEFT JOIN historyoftest_question hq 
                ON q.QuestionID = hq.QuestionID 
                AND hq.HistoryoftestID = :historyId
            WHERE q.TestID = :testId
        `, {
            replacements: { 
                historyId: historyOfTestID, 
                testId: history.TestID 
            },
            type: QueryTypes.SELECT
        });

        const data = result[0];

        // 2.1 Query chi tiết từng câu hỏi để FE hiển thị showDetailPart
        const detailRows = await sequelize.query(`
            SELECT
                q.QuestionID,
                q.PartID,
                q.OrderNumber,
                q.AnswerCorrect,
                q.AnswerExplain,
                q.Image,
                ttq.QuestionContent,
                ttq.ContentAnswerA,
                ttq.ContentAnswerB,
                ttq.ContentAnswerC,
                ttq.ContentAnswerD,
                toq.Audio AS TypeOneAudio,
                toq.Transcript AS TypeOneTranscript,
                dq.DataQuestion,
                dq.Transcript,
                hq.Answer AS UserAnswer
            FROM question q
            LEFT JOIN typetwoquestion ttq ON ttq.QuestionID = q.QuestionID
            LEFT JOIN typeonequestion toq ON toq.QuestionID = q.QuestionID
            LEFT JOIN dataquestion dq ON dq.DataQuestionID = q.DataQuestionID
            LEFT JOIN historyoftest_question hq
                ON hq.QuestionID = q.QuestionID
                AND hq.HistoryoftestID = :historyId
            WHERE q.TestID = :testId
            ORDER BY q.OrderNumber ASC, q.QuestionID ASC
        `, {
            replacements: {
                historyId: historyOfTestID,
                testId: history.TestID
            },
            type: QueryTypes.SELECT
        });

        const userAnswer = detailRows.map((row) => {
            const partNumber = Number(row.PartID);
            const dataQuestionValue = String(row.DataQuestion || '').trim();
            const dataQuestionAudio = isAudioPath(dataQuestionValue)
                ? toAbsoluteMediaUrl(normalizeDataPath(dataQuestionValue))
                : null;
            const dataQuestionImage = isImagePath(dataQuestionValue)
                ? toAbsoluteMediaUrl(normalizeDataPath(dataQuestionValue))
                : null;
            const dataQuestionText = !isAudioPath(dataQuestionValue) && !isImagePath(dataQuestionValue)
                ? (dataQuestionValue || null)
                : null;

            const optionsFromTypeTwo = [
                row.ContentAnswerA,
                row.ContentAnswerB,
                row.ContentAnswerC,
                row.ContentAnswerD
            ].every((opt) => opt !== null && opt !== undefined && String(opt).trim() !== '')
                ? [
                    `A. ${row.ContentAnswerA}`,
                    `B. ${row.ContentAnswerB}`,
                    `C. ${row.ContentAnswerC}`,
                    `D. ${row.ContentAnswerD}`
                ]
                : [];

            const optionsFromTypeOneTranscript = parseOptionsFromTranscript(row.TypeOneTranscript);

            const resolvedOptions = optionsFromTypeTwo.length > 0
                ? optionsFromTypeTwo
                : optionsFromTypeOneTranscript;

            const resolvedQuestionText = row.QuestionContent
                || extractQuestionTextFromTypeOneTranscript(row.TypeOneTranscript);

            const resolvedTranscript = (partNumber === 1 || partNumber === 2)
                ? (row.AnswerExplain || '')
                : (row.Transcript || row.AnswerExplain || '');

            const resolvedAudio = (partNumber === 1 || partNumber === 2)
                ? toAbsoluteMediaUrl(normalizeDataPath(row.TypeOneAudio))
                : (partNumber === 3 || partNumber === 4)
                    ? dataQuestionAudio
                    : null;

            return {
                questionNumber: Number(row.OrderNumber) - 1,
                partNumber,
                userAnswer: row.UserAnswer ? String(row.UserAnswer).toUpperCase() : 'N/A',
                correctAnswer: row.AnswerCorrect ? String(row.AnswerCorrect).toUpperCase() : 'N/A',
                questionText: resolvedQuestionText || '',
                options: resolvedOptions,
                transcript: resolvedTranscript,
                mediaFiles: {
                    image: toAbsoluteMediaUrl(normalizeDataPath(row.Image)) || dataQuestionImage,
                    audio: resolvedAudio,
                    text: dataQuestionText
                }
            };
        });

        const correctListening = parseInt(data.correctListening || 0);
        const correctReading = parseInt(data.correctReading || 0);

        const listeningScore = getToeicSectionScore(correctListening, 'listening');
        const readingScore = getToeicSectionScore(correctReading, 'reading');
        const totalScore = listeningScore + readingScore;

        // 3. Trả về kết quả JSON chi tiết
        return res.json({
            success: true,
            historyOfTestID: parseInt(historyOfTestID),
            testName: history.Test ? history.Test.TestName : null,
            dateTest: history.Date,
            Name: history.User ? history.User.Name : null,
            userAnswer,
            data: {
                // Toàn bộ bài thi
                overall: {
                    correct: parseInt(data.totalCorrect || 0),
                    wrong: parseInt(data.totalWrong || 0),
                    skipped: parseInt(data.totalSkipped || 0),
                    total: parseInt(data.totalQuestions || 0)
                },
                // Chi tiết để tính điểm TOEIC
                details: {
                    correctListening,
                    correctReading
                },
                score: {
                    listening: listeningScore,
                    reading: readingScore,
                    total: totalScore
                }
            }
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const getAverageTestScoreByUser = async (req, res) => {
    try {
        const userId = req.params.userId || req.query.userId || req.user?.id;

        if (!userId || Number.isNaN(Number(userId))) {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const attempts = await sequelize.query(`
            SELECT
                h.HistoryOfTestID AS historyOfTestID,
                SUM(CASE WHEN q.PartID IN (1, 2, 3, 4) AND hq.Answer = q.AnswerCorrect THEN 1 ELSE 0 END) AS correctListening,
                SUM(CASE WHEN q.PartID IN (5, 6, 7) AND hq.Answer = q.AnswerCorrect THEN 1 ELSE 0 END) AS correctReading
            FROM historyoftest h
            JOIN question q ON q.TestID = h.TestID
            LEFT JOIN historyoftest_question hq
                ON hq.HistoryoftestID = h.HistoryOfTestID
                AND hq.QuestionID = q.QuestionID
            WHERE h.UserID = :userId
            GROUP BY h.HistoryOfTestID
            ORDER BY h.HistoryOfTestID DESC
        `, {
            replacements: { userId: Number(userId) },
            type: QueryTypes.SELECT
        });

        if (!attempts.length) {
            return res.json({
                success: true,
                userId: Number(userId),
                attemptCount: 0,
                averageScore: {
                    listening: 0,
                    reading: 0,
                    total: 0
                }
            });
        }

        const scoredAttempts = attempts.map((attempt) => {
            const correctListening = Number(attempt.correctListening) || 0;
            const correctReading = Number(attempt.correctReading) || 0;

            const listeningScore = getToeicSectionScore(correctListening, 'listening');
            const readingScore = getToeicSectionScore(correctReading, 'reading');

            return {
                listeningScore,
                readingScore,
                totalScore: listeningScore + readingScore
            };
        });

        const totals = scoredAttempts.reduce((acc, item) => {
            acc.listening += item.listeningScore;
            acc.reading += item.readingScore;
            acc.total += item.totalScore;
            return acc;
        }, { listening: 0, reading: 0, total: 0 });

        const roundToInt = (n) => Math.round(Number(n) || 0);

        return res.json({
            success: true,
            userId: Number(userId),
            attemptCount: scoredAttempts.length,
            averageScore: {
                listening: roundToInt(totals.listening / scoredAttempts.length),
                reading: roundToInt(totals.reading / scoredAttempts.length),
                total: roundToInt(totals.total / scoredAttempts.length)
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getResultListByUser = async (req, res) => {
    try {
        const userId = req.params.userId || req.query.userId || req.user?.id;

        if (!userId || Number.isNaN(Number(userId))) {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const attempts = await sequelize.query(`
            SELECT
                h.HistoryOfTestID AS historyOfTestID,
                h.Date AS dateTest,
                t.TestName AS testName,
                SUM(CASE WHEN q.PartID IN (1, 2, 3, 4) AND hq.Answer = q.AnswerCorrect THEN 1 ELSE 0 END) AS correctListening,
                SUM(CASE WHEN q.PartID IN (5, 6, 7) AND hq.Answer = q.AnswerCorrect THEN 1 ELSE 0 END) AS correctReading
            FROM historyoftest h
            JOIN test t ON t.TestID = h.TestID
            JOIN question q ON q.TestID = h.TestID
            LEFT JOIN historyoftest_question hq
                ON hq.HistoryoftestID = h.HistoryOfTestID
                AND hq.QuestionID = q.QuestionID
            WHERE h.UserID = :userId
            GROUP BY h.HistoryOfTestID, h.Date, t.TestName
            ORDER BY h.Date DESC, h.HistoryOfTestID DESC
        `, {
            replacements: { userId: Number(userId) },
            type: QueryTypes.SELECT
        });

        const resultList = attempts.map((attempt) => {
            const correctListening = Number(attempt.correctListening) || 0;
            const correctReading = Number(attempt.correctReading) || 0;
            const listeningScore = getToeicSectionScore(correctListening, 'listening');
            const readingScore = getToeicSectionScore(correctReading, 'reading');

            return {
                historyOfTestID: Number(attempt.historyOfTestID),
                testName: attempt.testName,
                scoreTotal: listeningScore + readingScore,
                dateTest: attempt.dateTest
            };
        });

        return res.json({
            success: true,
            userId: Number(userId),
            count: resultList.length,
            data: resultList
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getResultList = async (req, res) => {
    try {
        const attempts = await sequelize.query(`
            SELECT
                h.HistoryOfTestID AS historyOfTestID,
                t.TestID AS testId,
                h.Date AS dateTest,
                t.TestName AS testName,
                u.Name AS userName,
                SUM(CASE WHEN q.PartID IN (1, 2, 3, 4) AND hq.Answer = q.AnswerCorrect THEN 1 ELSE 0 END) AS correctListening,
                SUM(CASE WHEN q.PartID IN (5, 6, 7) AND hq.Answer = q.AnswerCorrect THEN 1 ELSE 0 END) AS correctReading
            FROM historyoftest h
            JOIN test t ON t.TestID = h.TestID
            JOIN user u ON u.UserID = h.UserID
            JOIN question q ON q.TestID = h.TestID
            LEFT JOIN historyoftest_question hq
                ON hq.HistoryoftestID = h.HistoryOfTestID
                AND hq.QuestionID = q.QuestionID
            GROUP BY h.HistoryOfTestID, t.TestID, h.Date, t.TestName, u.Name
            ORDER BY h.Date DESC, h.HistoryOfTestID DESC
        `, {
            type: QueryTypes.SELECT
        });

        const resultList = attempts.map((attempt) => {
            const correctListening = Number(attempt.correctListening) || 0;
            const correctReading = Number(attempt.correctReading) || 0;
            const listeningScore = getToeicSectionScore(correctListening, 'listening');
            const readingScore = getToeicSectionScore(correctReading, 'reading');

            return {
                historyOfTestID: Number(attempt.historyOfTestID),
                testId: Number(attempt.testId),
                testName: attempt.testName,
                userName: attempt.userName,
                scoreTotal: listeningScore + readingScore,
                dateTest: attempt.dateTest
            };
        });

        return res.json({
            success: true,
            count: resultList.length,
            data: resultList
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllTest,
    getTestByUserID,
    getTest,
    getTotalTestsCount,
    getTotalAttemptsByUser,
    getAverageTestScoreByUser,
    getResultListByUser,
    getResultList,
    createTest,
    uploadAudio,
    uploadImage,
    updateTest,
    setStatusTest,
    createQuestionGroup,
    getGroupsByPart,
    addSingleQuestion,
    addQuestionToGroup,
    getQuestionsByPartForManage,
    updateSingleQuestion,
    deleteQuestion,
    updateQuestionGroup,
    deleteQuestionGroup,
    getTestById,
    startTest,
    submitTest,
    getTestResult
};
