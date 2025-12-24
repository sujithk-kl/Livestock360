const Farmer = require("../models/Farmer");
const bcrypt = require("bcryptjs");

// Register a new farmer
const registerFarmer = async (req, res) => {
	try {
		const { name, email, password, phone, village } = req.body;
		if (!name || !email || !password || !phone) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		const existing = await Farmer.findOne({ email });
		if (existing) return res.status(409).json({ message: "Email already registered" });

		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(password, salt);

		const farmer = new Farmer({ name, email, password: hashed, phone, village });
		await farmer.save();

		const out = farmer.toObject();
		delete out.password;

		res.status(201).json(out);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get list of farmers
const getFarmers = async (req, res) => {
	try {
		const farmers = await Farmer.find().select("-password");
		res.json(farmers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

module.exports = { registerFarmer, getFarmers };
