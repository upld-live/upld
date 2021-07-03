const mongoose = require('mongoose');

const domainSchema = mongoose.Schema({
	dateCreated: Date,
	host: String,
	isHost: { type: Boolean, default: false },
	owner: String,
	sub: String,
});

const domainModel = mongoose.model("Domain", domainSchema);
module.exports = domainModel;