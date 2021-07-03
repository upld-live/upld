const mongoose = require('mongoose');

let auditSchema = mongoose.Schema({
	action: Number,
	aString: String,
	date: Date,
	description: String,
	id: String,
	ip: String,
	user: String,
});

let auditModel = mongoose.model("Audit", auditSchema);
module.exports = auditModel;