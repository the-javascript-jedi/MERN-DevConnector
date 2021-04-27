const express = require("express");
const router = express.Router();
// express-validator
const { check, validationResult } = require("express-validator");
// auth middleware
const auth = require("../../middleware/auth");
// Models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  "/",
  [auth, [check("text", "Text is Required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    console.log("errors", errors);
    // if errors are found send the errors as response
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // get name and avatar and user using the jwt token
      const user = await User.findById(req.user.id).select("-password");
      // newPost object created
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      // save the created post
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    // find and sort posts by most recent=(date:-1),oldest first=(date:1)
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    // find post by id
    const post = await Post.findById(req.params.id);
    // if post is not present send back error response
    if (!post) {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    // if id is not a valid formatted mongodb object id return post not found
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post Not Found" });
    }
    res.status(500).send("Server Error");
  }
});
// @route   DELETE api/posts/:id
// @desc    Delete a Post
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // find post by id
    const post = await Post.findById(req.params.id);
    // if post is not present send back error response
    if (!post) {
      return res.status(404).json({ msg: "Post Not found" });
    }
    console.log("post--DELETE api/posts/:id", post);
    // make sure the user deleting the post is the user that owns the post
    // check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User Not Authorized" });
    }
    // remove the post
    await post.remove();
    res.json({ msg: "Post Removed" });
  } catch (err) {
    console.error(err.message);
    // if id is not a valid formatted mongodb object id return post not found
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post Not Found" });
    }
    res.status(500).send("Server Error");
  }
});
// @route   PUT api/posts/like/:id
// @desc    Like a Post
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    // find the post by id
    const post = await Post.findById(req.params.id);
    // check if the post has already been liked by the user
    // compare current iteration of the user to the user that is logged in
    //console.log("req.user--from middleware auth", req.user);
    //req.user--from middleware auth, { id: '6083ceca38d8734c1884c6c7' }
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post Already Liked" });
    }
    // if post is not already liked by the user, add the user to the likes array
    post.likes.unshift({ user: req.user.id });
    // save it to db
    await post.save();
    // return response with likes
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// @route   PUT api/posts/unlike/:id
// @desc    Unlike a Post
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    // find the post by id
    const post = await Post.findById(req.params.id);
    // check if the post has already been liked by the user--for unliking user id should not be present in likes array so filter check should not return anything
    // compare current iteration of the user to the user that is logged in
    //console.log("req.user--from middleware auth", req.user);
    //req.user--from middleware auth, { id: '6083ceca38d8734c1884c6c7' }
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post Has Not Yet Been Liked!" });
    }
    // get Remove Index to remove from the liked array
    //find the index of like to be removed by the user who liked it
    const removeIndex = post.likes
      .map((like) => {
        // console.log("like", like);
        //like { _id: 60882bbffab16d63b03909e6, user: 6083d2d638d8734c1884c6ca }
        return like.user.toString();
      })
      .indexOf(req.user.id);
    // splice the post to be removed from the array
    post.likes.splice(removeIndex, 1);
    // save it to db
    await post.save();
    // return response with likes
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
