const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  registerFarmer,
  getFarmers,
  loginFarmer,
  getCurrentFarmer,
} = require("../controllers/farmerController");
const authMiddleware = require("../middleware/authMiddleware");

// Accept multipart/form-data for registration (optional file `idProof`)
router.post("/register", upload.single("idProof"), registerFarmer);
router.post("/login", loginFarmer);
router.get("/", getFarmers);
router.get("/me", authMiddleware, getCurrentFarmer);

module.exports = router;
