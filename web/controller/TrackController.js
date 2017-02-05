/* global Promise */

module.exports = function(request, response)
{
	var renderPage = function(result)
	{
		response.send({
			status: true
		});
	};

	var renderError = function(error)
	{
		response.send({
			status: false,
			message: error.message
		});
	};

	// request.body:
	// [
	// {productId: '<id 1>', price: <price 1>, title: '<title 1>', date: <timestamp 1>},
	// {productId: '<id 2>', price: <price 2>, title: '<title 2>', date: <timestamp 2>},
	// ...
	// ]
	const controller = new TrackController();
	controller.track(request.body)
			.then(renderPage)
			.catch(renderError);
};

function TrackController()
{}

TrackController.prototype.track = function(productList)
{
	try
	{
		let taskChain = Promise.resolve();

		for (let i in productList)
		{
			const product = {
				productId: productList[i].productId,
				title: productList[i].title,
				latestPrice: productList[i].price
			};
			const history = {
				productId: productList[i].productId,
				price: productList[i].price,
				date: productList[i].date
			};

			taskChain = taskChain.then(() => {
				return this.trackOne(product, history);
			});
		}

		return taskChain.catch((error) => {
			return Promise.reject({message: 'TrackController.track: ' + error.message});
		});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'TrackController.track(exception): ' + e.message});
	}
};

TrackController.prototype.trackOne = function(product, history)
{
	try
	{
		const productDAO = load('web.domain.ProductDAO');
		// const historyDAO = load('web.domain.HistoryDAO');

		return productDAO.updateSert(product)
				.then((docCount) => {
					if (docCount !== 1)
					{
						return Promise.reject('TrackController.trackOne: update/insert product failed(' + product.productId + ')');
					}
					// console.log(history);
					return history;
				})
				// .then(historyDAO.insert.bind(historyDAO))
				// .then( (insertCount) => {
				// 	if (insertCount !== 1) {
				// 		return Promist.reject('TrackController.trackOne: insert history failed(' + product.productId + ')');
				// 	}
				// })
				.catch((error) => {
					return Promise.reject({message: 'TrackController.trackOne: ' + error.message});
				});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'TrackController.trackOne(exception): ' + e.message});
	}
};
