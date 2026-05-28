const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const sequelize = require('../config/db');
const Test = require('../models/Test');
const Question = require('../models/Question');
const TypeOneQuestion = require('../models/TypeOneQuestion');
const TypeTwoQuestion = require('../models/TypeTwoQuestion');
const DataQuestion = require('../models/DataQuestion');

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

const normalizeOptionalMediaOrText = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  return /^(https?:\/\/|\/?data\/)/i.test(normalized) || /\.(mp3|wav|m4a|ogg|flac|jpg|jpeg|png|gif|webp|avif|svg)$/i.test(normalized)
    ? toDbDataPath(normalized)
    : normalized;
};

const normalizeAnswer = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized || null;
};

function parseRows(partId, rows) {
  if (!rows || rows.length < 2) return { error: 'File trống hoặc thiếu header.' };
  const header = rows[0].map(String);
  const data = rows.slice(1).filter(r => r.some(c => c !== ''));

  if (SINGLE_PARTS.includes(Number(partId))) {
    const questions = data.map((row, i) => {
      const obj = {};
      header.forEach((col, ci) => { obj[col] = row[ci] ?? ''; });
      return {
        orderNumber: Number(obj.orderNumber) || (i + 1),
        answerCorrect: String(obj.answerCorrect || '').toUpperCase(),
        answerExplain: obj.answerExplain || null,
        image: normalizeOptionalMediaOrText(obj.image),
        typeOne: ({ audio: normalizeOptionalMediaOrText(obj.audio), transcript: obj.transcript || null }),
        typeTwo: ({
          questionContent: obj.questionContent || null,
          contentAnswerA: obj.answerA || null,
          contentAnswerB: obj.answerB || null,
          contentAnswerC: obj.answerC || null,
          contentAnswerD: obj.answerD || null,
        }),
      };
    });
    return { type: 'single', questions };
  }

  const groups = [];
  let currentGroup = null;
  for (const row of data) {
    const obj = {};
    header.forEach((col, ci) => { obj[col] = row[ci] ?? ''; });
    const rowType = String(obj.rowType || '').toUpperCase();
    if (rowType === 'GROUP') {
      currentGroup = {
        groupOrder: Number(obj.groupOrder) || null,
        dataQuestion: normalizeOptionalMediaOrText(obj.dataQuestion),
        transcript: obj.groupTranscript || null,
        questions: [],
      };
      groups.push(currentGroup);
    } else if (rowType === 'QUESTION' && currentGroup) {
      currentGroup.questions.push({
        orderNumber: Number(obj.orderNumber) || null,
        answerCorrect: String(obj.answerCorrect || '').toUpperCase(),
        answerExplain: obj.answerExplain || null,
        image: normalizeOptionalMediaOrText(obj.image),
        typeTwo: {
          questionContent: obj.questionContent || null,
          contentAnswerA: obj.answerA || null,
          contentAnswerB: obj.answerB || null,
          contentAnswerC: obj.answerC || null,
          contentAnswerD: obj.answerD || null,
        }
      });
    }
  }
  return { type: 'group', groups };
}

const importXlsx = async (req, res) => {
  try {
    const testId = Number(req.params.testId);
    const partId = Number(req.query.partId || req.body.partId);

    if (!testId || Number.isNaN(testId)) return res.status(400).json({ message: 'Invalid testId' });
    if (!partId || Number.isNaN(partId)) return res.status(400).json({ message: 'Invalid partId' });

    const test = await Test.findByPk(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    if (Number(test.teacherID) !== Number(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const filePath = path.resolve(req.file.path || path.join(__dirname, '../../data', req.file.filename));
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    const parsed = parseRows(partId, rows);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const transaction = await sequelize.transaction();
    try {
      if (parsed.type === 'single') {
        for (const q of parsed.questions) {
          if (![1,2,5].includes(partId)) continue;
          const maxOrder = await Question.max('OrderNumber', { where: { TestID: testId }, transaction });
          const question = await Question.create({
            PartID: partId,
            TestID: testId,
            AnswerCorrect: normalizeAnswer(q.answerCorrect),
            AnswerExplain: q.answerExplain ?? null,
            OrderNumber: Number(q.orderNumber) || (Number(maxOrder || 0) + 1),
            Image: q.image || null,
            DataQuestionID: null
          }, { transaction });

          if ([1,2].includes(partId)) {
            await TypeOneQuestion.create({ QuestionID: question.QuestionID, Audio: q.typeOne?.audio || null, Transcript: q.typeOne?.transcript || null }, { transaction });
          }
          if (partId === 5) {
            await TypeTwoQuestion.create({ QuestionID: question.QuestionID, QuestionContent: q.typeTwo?.questionContent || null, ContentAnswerA: q.typeTwo?.contentAnswerA || null, ContentAnswerB: q.typeTwo?.contentAnswerB || null, ContentAnswerC: q.typeTwo?.contentAnswerC || null, ContentAnswerD: q.typeTwo?.contentAnswerD || null }, { transaction });
          }
        }
      } else {
        // groups
        for (const g of parsed.groups) {
          if (!GROUP_PARTS.includes(partId)) continue;
          const maxOrder = await DataQuestion.max('OrderNumber', { where: { TestsID: testId, OrderNumberPart: partId }, transaction });
          const created = await DataQuestion.create({ DataQuestion: g.dataQuestion || null, Transcript: g.transcript || null, TestsID: testId, OrderNumberPart: partId, OrderNumber: Number(g.groupOrder) || (Number(maxOrder || 0) + 1) }, { transaction });
          const dgId = created.DataQuestionID;
          for (const q of g.questions) {
            const maxQOrder = await Question.max('OrderNumber', { where: { TestID: testId }, transaction });
            const question = await Question.create({ PartID: partId, TestID: testId, AnswerCorrect: normalizeAnswer(q.answerCorrect), AnswerExplain: q.answerExplain ?? null, OrderNumber: Number(q.orderNumber) || (Number(maxQOrder || 0) + 1), Image: q.image || null, DataQuestionID: dgId }, { transaction });
            // grouped parts use TypeTwo
            await TypeTwoQuestion.create({ QuestionID: question.QuestionID, QuestionContent: q.typeTwo?.questionContent || null, ContentAnswerA: q.typeTwo?.contentAnswerA || null, ContentAnswerB: q.typeTwo?.contentAnswerB || null, ContentAnswerC: q.typeTwo?.contentAnswerC || null, ContentAnswerD: q.typeTwo?.contentAnswerD || null }, { transaction });
          }
        }
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    } finally {
      // remove uploaded file
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }

    return res.json({ success: true, message: 'Import completed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { importXlsx };
