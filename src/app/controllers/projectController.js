const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Project = require("../models/project");
const Task = require("../models/Task");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate(["user", "tasks"]);

    return res.send({ projects, user: req.userId });
  } catch (err) {
    return res.status(400).send({ error: "Error loading projects " + err });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const projects = await Project.findById(req.params.projectId).populate([
      "user",
      "tasks"
    ]);

    return res.send({ projects, user: req.userId });
  } catch (err) {
    return res.status(400).send({ error: "Error loading project " + err });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    const project = await Project.create({
      title,
      description,
      user: req.userId
    });

    await Promise.all(
      tasks.map(async task => {
        const projectTask = new Task({ ...task, project: project._id });

        // 1ª maneira de salvas por causa do retorno de Promisses
        await projectTask.save();
        project.tasks.push(projectTask);
      })
    );
    await project.save();

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: "Error creating new Project " + err });
  }
});

router.put("/:projectId", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    // o new: true serve para retornar com o dado atualizado, pois por padrao, o mongoose
    // retorna o valor antigo ao ser atualizado
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        title,
        description
      },
      { new: true }
    );

    project.tasks = [];
    await Task.remove({ project: project._id });

    await Promise.all(
      tasks.map(async task => {
        const projectTask = new Task({ ...task, project: project._id });

        // 1ª maneira de salvas por causa do retorno de Promisses
        await projectTask.save();
        project.tasks.push(projectTask);
      })
    );
    await project.save();

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: "Error updating new Project " + err });
  }
});

router.delete("/:projectId", async (req, res) => {
  try {
    await Project.findByIdAndRemove(req.params.projectId);

    return res.send();
  } catch (err) {
    return res.status(400).send({ error: "Error deleting projects " + err });
  }
});

module.exports = app => app.use("/projects", router);
