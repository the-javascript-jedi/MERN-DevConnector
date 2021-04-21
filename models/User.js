const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // we want email to be unique so we set unique:true
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    // the default date is set to the current date
    default: Date.now,
  },
});
// User variable is set to mongoose.model which takes 2 things( 'user'-model name and 'UserSchema'-schema)
module.exports = User = mongoose.model("user", UserSchema);
