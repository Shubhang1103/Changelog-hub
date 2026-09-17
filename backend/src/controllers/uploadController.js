/**
 * @desc    Upload cover image for changelog entries
 * @route   POST /api/v1/upload/cover
 * @access  Private/Admin
 */
const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file.',
      });
    }

    // Return the static relative path and full URL
    const relativePath = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    res.status(200).json({
      success: true,
      message: 'Cover image uploaded successfully.',
      data: {
        filename: req.file.filename,
        path: relativePath,
        url: fullUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCover,
};
