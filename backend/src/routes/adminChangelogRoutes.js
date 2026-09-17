const express = require('express');
const router = express.Router();
const {
  getAllChangelogs,
  createChangelog,
  getChangelogById,
  updateChangelog,
  togglePublishStatus,
  deleteChangelog,
} = require('../controllers/adminChangelogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createChangelogSchema,
  updateChangelogSchema,
  publishToggleSchema,
} = require('../schemas/changelogSchemas');

// All routes here require protect + adminOnly
router.use(protect, adminOnly);

router.get('/', getAllChangelogs);
router.post('/', validate(createChangelogSchema), createChangelog);
router.get('/:id', getChangelogById);
router.put('/:id', validate(updateChangelogSchema), updateChangelog);
router.delete('/:id', deleteChangelog);
router.patch('/:id/publish', validate(publishToggleSchema), togglePublishStatus);

module.exports = router;
