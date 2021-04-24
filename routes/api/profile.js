const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
// express-validator
const { check, validationResult } = require("express-validator/check");
// Models
const Profile = require("../../models/Profile");
const User = require("../../models/User");
//gets only the particular user's profile
// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    // find by user-get user by id- object_id of the user
    //we can populate from the user schema, we need name and avatar from the user schema
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    // if profile is present return the profile as response
    res.json(profile);
  } catch (err) {
    console.error("profile.js--error", err.message);
    res.status(500).send("Server Error");
  }
});
// @route   POST api/profile/
// @desc    Create or update user profile
// @access  Private
// Create a user profile for a particular logged in user , we get the logged in user id through JWT
//we need the auth middleware as well as the validation middleware
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // if errors are present return the errors as response
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructure from req.body
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    // Build the Profile object from request data if it is present in the request.body
    const profileFields = {};
    // we get the user id from decoded token (req.user.id)
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    // turn comma separated skills list into array
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    console.log("profileFields.skills", profileFields.skills);
    // Build social website objects if they are passed in the req.body
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    // after getting all the properties inside the profile field, we need to update and insert the data

    try {
      // find profile by user
      //user field is the object_id, we can match it to the req.user.id coming from the token
      let profile = await Profile.findOne({ user: req.user.id });
      // if profile is present we need to update
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        // send back the updated profile
        return res.json(profile);
      }
      // if profile not present we need to create it
      // Create
      profile = new Profile(profileFields);
      // save the profile
      await profile.save();
      //send back the created profile
      return res.json(profile);
    } catch (err) {
      console.error("profile-error", err.message);
      res.status(500).send("Server Error");
    }
  }
);
// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get("/", async (req, res) => {
  try {
    // populate ['name','avatar'] from user collection
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error("err.message--profile.js--GET api/profile", err.message);
    res.status(500).send("Server Error");
  }
});
// get prfiles by the user id
// @route   GET api/profile/user/user_id
// @desc    Get profiles by user ID
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    // findOne - only find one user
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    // no profile
    if (!profile) return res.status(400).json({ msg: "Profile Not Found!!!" });
    // when profile with matching id is found return the profile
    res.json(profile);
  } catch (err) {
    console.error("err.message--profile.js--GET api/profile", err.message);
    /*  the application always expects a mongoDb User object, so if we send a invalid user object 
    eg:api/profile/user/user/:1 instead of api/profile/user/6083ceca38d8734c1884c6c8
    the catch will not accept user_id 1 and will throw a server error so we need to excuse ObjectID as error message
    */
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Profile Not Found!!!" });
    }
    res.status(500).send("Server Error--Profile.js");
  }
});
module.exports = router;
