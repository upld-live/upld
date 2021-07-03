const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
	dateCreated: Date,
	email: String,
	embedColor: { type: String, default: "000000" },
	ip: { type: String, default: "" },
	isAdmin: { type: Boolean, default: false },
	isEmbed: { type: Boolean, default: true },
	isTerminated: { type: Boolean, default: false },
	isUpgraded: { type: Boolean, default: false },
	password: String,
	pfp: { type: String, default: "https://cdn.upld.live/pfp/default.png" },
	secretKey: String,
	subdomainsOwned: { type: Number, default: 0 },
	uploadKey: String,
	userAgent: { type: String, default: "" },
	username: String,
});

let userModel = mongoose.model("User", userSchema);
module.exports = userModel;