const express = require("express");
const router = express.Router();
const {
  registerFarmer,
  getFarmers,
} = require("../controllers/farmerController");

router.post("/register", registerFarmer);
router.get("/", getFarmers);

module.exports = router;
