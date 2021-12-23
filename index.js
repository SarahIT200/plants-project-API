const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
const Joi = require("joi")
const JoiObjectId = require("joi-objectid")
Joi.objectid = JoiObjectId(Joi)

const users = require("./routes/users")
const posts = require("./routes/posts")
const categorys = require("./routes/category")
mongoose
  .connect("mongodb://localhost:27017/plantsDB")
  .then(() => {
    console.log("connected to database")
  })
  .catch(error => {
    console.log("Error connect to mangoDb" + error)
  })

const app = express()
app.use(express.json())
app.use(cors())

app.use("/api/auth", users)
app.use("/api/posts", posts)
app.use("/api/categorys", categorys)

const port = 5000
app.listen(port, () => console.log("server is lestining on port " + port))
