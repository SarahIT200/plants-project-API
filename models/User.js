const mongoose = require("mongoose")
const Joi = require("joi")

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  avatar: String,
  userName: String,
  nickName: String,
  // emailVerified: {
  //   type: Boolean,
  //   default: false,
  // },
  following: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  posts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  ],
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  ],
  replies: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Replay",
    },
  ],
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  ],
  location: String,
  bio: String,
  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
  },
})

const signupJoi = Joi.object({
  email: Joi.string().min(2).max(100).required(),
  password: Joi.string().min(8).max(100).required(),
  avatar: Joi.string().uri().min(8).max(1000).required(),
  userName: Joi.string().min(2).max(100).required(),
  nickName: Joi.string().min(0).max(100).required(),
  location: Joi.string().min(0).max(100).required(),
})

const loginJoi = Joi.object({
  email: Joi.string().min(2).max(100).required(),
  password: Joi.string().min(8).max(100).required(),
})

const profileJoi = Joi.object({
  password: Joi.string().min(8).max(100).allow(""),
  avatar: Joi.string().uri().min(8).max(1000),
  userName: Joi.string().min(2).max(100),
  nickName: Joi.string().min(0).max(100),
  location: Joi.string().min(0).max(100),
  bio: Joi.string().min(0).max(300),
})

const forgotPasswordJoi = Joi.object({
  password: Joi.string().min(8).max(100).required(),
})

const resetPasswordJoi = Joi.object({
  password: Joi.string().min(8).max(100).required(),
})

const User = mongoose.model("User", userSchema)
module.exports.User = User
module.exports.signupJoi = signupJoi
module.exports.resetPasswordJoi = resetPasswordJoi
module.exports.forgotPasswordJoi = forgotPasswordJoi
module.exports.profileJoi = profileJoi
module.exports.loginJoi = loginJoi
