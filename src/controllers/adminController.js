const User = require("../models/User");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

const getAdminSummary = asyncHandler(async (req, res) => {
  const [users, tasks, admins] = await Promise.all([
    User.countDocuments(),
    Task.countDocuments(),
    User.countDocuments({ role: "admin" }),
  ]);

  res.status(200).json({
    success: true,
    message: "Admin summary fetched successfully",
    data: {
      totalUsers: users,
      totalTasks: tasks,
      totalAdmins: admins,
    },
  });
});

module.exports = {
  getAdminSummary,
};
