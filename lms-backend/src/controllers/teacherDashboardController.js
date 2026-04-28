const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const Test = require('../models/Test');
const Course = require('../models/Course');

const toStartOfDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const toEndExclusive = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getTeacherDashboardStats = async (req, res) => {
  try {
    const teacherId = Number(req.user?.id);
    if (!teacherId) {
      return res.status(400).json({ message: 'Invalid teacher id' });
    }

    const startDate = toStartOfDay(req.query.startDate);
    const endDateExclusive = toEndExclusive(req.query.endDate);

    const whereSql = [
      'rc.TeacherID = :teacherId',
      "rc.status = 'confirmed'"
    ];
    const replacements = { teacherId };

    if (startDate) {
      whereSql.push('rc.ConfirmDate >= :startDate');
      replacements.startDate = startDate;
    }

    if (endDateExclusive) {
      whereSql.push('rc.ConfirmDate < :endDateExclusive');
      replacements.endDateExclusive = endDateExclusive;
    }

    const [revenueRows, totalRevenueRow] = await Promise.all([
      sequelize.query(
        `
          SELECT
            DATE(rc.ConfirmDate) AS date,
            COALESCE(SUM(rc.TotalAmountOfTeacher), 0) AS revenue
          FROM register_course rc
          WHERE ${whereSql.join(' AND ')}
          GROUP BY DATE(rc.ConfirmDate)
          ORDER BY DATE(rc.ConfirmDate) ASC
        `,
        {
          replacements,
          type: QueryTypes.SELECT
        }
      ),
      sequelize.query(
        `
          SELECT COALESCE(SUM(rc.TotalAmountOfTeacher), 0) AS totalRevenue
          FROM register_course rc
          WHERE ${whereSql.join(' AND ')}
        `,
        {
          replacements,
          type: QueryTypes.SELECT
        }
      )
    ]);

    const [totalTests, releasedCourses] = await Promise.all([
      Test.count({ where: { teacherID: teacherId } }),
      Course.count({ where: { TeacherID: teacherId, status: 1 } })
    ]);

    const revenueSeries = revenueRows.map((row) => ({
      date: row.date,
      revenue: Number(row.revenue || 0)
    }));

    return res.json({
      success: true,
      teacherId,
      range: {
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDateExclusive ? new Date(endDateExclusive.getTime() - 1).toISOString() : null
      },
      totalRevenue: Number(totalRevenueRow?.[0]?.totalRevenue || 0),
      totalTests: Number(totalTests || 0),
      releasedCourses: Number(releasedCourses || 0),
      revenueSeries
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTeacherDashboardStats
};
