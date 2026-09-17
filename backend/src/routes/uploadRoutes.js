const express = require('express');
const router = express.Router();
const { uploadCover } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadCoverImage } = require('../middleware/uploadMiddleware');

// Admin only route for uploading changelog cover images
router.post('/cover', protect, adminOnly, uploadCoverImage.single('coverImage'), uploadCover);

module.exports = router;
