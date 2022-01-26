const mongoose = require("mongoose")
const Joi = require("joi")

const commentSchema = new mongoose.Schema({
  comment: String,
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "post",
  },
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
