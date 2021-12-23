const mongoose = require("mongoose")
const Jio = require("joi")
const Joi = require("joi")

const categorySchema = new mongoose.Schema({
  name: String,
})

const categoryJoi = Joi.object({
  name: Joi.string().min(1).max(200).required(),
})

const Category = mongoose.model("Category", categorySchema)

module.exports.Category = Category
module.exports.categoryJoi = categoryJoi
