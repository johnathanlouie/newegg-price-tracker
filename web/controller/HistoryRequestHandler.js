/* global Promise */

module.exports = function(request, response)
{
	function success(result)
	{
		response.json(result);
	}

	function fail(err)
	{
		response.json({status: false, message: err.message});
	}

	const handler = new Handler();
	handler.getHistory(request.params.productId).then(success).catch(fail);
};

function Handler()
{}

Handler.prototype.getHistory = function(productId)
{
	function good(results)
	{
		return results;
	}
	function bad(err)
	{
		Promise.reject({message: "HistoryRequestHandler: " + err.message});
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
