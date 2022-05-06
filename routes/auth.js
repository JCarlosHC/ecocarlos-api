const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const passwordEncrypted = CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString();
    const newUser = new User({ username, email, password: passwordEncrypted });

    try {
        const savedUser = await newUser.save()
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json(error);
    }
})

router.post('/login', async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username })
        !user && res.status(401).json("Wrong credentials")

        const passwordDecrypted = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC).toString(CryptoJS.enc.Utf8);
        req.body.password !== passwordDecrypted && res.status(401).json("Wrong credentials")

        const accessToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SEC,
            { expiresIn: "3d" }
        )

        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;