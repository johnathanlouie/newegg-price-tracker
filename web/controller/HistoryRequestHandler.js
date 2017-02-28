/* global Promise */

module.exports = function(request, response)
{
	function success(result)
	{
		response.json(result);
	}

	function fail(err)
	{
		response.json({error: err.message});
	}

	const handler = new Handler();
	handler.getHistory(request.params.productId).then(success).catch(fail);
};

function Handler()
{
}

Handler.prototype.getHistory = function(productId)
{
	const self = this;
	function good(results)
	{
		if (results === null)
		{	// Product has not been tracked
			const extractBiz = load('domain.ProductExtractBiz');
			const historyDao = load("web.domain.HistoryDAO");

			return Promise.resolve(productId)
				.then(extractBiz.getProductUrl.bind(extractBiz))
				.then(extractBiz.loadProductPage.bind(extractBiz))
				.then( (pageContent) => {
					return extractBiz.extract(productId, pageContent);
				})
				.then(historyDao.insert.bind(historyDao))
				.then( (insertResult) => {
					if (insertResult.count !== 1)
					{
						return Promise.reject({message: 'HistoryRequestHandler: insert failed'});
					}
					else
					{
						return insertResult.product;
					}
				});
		}
		else
		{
			// Sort price history
			const compare = function(a, b)
			{
				return b.timestamp.getTime() - a.timestamp.getTime();
			};
			results.history.sort(compare);
			return results;
		}
	}
	function bad(err)
	{
		return Promise.reject({message: "HistoryRequestHandler: " + err.message});
	}

	try
	{
		const historyDao = load("web.domain.HistoryDAO");
		return historyDao.getByProductId(productId).then(good).catch(bad);
	}
	catch (err)
	{
		console.log(err);
		return Promise.reject({message: 'HistoryRequestHandler(exception): ' + err.message});
	}
};

// if product is not being tracked add to list of tracked products and return
// "now being tracked" and create an empty product profile
// if product was already tracked but price history is empty return


