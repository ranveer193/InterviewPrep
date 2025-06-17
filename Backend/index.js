const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require("./config/db");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

connectDB();

// const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');
// const oaRoutes = require('./routes/oa');

app.use('/interview', interviewRoutes);
// app.use('/oa', oaRoutes);
// app.use('/auth', authRoutes);

app.get('/',(req,res) => {
    res.status(200).json({
        message: "Welcome to the Interview Preparation API"
    });
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



