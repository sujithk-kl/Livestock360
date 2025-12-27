const express = require("express");
const router = express.Router();
const { registerCustomer, loginCustomer } = require("../controllers/customerController");

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

module.exports = router;
