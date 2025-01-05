// middleware/checkAuth.js
exports.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("User is not logged in.");
  return res.status(401).send('Access Denied'); // or redirect to login page
};
