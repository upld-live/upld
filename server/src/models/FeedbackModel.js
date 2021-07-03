const mongoose = require('mongoose');

let feedbackSchema = mongoose.Schema({
	body: String,
	date: Date,
	id: Number,
	uploader: String,
});

let feedbackModel = mongoose.model("Feedback", feedbackSchema);
module.exports = feedbackModel;