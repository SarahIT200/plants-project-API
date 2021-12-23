const mongoose = require("mongoose")
const Joi = require("joi")

const commentSchema = new mongoose.Schema({
  comment: String,
  replies: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Replay",
    },
  ],
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
})

const commentJoi = Joi.object({
  comment: Joi.string().min(1).max(200),
})

const Comment = mongoose.model("Comment", commentSchema)
module.exports.Comment = Comment
module.exports.commentJoi = commentJoi
