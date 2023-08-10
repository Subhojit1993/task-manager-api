const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();
const { sendWelcomeEmail, cancelledMail } = require('../emails/account');

// setting up the route handlers for the users

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    console.log("user", user);
    try {
        await user.save();
        await sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token, loggedIn: true });
    } catch (e) {
        res.status(400).send();
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send({ loggedOut: true });
    } catch (error) {
        res.status(500).send();
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send({ loggedOutofAllSessions: true });
    } catch (error) {
        res.status(500).send();
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

// Update data

// options

// with new set to true, its going to return the new user as opposed to the existing one that was found before the update

// with new set to true, we will have the original user with the updates applied

// runValidators makes sure we do run validations for the update, 
// example: if I want to update my 'name' => the property that doesn't exist in the database, I want to make sure that fails

// anytime we are allowing the user to write data to the database we want to make sure we validate it, so that it comes in the format we are expecting..

router.patch('/users/me', auth, async (req, res) => {
    const { user } = req;

    // property validations
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperations = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperations) {
        return res.status(400).send({ error: "Invalid operations!" });
    }

    try {
        // const user = await User.findById(_id);
        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.deleteOne();
        await cancelledMail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload jpg, jpeg or png images'))
        }
        cb(undefined, true);
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send({ deleted: true });
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar);

    } catch (error) {
        res.status(404).send();
    }
})

module.exports = router;