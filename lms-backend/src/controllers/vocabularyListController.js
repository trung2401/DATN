const VocabularyList = require('../models/VocabularyList');
const Vocabulary = require('../models/Vocabulary');
const User = require('../models/User');

const serializeVocabulary = (vocab) => ({
    vocabId: vocab.VocabID,
    listId: vocab.ListID,
    vocab: vocab.Vocab,
    mean: vocab.Mean,
    wordType: vocab.WordType,
    example: vocab.Example,
    pronunciation: vocab.pronunciation,
    status: vocab.status
});

const serializeVocabularyList = (list) => ({
    listId: list.ListID,
    userId: list.UserID,
    nameList: list.NameList,
    description: list.Description,
    // user: list.User ? {
    //     userId: list.User.UserID,
    //     userName: list.User.UserName,
    //     name: list.User.Name
    // } : null
});

const getAllVocabularyLists = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const { Op } = require('sequelize');

        const { count, rows } = await VocabularyList.findAndCountAll({
            where: {
                [Op.or]: [
                    { NameList: { [Op.like]: `%${search}%` } },
                    { Description: { [Op.like]: `%${search}%` } }
                ]
            },
            include: [{
                model: User,
                as: 'User',
                attributes: ['UserID', 'UserName', 'Name']
            }],
            limit,
            offset,
            order: [['ListID', 'DESC']]
        });

        return res.json({
            success: true,
            data: rows.map(serializeVocabularyList),
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getVocabularyListDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const list = await VocabularyList.findByPk(id, {
            include: [{
                model: User,
                as: 'User',
                attributes: ['UserID', 'UserName', 'Name']
            }]
        });

        if (!list) {
            return res.status(404).json({ message: 'Vocabulary list not found!' });
        }

        return res.json({
            success: true,
            data: serializeVocabularyList(list)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const createVocabularyList = async (req, res) => {
    try {
        const { userId, nameList, description } = req.body;

        if (!nameList) {
            return res.status(400).json({ message: 'Missing required field: nameList' });
        }

        const payloadUserId = userId || req.user?.id || null;

        const newList = await VocabularyList.create({
            UserID: payloadUserId,
            NameList: nameList,
            Description: description || null
        });

        const created = await VocabularyList.findByPk(newList.ListID, {
            include: [{
                model: User,
                as: 'User',
                attributes: ['UserID', 'UserName', 'Name']
            }]
        });

        return res.status(201).json({
            message: 'Vocabulary list created successfully!',
            data: serializeVocabularyList(created)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateVocabularyList = async (req, res) => {
    try {
        const { id } = req.params;
        const { nameList, description } = req.body;

        const [updatedRows] = await VocabularyList.update({
            NameList: nameList,
            Description: description
        }, {
            where: { ListID: id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Vocabulary list not found or no changes were made.' });
        }

        const updated = await VocabularyList.findByPk(id, {
            include: [{
                model: User,
                as: 'User',
                attributes: ['UserID', 'UserName', 'Name']
            }]
        });

        return res.json({
            message: 'Vocabulary list updated successfully!',
            data: serializeVocabularyList(updated)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteVocabularyList = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRows = await VocabularyList.destroy({ where: { ListID: id } });
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Vocabulary list not found to delete' });
        }

        return res.json({ message: 'Vocabulary list deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllVocabularyOfList = async (req, res) => {
    try {
        const { id } = req.params;

        const list = await VocabularyList.findByPk(id);
        if (!list) {
            return res.status(404).json({ message: 'Vocabulary list not found!' });
        }

        const vocabularies = await Vocabulary.findAll({
            where: { ListID: id },
            order: [['VocabID', 'ASC']]
        });

        return res.json({
            success: true,
            list: {
                listId: list.ListID,
                nameList: list.NameList,
                description: list.Description
            },
            data: vocabularies.map(serializeVocabulary)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllVocabularyListsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const lists = await VocabularyList.findAll({
            where: { UserID: userId },
            attributes: ['ListID', 'NameList', 'Description'],
            order: [['NameList', 'ASC'], ['ListID', 'ASC']]
        });

        return res.json({
            success: true,
            data: lists.map((list) => ({
                listId: list.ListID,
                nameList: list.NameList,
                description: list.Description
            }))
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllVocabularyLists,
    getVocabularyListDetail,
    createVocabularyList,
    updateVocabularyList,
    deleteVocabularyList,
    getAllVocabularyOfList,
    getAllVocabularyListsByUserId
};
