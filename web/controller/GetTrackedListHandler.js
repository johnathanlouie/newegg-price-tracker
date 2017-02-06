/* This is a handler for getting a list of tracked product IDs. */
function handler(request, response)
{
	function good(list)
	{
		response.json(list);
	}
	function bad(err)
	{
		console.log("GetTrackedListHandler error: " + err.message);
		response.json({status: false});
	}
	try
	{
		var dao = load("web.domain.HistoryDAO");
		dao.getProductIds().then(good).catch(bad);
	}
	catch (err)
	{
		console.log("GetTrackedListHandler error: " + err.message);
		response.json({status: false});
	}
}

module.exports = handler;