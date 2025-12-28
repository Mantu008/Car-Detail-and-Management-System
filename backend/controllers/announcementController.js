const Announcement = require("../models/Announcement");
const { broadcastAnnouncement } = require("../config/socket");

// @desc    Get Active Announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ active: true }).sort({
            createdAt: -1,
        });

        res.json({
            success: true,
            count: announcements.length,
            data: announcements,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Create Announcement (Admin)
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, expiresAt } = req.body;

        const announcement = await Announcement.create({
            title,
            message,
            type,
            expiresAt,
            createdBy: req.user._id,
        });

        // Broadcast the new announcement to all connected users
        broadcastAnnouncement(announcement);

        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete Announcement (Admin)
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res
                .status(404)
                .json({ success: false, message: "Announcement not found" });
        }

        await Announcement.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Announcement removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
};
