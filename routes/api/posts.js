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

module.exports = router;
