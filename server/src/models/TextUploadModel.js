const mongoose = require('mongoose');

let fileSchema = mongoose.Schema({
	dateCreated: Date,
	deletionId: String,
	domain: String,
	id: String,
	uploader: String,
    body: String,
});

let fileModel = mongoose.model("File", fileSchema);
module.exports = fileModel;