const express = require('express');
const multer = require('multer');
const router = express.Router();

// Set up multer storage (you can customize this to save files with specific names or paths)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/') // 'uploads' is the folder where images will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Route to handle file uploads
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  
  // You can save the path in a database, or send it back to the client
  res.json({ path: req.file.path });
});

module.exports = router;
