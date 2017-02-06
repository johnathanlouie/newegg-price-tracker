function handler(request, response)
{
	var HistoryDAO = load("web.domain.HistoryDAO");
	HistoryDAO.getByProductId(request.params.productId)
			.then(function(results)
			{
				response.json(results);
			});
}

// if product is not being tracked add to list of tracked products and return
// "now being tracked" and create an empty product profile
// if product was already tracked but price history is empty return

module.exports = handler;