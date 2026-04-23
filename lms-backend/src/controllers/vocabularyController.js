const Vocabulary = require('../models/Vocabulary');
const VocabularyList = require('../models/VocabularyList');

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

const ensureListOwnership = async (listId, userId) => {
    const list = await VocabularyList.findByPk(listId);
    if (!list) {
        return { ok: false, status: 404, message: 'Vocabulary list not found!' };
    }

    if (!list.UserID || Number(list.UserID) !== Number(userId)) {
        return { ok: false, status: 403, message: 'Forbidden: You are not the owner of this vocabulary list.' };
    }

    return { ok: true, list };
};

const addVocabulary = async (req, res) => {
    try {
        const { id } = req.params; // listId
        const { vocab, mean, wordType, example, pronunciation, status } = req.body;

        if (!vocab) {
            return res.status(400).json({ message: 'Missing required field: vocab' });
        }

        const ownership = await ensureListOwnership(id, req.user.id);
        if (!ownership.ok) {
            return res.status(ownership.status).json({ message: ownership.message });
        }

        const created = await Vocabulary.create({
            ListID: id,
            Vocab: vocab,
            Mean: mean || null,
            WordType: wordType || null,
            Example: example || null,
            pronunciation: pronunciation || null,
            status: status !== undefined ? Number(status) : 0
        });

        return res.status(201).json({
            message: 'Vocabulary created successfully!',
            data: serializeVocabulary(created)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateVocabulary = async (req, res) => {
    try {
        const { vocabId } = req.params;
        const { vocab, mean, wordType, example, pronunciation, status } = req.body;

        const vocabulary = await Vocabulary.findByPk(vocabId);
        if (!vocabulary) {
            return res.status(404).json({ message: 'Vocabulary not found!' });
        }

        const ownership = await ensureListOwnership(vocabulary.ListID, req.user.id);
        if (!ownership.ok) {
            return res.status(ownership.status).json({ message: ownership.message });
        }

        await vocabulary.update({
            Vocab: vocab ?? vocabulary.Vocab,
            Mean: mean ?? vocabulary.Mean,
            WordType: wordType ?? vocabulary.WordType,
            Example: example ?? vocabulary.Example,
            pronunciation: pronunciation ?? vocabulary.pronunciation,
            status: status !== undefined ? Number(status) : vocabulary.status
        });

        return res.json({
            message: 'Vocabulary updated successfully!',
            data: serializeVocabulary(vocabulary)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteVocabulary = async (req, res) => {
    try {
        const { vocabId } = req.params;

        const vocabulary = await Vocabulary.findByPk(vocabId);
        if (!vocabulary) {
            return res.status(404).json({ message: 'Vocabulary not found!' });
        }

        const ownership = await ensureListOwnership(vocabulary.ListID, req.user.id);
        if (!ownership.ok) {
            return res.status(ownership.status).json({ message: ownership.message });
        }

        await vocabulary.destroy();

        return res.json({ message: 'Vocabulary deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getMyVocab = async (req, res) => {
    try {
        const userId = req.user.id;

        // Tìm danh sách từ vựng của user (mặc định 1 list/user)
        const list = await VocabularyList.findOne({
            where: { UserID: userId },
            order: [['ListID', 'ASC']]
        });

        if (!list) {
            return res.status(404).json({ message: 'Không có danh sách từ vựng' });
        }

        const words = await Vocabulary.findAll({
            where: { ListID: list.ListID },
            order: [['VocabID', 'ASC']]
        });

        return res.json({
            success: true,
            listId: list.ListID,
            words: words.map(serializeVocabulary)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
    getMyVocab
};
