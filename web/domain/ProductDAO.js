/* global Promise, load */

var ProductDAO = ProductDAO || {
	dbName: 'pricetrack',
	collectionName: 'product'
};

// {productId, title, latestPrice}
ProductDAO.insert = function(products)
{
	try
	{
		return this._getCollection()
				.then((collection) => {
					return collection.insertMany(products);
				})
				.then((result) => {
					return result.insertedCount;
				})
				.catch((error) => {
					return Promise.reject({message: 'ProductDAO.insert: ' + error.message});
				});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'ProductDAO.insert(exception): ' + e.message});
	}
};

ProductDAO.updatePrice = function(productId, price)
{
	try
	{
		return this._getCollection()
				.then((collection) => {
					return collection.updateOne({productId: productId}, {$set: {latestPrice: price}});
				})
				.then((result) => {
					return result.modifiedCount;
				})
				.catch((error) => {
					return Promise.reject({message: 'ProductDAO.getByProductId: ' + error.message});
				});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'ProductDAO.getByProductId(exception): ' + e.message});
	}
};

// {productId, title, latestPrice}
ProductDAO.updateSert = function(product)
{
	try
	{
		return this._getCollection()
				.then((collection) => {
					return collection.updateOne(
					{productId: product.productId}, // filter
					{productId: product.productId, title: product.title, latestPrice: product.latestPrice}, // new values
					{upsert: true, w: 1} // insert if not exist
					);
				})
				.then((result) => {
					return result.result.n;
				})
				.catch((error) => {
					return Promise.reject({message: 'ProductDAO.updateSert: ' + error.message});
				});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'ProductDAO.updateSert(exception): ' + e.message});
	}
};

ProductDAO.getProductIds = function()
{
	try
	{
		return this._getCollection()
				.then((collection) => {
					return collection.find({}, {fields: {_id: 0, productId: 1}}).toArray();
				})
				.then((result) => {
					return result;
				})
				.catch((error) => {
					return Promise.reject({message: 'ProductDAO.getProductIds: ' + error.message});
				});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'ProductDAO.getProductIds(exception): ' + e.message});
	}
};

ProductDAO.getByProductId = function(productId)
{
	try
	{
		return this._getCollection()
				.then((collection) => {
					return collection.findOne(
					{productId: productId},
					{fields: {_id: 0, productId: 1, title: 1, latestPrice: 1}}
					);
				})
				.then((result) => {
					return result;
				})
				.catch((error) => {
					return Promise.reject({message: 'ProductDAO.getByProductId: ' + error.message});
				});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'ProductDAO.getByProductId(exception): ' + e.message});
	}
};

ProductDAO.deleteAll = function()
{
	try
	{
		return this._getCollection()
				.then((collection) => {
					return collection.deleteMany({});
				})
				.then((result) => {
					return result.deletedCount;
				})
				.catch((error) => {
					return Promise.reject({message: 'ProductDAO.deleteAll: ' + error.message});
				});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'ProductDAO.deleteAll(exception): ' + e.message});
	}
};

ProductDAO._getCollection = function()
{
	try
	{
		return load('web.domain.MongoDB').connection.get(this.dbName)
				.then((connection) => {
					return connection.collection(this.collectionName);
				})
				.catch((error) => {
					return Promise.reject('ProductDAO._getCollection: ' + error.message);
				});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'ProductDAO._getCollection(exception): ' + e.message});
	}
};

module.exports = ProductDAO;