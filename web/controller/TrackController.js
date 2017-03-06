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
	// {productId: '<id 1>', price: <price 1>, title: '<title 1>', timestamp: <timestamp 1>, images: ['url1', 'url2', ...]},
	// {productId: '<id 2>', price: <price 2>, title: '<title 2>', timestamp: <timestamp 2>, images: ['url1', 'url2', ...]},
	// ...
	// ]
	const controller = new TrackController();
	controller.track(request.body).then(renderPage).catch(renderError);
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
				images: productList[i].images,
				price: productList[i].price,
				timestamp: new Date(productList[i].timestamp)
			};

			taskChain = taskChain.then(() => {
				return this.trackOne(product);
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

TrackController.prototype.trackOne = function(product)
{
	try
	{
		const historyDAO = load('web.domain.HistoryDAO');

		let taskChain;
		if (product.title === undefined || product.title.length === 0)
		{	// Add new product to be tracked
			taskChain = historyDAO.insertEmpty(product.productId)
				.then((docCount) => {
					if (docCount !== 1)
					{
						return Promise.reject('TrackController.trackOne: add product failed(' + product.productId + ')');
					}
					return true;
				})
				.catch((error) => {
					return Promise.reject({message: 'TrackController.trackOne: ' + error.message});
				});
		}
		else
		{	// Update product detail and price history
			taskChain = historyDAO.update(product)
				.then((docCount) => {
					if (docCount !== 1)
					{
						return Promise.reject('TrackController.trackOne: update product failed(' + product.productId + ')');
					}
					return true;
				})
				.catch((error) => {
					return Promise.reject({message: 'TrackController.trackOne: ' + error.message});
				});
		}
		return taskChain;
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'TrackController.trackOne(exception): ' + e.message});
	}
};
