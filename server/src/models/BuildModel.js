const mongoose = require('mongoose');

let buildSchema = mongoose.Schema({
	compilationDate: Date,
	id: String,
});

let buildModel = mongoose.model("Build", buildSchema);
module.exports = buildModel;