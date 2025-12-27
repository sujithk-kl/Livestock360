const Farmer = require("../models/Farmer");
const bcrypt = require("bcryptjs");
const jwtUtil = require("../utils/jwt");

// Register a new farmer
const registerFarmer = async (req, res) => {
	try {
		// Handle both JSON and multipart/form-data (with optional file upload)
		if ((!req.body || Object.keys(req.body).length === 0) && !req.file) {
			console.warn('registerFarmer: empty req.body; headers:', req.headers);
			return res.status(400).json({ message: 'Missing request body' });
		}

		// Normalize incoming field names from frontend FormData
		const name = req.body.name || req.body.fullName || "";
		const email = req.body.email || "";
		const password = req.body.password || "";
		const phone = req.body.phone || "";
		// Map address or village fields into `village` expected by model
		const village = req.body.village || req.body.address || "";

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

		// Sign token on registration
		const payload = { id: farmer._id };
		const token = jwtUtil.signToken(payload);

		res.status(201).json({ token, farmer: out });
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

// Get current farmer (protected)
const getCurrentFarmer = async (req, res) => {
	try {
		const farmer = await Farmer.findById(req.farmerId).select("-password");
		if (!farmer) return res.status(404).json({ message: "Farmer not found" });
		res.json(farmer);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

// Login a farmer and return JWT
const loginFarmer = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: "Missing email or password" });

		const farmer = await Farmer.findOne({ email });
		if (!farmer) return res.status(401).json({ message: "Invalid credentials" });

		const match = await bcrypt.compare(password, farmer.password);
		if (!match) return res.status(401).json({ message: "Invalid credentials" });

		const payload = { id: farmer._id };
		const token = jwtUtil.signToken(payload);

		const out = farmer.toObject();
		delete out.password;

		res.json({ token, farmer: out });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

module.exports = { registerFarmer, getFarmers, loginFarmer, getCurrentFarmer };
