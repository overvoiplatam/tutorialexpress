var confCC = require("../configs.js");
var MongoClient = require('mongodb').MongoClient;

module.exports = function (conf, opts) {
	if (typeof conf.url !== 'string') {
		throw new TypeError('Expected uri to be a string');
	}

	opts = opts || {};
	var property = opts.property || 'db';
	delete opts.property;

	var connection;

	return function expressMongoDb(req, res, next) {
		if (!connection) {
			connection = MongoClient.connect(conf.url, opts);
		}

		connection
			.then(function (db) {
				req[property] = db.db(conf.database);
				next();
			})
			.catch(function (err) {
				connection = undefined;
				next(err);
			});
	};
};
