const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
require('dotenv').config();

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use('/data', express.static(path.join(__dirname, '../data')));

// tao connect db
sequelize.authenticate()
    .then(() => console.log('ket noi mysql thanh cong') )
    .catch(err => console.log('ket noi that bai: ', err));

const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const courseRoutes = require('./routes/courseRoutes');
app.use('/api/course', courseRoutes);

const vocabularyListRoutes = require('./routes/vocabularyListRoutes');
app.use('/api/vocabulary-list', vocabularyListRoutes);

const partRoutes = require('./routes/partRoutes');
app.use('/api/part', partRoutes);

const lessionRoutes = require('./routes/lessionRoutes');
app.use('/api/lession', lessionRoutes);

const registerCourseRoutes = require('./routes/registerCourseRoutes');
app.use('/api/register-course', registerCourseRoutes);

const testRoutes = require('./routes/testRoutes');
app.use('/api/test', testRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});