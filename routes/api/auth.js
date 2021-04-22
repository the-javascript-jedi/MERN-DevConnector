const express = require("express");
const router = express.Router();
// bring in middleware
const auth = require("../../middleware/auth");
// bcrypt for password encryption
const bcrypt = require("bcryptjs");
// bring jwt token
const jwt = require("jsonwebtoken");
// config to get the jwt secret
const config = require("config");
// express-validator
const { check, validationResult } = require("express-validator/check");
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

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
// for using express validation we add check as a second parameter to POST
router.post(
  "/",
  [
    check("email", "please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  // since we are using await to make mongo-db calls we need to declare this function as async
  async (req, res) => {
    // to access the req.body we need to use the body-parser(express.json) in server.js
    console.log("req.body", req.body);
    // handle the response to check for errors
    const errors = validationResult(req);
    //if there are errors return a response of 400(Bad Request) with the errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructuring of body
    const { email, password } = req.body;
    try {
      // See If user exists --  if no user send back an error
      let user = await User.findOne({ email: email });
      if (!user) {
        // user email already exists
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      console.log("user--auth.js", user);
      // we need to match user email and password and make sure they match
      //bcrypt has a method called compare() which takes a plain text password and a encrypted password and compares them to check if they are the same
      //compare returns a promise so the function needs to be async to use an await keyword within
      //compare takes two parameters (1-the plain text password the user enters,2-the encrypted password from db)
      const isMatch = await bcrypt.compare(password, user.password);
      // if password is not matched we need to throw an error
      if (!isMatch) {
        // user email already exists
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      //return jsonwebtoken--in the front end when a user registers/logins we want them to get logged in right away, and in order to be logged in we need that token.
      const payload = {
        user: {
          id: user.id, //user.id is the _id we receive from mongodb promise, since we use mongoose we can directly use.id insted of ._id
        },
      };
      // json web token
      // inside the callback (err, token), we get either the err or the token,if no error we send the token back to the client with the user id as a payload
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            throw err;
          } else {
            res.json({ token });
          }
        }
      );
    } catch (err) {
      console.error("err.message", err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
// jeeva token -eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjA4MGQ2OTY5MThjODcxNzM0MTBjNmQ1In0sImlhdCI6MTYxOTA1NjI3OSwiZXhwIjoxNjE5NDE2Mjc5fQ.LWEiq9-DOQKuSIysUWAgyiH10ymcbrwGURpolIAfLSA
