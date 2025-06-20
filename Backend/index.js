const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require("./config/db");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

connectDB();

const interviewRoutes = require('./routes/interview');
const oaRoutes = require('./routes/oa');
const aiRoutes = require('./routes/aiRoutes');

app.use('/interview', interviewRoutes);
app.use('/oa', oaRoutes);
app.use('/ai', aiRoutes);

app.get('/',(req,res) => {
    res.status(200).json({
        message: "Welcome to the Interview Preparation API"
    });
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



