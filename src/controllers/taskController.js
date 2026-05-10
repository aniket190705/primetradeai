const mongoose = require("mongoose");
const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  getTaskCacheKey,
  getCachedTasks,
  setCachedTasks,
  clearTaskCache,
} = require("../cache/taskCache");

const getTasks = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const skip = (page - 1) * limit;
  const cacheKey = getTaskCacheKey(req.user._id, page, limit, search);

  const cachedData = await getCachedTasks(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: cachedData,
      cached: true,
    });
  }

  const query = {
    createdBy: req.user._id,
  };

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const [tasks, total] = await Promise.all([
    Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Task.countDocuments(query),
  ]);

  const responseData = {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  await setCachedTasks(cacheKey, responseData);

  res.status(200).json({
    success: true,
    message: "Tasks fetched successfully",
    data: responseData,
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Invalid task id", 400);
  }

  const task = await Task.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Task fetched successfully",
    data: task,
  });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await clearTaskCache(req.user._id);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Invalid task id", 400);
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: req.params.id,
      createdBy: req.user._id,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  await clearTaskCache(req.user._id);

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Invalid task id", 400);
  }

  const query = { _id: req.params.id };

  if (req.user.role !== "admin") {
    query.createdBy = req.user._id;
  }

  const task = await Task.findOneAndDelete(query);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  await clearTaskCache(req.user._id);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
