var MongoDBConnection = MongoDBConnection || {
	_connectionList: {}
};

MongoDBConnection.init = function() {
	const config = loadConfig('mongodb');
	const taskList = [];
	for (let collectionName in config) {
		const task = Promise.resolve(collectionName).then(this.get.bind(this));
		taskList.push(task);
	}
	return Promise.all(taskList);
}

MongoDBConnection.get = function(collectionName) {
	// debugger;
	if (this._connectionList[collectionName] === undefined) {
		return Promise.resolve(collectionName)
			.then(this.connect.bind(this))
			.then( (connection) => {
				this._connectionList[collectionName] = connection;
				return connection;
			})
			// .then( (connection) => {
			// 	return this.createCollection(collectionName, connection);
			// });
	} else {
		return Promise.resolve(this._connectionList[collectionName]);
	}
}

MongoDBConnection.connect = function(collectionName) {
	const assert = require('assert');

	try {
		const mongoClient = require('mongodb').MongoClient;
		let serverUrl = loadConfig('mongodb')[collectionName];
		assert(serverUrl !== undefined, 'Invalid collection name ' + collectionName);

		return new Promise( (resolve, reject) => {
			const connectCallback = function(error, connection) {
				if (error === null) {
					console.log('Create connection success: '+collectionName);
					resolve(connection);
				} else {
					console.log('Create connection fail: '+collectionName);
					reject( {message: error.message} );
				}
			};
			mongoClient.connect(serverUrl, connectCallback);
		});
	} catch(e) {
		return Promise.reject( {message: e.message} );
	}
}

// MongoDBConnection.createCollection = function(collectionName, connection) {
// 	return new Promise( (resolve, reject) => {
// 		const createCallback = function(error, results) {
// 			if (error === null) {
// 				resolve(connection);
// 			} else {
// 				reject( {message: error.message} );
// 			}
// 		}
// 		connection.createCollection(collectionName, createCallback);
// 	});
// }

module.exports = {
	connection: MongoDBConnection
}