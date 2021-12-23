const express = require("express")
const router = express.Router()
const { Post, postJoi, postEditJoi } = require("../models/Post")
const { Comment, commentJoi } = require("../models/Comment")
const checkToken = require("../middleware/checkToken")
const validateBody = require("../middleware/validateBody")
const checkId = require("../middleware/checkId")
const validateId = require("../middleware/validateid")
const { User } = require("../models/User")
const { Replay, replayJoi } = require("../models/Replay")
const { Category } = require("../models/Category")

////////POST/////////////////

////get post///
router.get("/", async (req, res) => {
  const posts = await Post.find().populate("comments").populate("categorys").populate("owner")
  res.json(posts)
})
///add post///
router.post("/", checkToken, validateBody(postJoi), async (req, res) => {
  try {
    const { image, title, description, CareWay, location, type, categorys } = req.body

    //remove duplicated
    const categorySet = new Set(categorys)

    const categoryFound = await Category.findOne({ _id: categorys })
    if (!categoryFound) return res.status(404).send("category not found")
    const post = new Post({
      image,
      title,
      description,
      CareWay,
      location,
      type,
      categorys: categorySet,
      owner: req.userId,
    })
    //add to user
    await User.findByIdAndUpdate(req.userId, { $push: { posts: post._id } })

    await post.save()
    res.json(post)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

//adit post

router.put("/:id", checkToken, checkId, validateBody(postEditJoi), async (req, res) => {
  try {
    //get body
    const { image, title, description, CareWay, location, type, categorys } = req.body

    //remove duplicated category
    const categorySet = new Set(categorys)
    const categoryFound = await Category.findOne({ _id: categorys })
    if (!categoryFound) return res.status(404).send("category not found")
    const post = await Post.findById(req.params.id)
    if (post.owner != req.userId) return res.status(404).send("unauthorized action")
    // edit post
    const Updatepost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: { image, title, description, CareWay, location, type, categorys: categorySet } },
      { new: true }
    )
    if (!Updatepost) return res.status(404).send("post not found")

    res.json(Updatepost)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
///delet post////
router.delete("/:id", checkToken, checkId, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (user.role !== "Admin" && replayFound.owner != req.userId) return res.status(403).send("unauthorized action")

    await Comment.deleteMany({ postId: req.params.id })
    const post = await Post.findByIdAndRemove(req.params.id)
    if (!post) return res.status(404).send("post not found")

    //delete from user
    await User.findByIdAndUpdate(req.userId, { $pull: { posts: post._id } })

    res.send("post removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

/////////COMMENT/////////////////
////get comment///
router.get("/:postId/comments", validateId("postId"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).send("post not found")

    const comment = await Comment.find({ postId: req.params.postId }).populate("replies")
    res.json(comment)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

///add comment///
router.post("/:postId/comments", checkToken, validateId("postId"), validateBody(commentJoi), async (req, res) => {
  try {
    const { comment } = req.body
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).send("post not found")

    const newComment = new Comment({ comment, owner: req.userId, postId: req.params.postId })
    //add to post
    await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: newComment._id } })

    //add to user
    await User.findByIdAndUpdate(req.userId, { $push: { comments: newComment._id } })

    await newComment.save()
    res.json(newComment)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

///delete comment///
router.delete("/:postId/comments/:commentId", checkToken, validateId("postId", "commentId"), async (req, res) => {
  try {
    //get post
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).send("post not found")
    //get comment
    const commentFound = await Comment.findById(req.params.commentId)
    if (!commentFound) return res.status(404).send("comment not found")
    // get user who can delete
    const user = await User.findById(req.userId)
    if (user.role !== "Admin" && commentFound.owner != req.userId) return res.status(403).send("unauthorized action")
    //delete comment from post
    await Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: commentFound._id } })
    //delete from user
    await User.findByIdAndUpdate(req.userId, { $pull: { comments: commentFound._id } })
    //delete comment
    await Comment.findByIdAndRemove(req.params.commentId)
    res.send("comment is removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

///replies///
///get replies///
router.get("/:postId/comments/:commentId/replies", validateId("postId", "commentId"), async (req, res) => {
  try {
    //find post
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).send("post not found")
    //find comment
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) return res.status(404).send("comment not found")
    //get replies
    const replay = await Replay.find({ commenttId: req.params.commentId })
    res.json(replay)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

///add replay///
router.post(
  "/:postId/comments/:commentId/replies",
  checkToken,
  validateId("postId", "commentId"),
  validateBody(replayJoi),
  async (req, res) => {
    try {
      const { replay } = req.body
      //find post
      const post = await Post.findById(req.params.postId)
      if (!post) return res.status(404).send("post not found")
      //find comment
      const comment = await Comment.findById(req.params.commentId)
      if (!comment) return res.status(404).send("comment not found")
      //add new replay
      const newReplay = new Replay({ replay, owner: req.userId, commentId: req.params.commentId })
      //add to comment
      await Comment.findByIdAndUpdate(req.params.commentId, { $push: { replies: newReplay._id } })
      //add to user
      await User.findByIdAndUpdate(req.userId, { $push: { replies: newReplay._id } })
      await newReplay.save()
      res.json(newReplay)
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)

///delete replay///
router.delete(
  "/:postId/comments/:commentId/replies/:replayId",
  checkToken,
  validateId("postId", "commentId", "replayId"),
  async (req, res) => {
    try {
      //find post
      const post = await Post.findById(req.params.postId)
      if (!post) return res.status(404).send("post not found")
      //find comment
      const comment = await Comment.findById(req.params.commentId)
      if (!comment) return res.status(404).send("comment not found")
      //get replay
      const replayFound = await Replay.findById(req.params.replayId)
      if (!replayFound) return res.status(404).send("replay not found")
      // get user who can delete
      const user = await User.findById(req.userId)
      if (user.role !== "Admin" && replayFound.owner != req.userId) return res.status(403).send("unauthorized action")
      //delete replay from comment
      await Comment.findByIdAndUpdate(req.params.commentId, { $pull: { replies: replayFound._id } })
      //delete replay from user
      await User.findByIdAndUpdate(req.userId, { $pull: { replies: replayFound._id } })
      //delete replay
      await Replay.findByIdAndRemove(req.params.replayId)
      res.send("replay is removed")
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)

////LIKES////
//add and delete like///
router.get("/:postId/likes", checkToken, validateId("postId"), async (req, res) => {
  try {
    let post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).send("post not found")

    const userFound = post.likes.find(like => like == req.userId)
    if (userFound) {
      await Post.findByIdAndUpdate(req.params.postId, { $pull: { likes: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $pull: { likes: req.params.postId } })
      res.send("removed like from post")
    } else {
      await Post.findByIdAndUpdate(req.params.postId, { $push: { likes: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $push: { likes: req.params.postId } })
      res.send("post liked")
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})
module.exports = router
