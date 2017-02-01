module.exports = function(request, response) {
	var renderPage = function() {
		response.send({
			status: true
		});
	};

	var renderError = function(error) {
		response.send({
			status: false,
			error: error.message
		})
	};

	// request.body:
	// [
	// {productId: '<id 1>', price: <price 1>, title: '<title 1>', date: <timestamp 1>},
	// {productId: '<id 2>', price: <price 2>, title: '<title 2>', date: <timestamp 2>},
	// ...
	// ]
	const controller = new TrackController(request.body);
	controller.track()
		.then(renderPage)
		.catch(renderError);
}

function TrackController(productList) {
	this.products = [];
	this.history = [];
	for (let i in productList) {
		this.products.push({
			productId: productList[i].productId,
			title: productList[i].title,
			latestPrice: productList[i].price
		});
	}
}

TrackController.prototype.track = function() {
	const collectionName = 'product';

	return load('web.domain.MongoDB').connection.get(collectionName)
		.then( (connection) => {
			const collection = connection.collection(collectionName);
			return this.insert(collection, this.products);
		})
		.then( (result) => {
			return result;
		})
}

TrackController.prototype.insert = function(collection, docs) {
	return new Promise( (resolve, reject) => {
		const insertCallback = function(error, result) {
			if (error === null) {
				resolve(result);
			} else {
				reject( {message: error.message} );
			}
		};
		collection.insertMany(docs, insertCallback);
	});
}
