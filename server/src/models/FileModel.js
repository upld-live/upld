const mongoose = require('mongoose');

let fileSchema = mongoose.Schema({
	dateCreated: Date,
	deletionId: String,
	domain: String,
	extension: String,
	id: String,
	originalName: String,
	uploader: String,
	isNSFW: Boolean,
	isSafe: { type: Boolean, default: false },
	views: { type: Number, default: 0 }
});

let fileModel = mongoose.model("File", fileSchema);
module.exports = fileModel;