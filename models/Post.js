const mongoose = require("mongoose")
const Joi = require("joi")

const postSchema = new mongoose.Schema({
  image: String,
  title: String,
  description: String,
  CareWay: String,
  categorys: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
  },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  ],
  type: {
    type: String,
    enum: ["article", "quistion"],
  },
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  location: [{ type: String }],

  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
})

const postJoi = Joi.object({
  image: Joi.string().uri().min(8).max(1000),
  title: Joi.string().min(8).max(1000),
  description: Joi.string().min(8).max(1000).required(),
  CareWay: Joi.string().min(8).max(1000),
  location: Joi.array().items(Joi.string()).min(1),
  type: Joi.string().required(),
  categorys: Joi.objectid().required(),
})

const postEditJoi = Joi.object({
  image: Joi.string().uri().min(8).max(1000),
  title: Joi.string().min(8).max(1000),
  description: Joi.string().min(8).max(1000),
  CareWay: Joi.string().min(8).max(1000),
  location: Joi.array().items(Joi.string()).min(1),
  type: Joi.string(),
  categorys: Joi.objectid(),
})

const Post = mongoose.model("Post", postSchema)
module.exports.Post = Post
module.exports.postJoi = postJoi
module.exports.postEditJoi = postEditJoi
