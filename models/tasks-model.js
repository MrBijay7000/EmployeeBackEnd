const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  // employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  employeeName: { type: String, required: true },
  taskName: { type: String, required: true },
  // assignedTo: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
  description: { type: String, required: true },
  taskgivendate: { type: Date, required: true, default: Date.now },
  status: {
    type: String,
    enum: ["Not started", "In progress", "Completed"],
    default: "Not started",
  },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
});

module.exports = mongoose.model("Task", taskSchema);
