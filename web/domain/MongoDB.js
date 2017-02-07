/* global Promise */

var MongoDBConnection = MongoDBConnection || {
	_connectionList: {}
};

MongoDBConnection.init = function()
{
	const config = loadConfig('mongodb');
	const taskList = [];
	for (let dbName in config)
	{
		const task = Promise.resolve(dbName).then(this.get.bind(this));
		taskList.push(task);
	}
	return Promise.all(taskList).catch((error) => {
		Promise.reject(error);
	});
};

MongoDBConnection.close = function()
{
	const config = loadConfig('mongodb');
	const taskList = [];
	for (let dbName in config)
	{
		const task = Promise.resolve(dbName)
			.then(this.get.bind(this))
			.then((connection) => {
				connection.close();
			});
		taskList.push(task);
	}
	return Promise.all(taskList).catch((error) => {
		Promise.reject(error);
	});
};

MongoDBConnection.get = function(dbName)
{
	// debugger;
	if (this._connectionList[dbName] === undefined)
	{
		return Promise.resolve(dbName)
			.then(this.connect.bind(this))
			.then((connection) => {
				this._connectionList[dbName] = connection;
				return connection;
			})
			.catch((error) => {
				return Promise.reject({message: 'MongoDBConnection.get: ' + error.message});
			});
	}
	else
	{
		return Promise.resolve(this._connectionList[dbName]);
	}
};

MongoDBConnection.connect = function(dbName)
{
	const assert = require('assert');

	try
	{
		const mongoClient = require('mongodb').MongoClient;
		// Read configuration
		let serverUrl = loadConfig('mongodb')[dbName];
		assert(serverUrl !== undefined, 'Invalid collection name ' + dbName);

		// Connect to DB
		return mongoClient.connect(serverUrl)
			.then((connection) => { // Success
				// console.log('Create connection success: '+dbName);
				return connection;
			})
			.catch((error) => { // Fail
				console.log('Create connection fail: ' + dbName);
				reject({message: error.message});
			});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'MongoDBConnection.connect(exception): ' + e.message});
	}
};

module.exports = {
	connection: MongoDBConnection
};