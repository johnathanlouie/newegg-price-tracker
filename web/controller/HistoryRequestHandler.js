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
{
	this.STATUS_EXIST = 1;
	this.STATUS_NOT_EXIST = 2;
}

Handler.prototype.getHistory = function(productId)
{
	const self = this;
	function good(results)
	{
		if (results === null)
		{	// Product has not been tracked
			const historyDao = load("web.domain.HistoryDAO");
			return historyDao.insertEmpty(productId)
				.then( (insertResult) => {
					if (insertResult.count !== 1)
					{
						return Promise.reject({message: 'HistoryRequestHandler: fail to insert'});
					}
					else
					{
						return {status: self.STATUS_NOT_EXIST, product: insertResult.product};
					}
				});
		}
		else
		{
			return {status: self.STATUS_EXIST, product: results};
		}
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

// Not being tracked: {status: 2, product: <empty product profile>}
// Tracked: {status: 1, product: <product profile>}, <product profile> could be an empty one

