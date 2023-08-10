const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

// setting up the route handlers for the tasks

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }

    /* task.save().then(() => {
        res.status(201).send(task);
    }).catch((error) => {
        res.status(400).send(error);
    }) */
})

// GET /tasks?completed=false
// GET /tasks?limit=10&skip=20
router.get('/tasks', auth, async (req, res) => {

    const { completed, limit, skip, sortBy } = req.query;
    const sort = {};

    const match = {};
    const options = {};

    if (completed) {
        match.completed = completed === "true";
    }

    if (sortBy) {
        const parts = sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    options.limit = parseInt(limit);
    options.skip = parseInt(skip);
    options.sort = sort;

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options
        });
        res.send(req.user.tasks);
    } catch (error) {
        res.status(500).send()
    }

    /* Task.find({}).then(tasks => {
        res.send(tasks);
    }).catch(error => {
        res.status(500).send()
    }); */
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) return res.status(404).send()
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }

    /* Task.findById(id).then(task => {
        if (!task) return res.status(404).send()
        res.send(task);
    }).catch(error => {
        res.status(400).send(error);
    }) */
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send({ error: "Invalid operation!" })

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        // const task = await Task.findById(id);

        /* const task = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }); */

        if (!task) return res.status(404).send();

        updates.forEach((update) => task[update] = req.body[update])

        await task.save();

        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    // const { id } = req.params;
    const _id = req.params.id;

    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
        if (!task) return res.status(404).send({ error: "Task not found! " });
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})

module.exports = router;

