module.exports = function(request, response) {
	var renderPage = function(result) {
		response.send({
			status: true,
			result: result
		});
	};

	var renderError = function(error) {
		response.send({
			status: false,
			message: error.message
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

		this.history.push({
			productId: productList[i].productId,
			price: productList[i].price,
			date: productList[i].date
		});
	}
}

TrackController.prototype.track = function() {
	try {
		// Insert product
		const addProduct = load('web.domain.ProductDAO').insert(this.products)
		.then( (insertCount) => {
			return insertCount;
		})
		.catch( (error) => {
			return Promise.reject( {message: error.message} );
		});

		// TODO: Insert price history
		const addHistory = Promise.resolve( {} );

		return Promise.all([addProduct, addHistory])
		.then( ([productCount, historyReturn]) => {
			return {productCount: productCount, history: historyReturn};
		})
		.catch( (error) => {
			return Promise.reject( {message: error.message} );
		});
	} catch(error) {
		console.log(error);
		return Promise.reject( {message: 'TrackController.track(exception): ' + error.message} );		
	}
}
