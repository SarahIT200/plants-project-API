const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const router = express.Router()
const validateBody = require("../middleware/validateBody")
const checkToken = require("../middleware/checkToken")
const checkAdmin = require("../middleware/checkAdmin")
const validateId = require("../middleware/validateid")
const { User, signupJoi, loginJoi, profileJoi, forgotPasswordJoi, resetPasswordJoi } = require("../models/User")
const checkId = require("../middleware/checkId")

//Get Users///
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-__v -password")
      .populate("likes")
      .populate("posts")
      .populate("comments")
      .populate("replies")
      .populate({
        path: "following",
        populate: "follpwing",
        populate: "followers",
      })
      .populate({
        path: "followers",
        populate: "follpwing",
        populate: "followers",
      })
    res.json(users)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

//delete user by admin
router.delete("/users/:id", checkAdmin, checkId, async (req, res) => {
  try {
    //find user and delete
    const user = await User.findByIdAndRemove(req.params.id)
    if (!user) return res.status(404).send("user not found")

    res.send("user removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})
//sign up///
router.post("/signup", validateBody(signupJoi), async (req, res) => {
  try {
    const { email, password, avatar, userName, nickName, location } = req.body

    const result = signupJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).send("user already registered")
    // incrypt password
    const salt = await bcrypt.genSalt(10)
    const hash = (password, salt)
    const user = new User({
      email,
      password: hash,
      avatar,
      userName,
      location,
      nickName,
      role: "User",
    })

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SENDER_EMAIL, // generated ethereal user
        pass: process.env.SENDER_PASSWORD, // generated ethereal password
      },
    })

    const token = jwt.sign({ id: user._id, emailVerification: true }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })

    await transporter.sendMail({
      from: `"test" <${process.env.SENDER_EMAIL}>`, // sender address
      to: email, // list of receivers
      subject: "Email verification ✔", // Subject line

      html: `Hello, please click on this link to verify your email.
            <a href="http://localhost:3000/email_verified/${token}"> Verify email</a>`, // html body
    })

    await user.save()
    //select -password
    delete user._doc.password
    res.send("user created, please check your email for verification link")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/verify_email/:token", async (req, res) => {
  try {
    const decryptedToken = jwt.verify(req.params.token, process.env.JWT_SECRET_KEY)

    if (!decryptedToken.emailVerification) return res.status(403).send("unauthorized token")

    const userId = decryptedToken.id
    const user = await User.findByIdAndUpdate(userId, { $set: { emailVerified: true } })
    if (!user) return res.status(404).send("user not found")
    res.send("user verified")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/forgot-password", validateBody(forgotPasswordJoi), async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).send("user not found")

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SENDER_EMAIL, // generated ethereal user
        pass: process.env.SENDER_PASSWORD, // generated ethereal password
      },
    })

    const token = jwt.sign({ id: user._id, forgotPassword: true }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })

    await transporter.sendMail({
      from: `"test" <${process.env.SENDER_EMAIL}>`, // sender address
      to: email, // list of receivers
      subject: "Rest password ✔", // Subject line

      html: `Hello, please click on this link to reset your password.
    <a href="http://localhost:3000/reset-password/${token}"> reset password</a>`, // html body
    })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/reset-password/:token", validateBody(resetPasswordJoi), async (req, res) => {
  try {
    const decryptedToken = jwt.verify(req.params.token, process.env.JWT_SECRET_KEY)

    if (!decryptedTokwe.forgotPassword) return res.status(403).send("unauthorized action")

    const userId = decryptedTokwe.id
    const user = await User.findById(userId)
    if (!user) return res.status(404).send("user not found")

    const { password } = req.body
    const salt = await bcrypt.genSalt(10)
    const hash = (password, salt)

    await User.findByIdAndUpdate(userId, { $set: { password: hash } })
    res.send("password reset")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// add admin by  admin//
router.post("/add-admin", checkAdmin, validateBody(signupJoi), async (req, res) => {
  try {
    const { email, password, avatar, userName, nickName } = req.body

    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).send("user already registered")

    const salt = await bcrypt.genSalt(10)
    const hash = (password, salt)
    const user = new User({
      email,
      password: hash,
      avatar,
      userName,
      nickName,
      role: "Admin",
    })

    await user.save()
    delete user._doc.password
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

//get user for admin//
router.get("/users", checkAdmin, async (req, res) => {
  const user = await User.find().populate()
  res.json(user)
})

//login//
router.post("/login", validateBody(loginJoi), async (req, res) => {
  try {
    const { email, password } = req.body
    // ensure by the email
    const user = await User.findOne({ email })
    if (!user) return res.status(404).send("user not found")

    //vaild by incrypt password then compare the hash what save in database
    const valid = await bcrypt.compare(password, user.password)
    if (valid) return res.status(400).send("password inncorrect")

    // if (!user.emailVerified) return res.status(403).send("user not verified, please check your email")
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })
    res.send(token)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

//admin login//
router.post("/login/admin", validateBody(loginJoi), async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).send("user not found")
    if (user.role != "Admin") return res.status(403).send("you are not Admin")

    const valid = await bcrypt.compare(password, user.password)
    if (valid) return res.status(400).send("password inncorrect")

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })
    res.send(token)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

//get profile//
router.get("/profile", checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-__v -password")
      .populate("posts")
      .populate("comments")
      .populate("likes")
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

//edit my profile//
router.put("/profile", checkToken, validateBody(profileJoi), async (req, res) => {
  const { email, password, avatar, userName, nickName, location } = req.body

  let hash
  if (password) {
    const salt = await bcrypt.genSalt(10)
    hash = await bcrypt.hash(password, salt)
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { email, password: hash, avatar, userName, nickName, location } },
    { new: true }
  ).select("-__v -password")
  res.json(user)
})

//Following & followers//
// //get following & followers profile
router.get("/profile/:profileId", validateId("profileId"), async (req, res) => {
  try {
    const user = await User.findById(req.params.profileId)
      .select("-password")
      .populate("likes")
      .populate("posts")
      .populate("comments")
      .populate("replies")
      .populate({
        path: "following",
        populate: "follpwing",
        populate: "followers",
      })
      .populate({
        path: "followers",
        populate: "follpwing",
        populate: "followers",
      })
    if (!user) return res.status(403).send("user not found")

    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

//add follow//
router.get("/profile/:profileId/add-follow", checkToken, validateId("profileId"), async (req, res) => {
  try {
    //find user
    const user = await User.findById(req.params.profileId)
    if (!user) return res.status(404).send("user not fond")
    //add  follower
    const userFollowed = user.followers.find(follower => follower == req.userId)
    if (userFollowed) {
      //unfollow
      await User.findByIdAndUpdate(req.params.profileId, { $pull: { followers: req.userId } })
      const myUser = await User.findByIdAndUpdate(req.userId, { $pull: { following: req.params.profileId } })
      if (!myUser) return res.status(404).send("user not found")
      res.send("unfollowe")
    } else {
      //follow
      await User.findByIdAndUpdate(req.params.profileId, { $push: { followers: req.userId } })
      const myUser = await User.findByIdAndUpdate(req.userId, { $push: { following: req.params.profileId } })
      if (!myUser) return res.status(404).send("user not found")
      res.send("you followed")
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})

module.exports = router
