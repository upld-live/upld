const shortid = require('shortid');
const mongoURL = require('../server/config.json').mongoURL;

const mongoose = require('mongoose');

//connect to MongoDB
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

const con = mongoose.connection;

con.on('error', console.error.bind(console, 'connection error:'));
con.once('open', async () => {
	console.log('MongoDB connected');
});

let buildSchema = mongoose.Schema({
	compilationDate: Date,
	id: String,
});

let buildModel = mongoose.model("Build", buildSchema);

let buildID = shortid();
console.log(buildID);

(async () => {
	await buildModel.create(new buildModel({
		compilationDate: new Date(),
		id: buildID,
	}));

	process.exit(0);
})();                    