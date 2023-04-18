const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin-model");
const Task = require("../models/tasks-model");
const User = require("../models/user-model");
const Leave = require("../models/leave-model");
const HttpError = require("../models/http-error");

exports.signUp = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  let existingUser;
  try {
    existingUser = await Admin.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing in failed", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "Admin exists already, please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create admin, please try again",
      500
    );
    return next(error);
  }

  const createdUser = new Admin({
    name,
    email,
    password: hashedPassword,
    role,
    image:
      "https://img.freepik.com/premium-vector/freelance-sticker-logo-icon-vector-man-with-desktop-blogger-with-laptop-icon-vector-isolated-background-eps-10_399089-1098.jpg",
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing in failed, please try again.", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing in failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });
};

exports.getAdminUser = async (req, res, next) => {
  let users;
  try {
    users = await Admin.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching admin user failed, please try again later",
      500
    );
    return next(error);
  }
  res.json({
    users: users.map((user) =>
      user.toObject({
        getters: true,
      })
    ),
  });
};
exports.createTask = async (req, res, next) => {
  try {
    const {
      employeeId,
      title,
      description,
      taskgivendate,
      status,
      dueDate,
      priority,
    } = req.body;

    const task = new Task({
      employeeId,
      title,
      description,
      taskgivendate,
      status,
      dueDate,
      priority,
    });

    const createdTask = await task.save();
    const obj = {
      id: createdTask._id,
      employeeId: createdTask.employeeId,
      title: createdTask.title,
      description: createdTask.description,
      taskgivendate: createdTask.taskgivendate,
      status: createdTask.status,
      dueDate: createdTask.dueDate,
      priority: createdTask.priority,
    };

    res.json({
      message: "Task Created",
      createdTask: obj,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Creating task failed" });
  }
};

exports.taskGiven = async (req, res, next) => {
  let tasks;
  try {
    tasks = await Task.find({});
  } catch (err) {
    const error = new HttpError("Could not find the job", 500);
    return next(error);
  }
  res.json({
    tasks: tasks.map((task) =>
      task.toObject({
        getters: true,
      })
    ),
  });
};

exports.deleteTask = async (req, res, next) => {
  const taskId = req.params.tid;

  let task;
  try {
    task = await Task.findById(taskId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete task",
      500
    );
    return next(error);
  }

  if (!task) {
    const error = new HttpError("Could not find job details for this id", 404);
    return next(error);
  }

  try {
    await Task.deleteOne({ _id: taskId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrongs, could not delete task",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Task deleted." });
};

exports.deleteEmployee = async (req, res, next) => {
  const empId = req.params.eid;

  let employee;
  try {
    employee = await User.findById(empId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete employee",
      500
    );
    return next(error);
  }

  if (!employee) {
    const error = new HttpError(
      "Could not find employee details for this id",
      404
    );
    return next(error);
  }

  try {
    employee = await User.deleteOne({ _id: empId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrongs, could not delete employee",
      500
    );

    return next(error);
  }
  res.status(200).json({ message: "Employee deleted." });
};

exports.viewAllEmployes = async (req, res, next) => {
  let users;
  try {
    users = await User.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching employee failed, please try again later",
      500
    );
    return next(error);
  }
  res.json({
    users: users.map((user) =>
      user.toObject({
        getters: true,
      })
    ),
  });
};

exports.viewEmployeById = async (req, res, next) => {
  const employeesId = req.params.eid;

  let employee;

  try {
    employee = await User.findById(employeesId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find employee by this id",
      500
    );
    return next(error);
  }
  if (!employee) {
    const error = new HttpError("Could not find employee for this id", 404);
    return next(error);
  }
  res.json({ employee: employee.toObject({ getters: true }) });
};

exports.createEmployee = async (req, res, next) => {
  const { name, address, phone, dateofbirth, email, hireDate, password, role } =
    req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing in failed", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    address,
    phone,
    dateofbirth,
    hireDate,
    password: hashedPassword,
    role,
    image:
      "https://img.freepik.com/premium-vector/freelance-sticker-logo-icon-vector-man-with-desktop-blogger-with-laptop-icon-vector-isolated-background-eps-10_399089-1098.jpg",
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Creating user failed, please try again.", 500);
    console.log({ err });
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing in failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
    role: createdUser.role,
    expiresIn: 3600,
  });
};

exports.viewAllLeave = async (req, res, next) => {
  let users;
  try {
    users = await Leave.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching leave failed, please try again later",
      500
    );
    return next(error);
  }
  res.json({
    users: users.map((user) =>
      user.toObject({
        getters: true,
      })
    ),
  });
};
