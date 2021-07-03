const mongoose = require('mongoose');

let updateSchema = mongoose.Schema({
	added: String,
	changed: String,
	date: Date,
	fixed: String,
	title: String,
	uploader: String
});

let updateModel = mongoose.model("Update", updateSchema);
module.exports = updateModel;