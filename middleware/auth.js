const jwt = require("jsonwebtoken");
const config = require("config");
// middleware is a function that has access to the request response cycle
//next is actually a callback that we have to run once we're done so that it moves on to the next piece of middleware
module.exports = function (req, res, next) {
  // get token from header
  const token = req.header("x-auth-token");
  // check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  // verify the token
  try {
    // to decode the token we need the original token and the jwtsecret
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    // the decoded.user will contain the decoded user id from mongodb set in (routes/api/users.js -- const payload = { user: { id: user.id, }, };)
    req.user = decoded.user;
    next();
  } catch (err) {
    // if token is not valid
    res.status(401).json({ msg: "Token is not valid" });
  }
};
