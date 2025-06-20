const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: "Token is not valid" });
  }
}

function organizerOnly(req, res, next) {
  if (req.user.role !== "organizer")
    return res.status(403).json({ msg: "Access denied. Organizers only." });
  next();
}

function speakerOnly(req, res, next) {
  if (req.user.role !== "speaker")
    return res.status(403).json({ msg: "Access denied. Speakers only." });
  next();
}

module.exports = { auth, organizerOnly, speakerOnly };
