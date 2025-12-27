const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwtUtil = require("../utils/jwt");

// Register a new customer
const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Customer.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const customer = new Customer({ name, email, password: hashed, phone, address });
    await customer.save();

    const out = customer.toObject();
    delete out.password;

    const token = jwtUtil.signToken({ id: customer._id });
    res.status(201).json({ token, customer: out });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login customer
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Missing email or password" });

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, customer.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwtUtil.signToken({ id: customer._id });
    const out = customer.toObject();
    delete out.password;

    res.json({ token, customer: out });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerCustomer, loginCustomer };
