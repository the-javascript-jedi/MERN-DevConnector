const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  // we want post to be connected to a user
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  text: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  likes: [
    {
      // we will know which likes came from which user
      // a single user can also like a post only once
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
      //   date of comments
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // date of posts
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = Post = mongoose.model("post", PostSchema);
