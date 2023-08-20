const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to the database
connectDB();

// ... Rest of your app logic ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
