const express = require("express")
const router = express.Router()
const checkToken = require("../middleware/checkToken")
const validateBody = require("../middleware/validateBody")
const checkId = require("../middleware/checkId")
const validateId = require("../middleware/validateid")
const { Category, categoryJoi } = require("../models/Category")
const checkAdmin = require("../middleware/checkAdmin")

router.get("/", async (req, res) => {
  const category = await Category.find()
  res.json(category)
})

router.post("/", checkAdmin, validateBody(categoryJoi), async (req, res) => {
  try {
    const { name } = req.body

    const category = new Category({
      name,
    })

    await category.save()
    res.json(category)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete("/:id", checkAdmin, checkId, async (req, res) => {
  try {
    const category = await Category.findByIdAndRemove(req.params.id)
    if (!category) return res.status(404).send("category not found")
    res.send(error.message)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
module.exports = router
