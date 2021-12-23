const mongoose = require("mongoose")
const Joi = require("joi")

const replaySchema = new mongoose.Schema({
  replay: String,
  //   replies: [
  //     {
  //       type: mongoose.Types.ObjectId,
  //       ref: "Replay",
  //     },
  //   ],
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
})

const replayJoi = Joi.object({
  replay: Joi.string().min(1).max(200),
})

const Replay = mongoose.model("Replay", replaySchema)
module.exports.Replay = Replay
module.exports.replayJoi = replayJoi
