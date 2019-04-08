const mongoose = require("../../database");
const bcrypt = require("bcryptjs");

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define a model, passando o nome e o schema
const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
