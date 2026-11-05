const express = require('express');
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getAnnouncements);
router.post('/', adminOnly, createAnnouncement);
router.delete('/:id', adminOnly, deleteAnnouncement);

module.exports = router;
