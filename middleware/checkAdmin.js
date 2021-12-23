const jwt = require("jsonwebtoken")
const { User } = require("../models/User")

const checkAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")
    if (!token) return res.status(401).send("token is missing")

    const decryptedTokwe = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decryptedTokwe.id

    const AdminFound = await User.findById(userId)
    if (!AdminFound) return res.status(404).send("user not found")

    // req.userId = userId
    if (AdminFound.role !== "Admin") return res.status(403).send("you are not admin")
    next()
  } catch (error) {
    res.status(500).send(error.message)
  }
}

module.exports = checkAdmin
