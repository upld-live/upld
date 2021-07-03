const mongoose = require('mongoose');

let reportSchema = mongoose.Schema({
	body: String,
	date: Date,
	id: Number,
	uploader: String,
});

let reportModel = mongoose.model("Report", reportSchema);
module.exports = reportModel;