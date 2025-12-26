const express = require("express");
const router = express.Router();
const {
  registerFarmer,
  getFarmers,
  loginFarmer,
  getCurrentFarmer,
} = require("../controllers/farmerController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerFarmer);
router.post("/login", loginFarmer);
router.get("/", getFarmers);
router.get("/me", authMiddleware, getCurrentFarmer);

module.exports = router;
