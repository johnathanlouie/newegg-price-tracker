/* global Promise, load */

var HistoryDAO = HistoryDAO || {
	dbName: 'pricetrack',
	collectionName: 'history'
};
HistoryDAO.getByProductId = function(productId)
{
	function good(collection)
	{
		return collection.findOne({productId: productId}, {_id: false});
	}
	function bad(error)
	{
		return Promise.reject({message: 'HistoryDAO.getByProductId: ' + error.message});
	}
	try
	{
		return this._getCollection().then(good).catch(bad);
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'HistoryDAO.getByProductId(exception): ' + e.message});
	}
};

HistoryDAO.getProductIds = function()
{
	function good(collection)
	{
		var cursor = collection.find({}, {_id: false, productId: true});
		return cursor.toArray();

	}
	function good2(z)
	{
		var list = [];
		for (let i of z)
		{
			list.push(i.productId);
		}
		return list;
	}
	function bad(error)
	{
		console.log("HistoryDAO getProductIds bad " + error);
		return Promise.reject({message: 'HistoryDAO.getProductIds: ' + error.message});
	}
	try
	{
		return this._getCollection().then(good).then(good2).catch(bad);
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'HistoryDAO.getProductIds(exception): ' + e.message});
	}
};

HistoryDAO._getCollection = function()
{
	var good = (connection) =>
	{
		return connection.collection(this.collectionName);
	};
	function bad(error)
	{
		return Promise.reject('HistoryDAO._getCollection: ' + error.message);
	}
	try
	{
		return load('web.domain.MongoDB').connection.get(this.dbName).then(good).catch(bad);
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'HistoryDAO._getCollection(exception): ' + e.message});
	}
};

module.exports = HistoryDAO;