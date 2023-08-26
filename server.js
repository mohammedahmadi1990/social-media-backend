const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const uploadRoutes = require('./routes/upload'); // Import the new upload route

// DB Connection
const connectDB = require('./config/db');

const app = express();

// Connect to database
connectDB();

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes); // Use the upload route

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
