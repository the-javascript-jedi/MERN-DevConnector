const express = require("express");
const router = express.Router();
// bring in middleware
const auth = require("../../middleware/auth");
// bring in User model
const User = require("../../models/User");

// @route   GET api/auth
// @desc    Test route
// @access  Public
// we add the auth middleware before (req,res) to ensure the route is a protected route
router.get("/", auth, async (req, res) => {
  try {
    // findById-since this is a protected route, from previous middleware we get the decoded token which has the id
    //we can simply pass in req.user.id
    // .select("-password") - we don't need the password so using -password will leave of the password in the data
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
// jeeva token -eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjA4MGQ2OTY5MThjODcxNzM0MTBjNmQ1In0sImlhdCI6MTYxOTA1NjI3OSwiZXhwIjoxNjE5NDE2Mjc5fQ.LWEiq9-DOQKuSIysUWAgyiH10ymcbrwGURpolIAfLSA
