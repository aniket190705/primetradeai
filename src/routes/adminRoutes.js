const express = require("express");
const { getAdminSummary } = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin only routes
 */

/**
 * @swagger
 * /api/v1/admin/summary:
 *   get:
 *     summary: Get basic admin summary
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin summary fetched successfully
 */
router.get("/summary", protect, authorizeRoles("admin"), getAdminSummary);

module.exports = router;
