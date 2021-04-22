const express = require("express");
const router = express.Router();
// gravatar packages--links user email with an avatar package
const gravatar = require("gravatar");
// bcrypt for password encryption
const bcrypt = require("bcryptjs");
// bring jwt token
const jwt = require("jsonwebtoken");
// config to get the jwt secret
const config = require("config");
// express-validator
const { check, validationResult } = require("express-validator/check");
// User Model
const User = require("../../models/User");

// @route   POST api/users
// @desc    Test route
// @access  Public
// Registration route
// for using express validation we add check as a second parameter to POST
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
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
    const { name, email, password } = req.body;
    try {
      // See If user exists --  because we must not reuse same emails
      let user = await User.findOne({ email: email });
      if (user) {
        // user email already exists
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }
      console.log("user", user);
      //Get users gravitar
      const avatar = gravatar.url(email, {
        s: "200", //size of gravatar
        r: "pg", //rating-pg
        d: "mm", //default:some deafult user icon is loaded
      });
      //Encrypt password
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // create salt for encrypting using bcrypt
      //pass in (10) for 10 rounds
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      console.log("user", user);
      // save to db--this will return a promise so we use await keyword (else we have to use .then())
      await user.save();
      //return jsonwebtoken--in the front end when a user registers we want them to get logged in right away, and in order to be logged in we need that token.
      //res.send("User Registered--Success");
      const payload = {
        user: {
          id: user.id, //user.id is the _id we receive from mongodb promise, since we use mongoose we can directly use.id insted of ._id
        },
      };
      // json web token
      // inside the callback (err, token), we get either the err or the token,if no error we send the token back to the client
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
