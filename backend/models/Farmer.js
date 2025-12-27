const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    village: {
      type: String,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    farmName: {
      type: String,
    },
    farmLocation: {
      type: String,
    },
    farmingType: {
      type: String,
    },
    landArea: {
      type: String,
    },
    aadhaar: {
      type: String,
    },
    idProof: {
      type: String,
    },
    acceptTerms: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farmer", farmerSchema);
