const Part = require('../models/Part');

const getAllParts = async (req, res) => {
    try {
        const parts = await Part.findAll({
            order: [['PartID', 'ASC']]
        });

        return res.json({
            success: true,
            data: parts.map((part) => ({
                partId: part.PartID,
                partName: part.PartName
            }))
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllParts };
